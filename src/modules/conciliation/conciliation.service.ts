import { Injectable } from '@nestjs/common';
import type { ValidatedAddressDto } from '../../common/dto/validatedAddress.dto';
import { defaultConciliationPolicy } from './policy';
import type { AddressField, ConciliationResultMeta, FieldDecision, Provenance } from './types';
import { approxInOriginal, fuzzyEqual } from './util';
import { PinoLogger } from 'nestjs-pino';

export interface ConciliationInput {
  original: string;
  baseline: ValidatedAddressDto; // parsed address before any external checks
  source?: ValidatedAddressDto | null; // result from Source-Check orchestrator
  llm?: ValidatedAddressDto | null; // result from LLM orchestrator
}

@Injectable()
export class ConciliationService {
  constructor(private readonly logger: PinoLogger){
    this.logger.setContext(ConciliationService.name);
  }

  // Compute field-level decision using weighted voting + consensus boost.
  private decideField<T extends string | number>(
    field: AddressField,
    baseline: ValidatedAddressDto,
    source?: ValidatedAddressDto | null,
    llm?: ValidatedAddressDto | null,
    originalText?: string,
  ): FieldDecision<T> {
    const policy = defaultConciliationPolicy;

    const getVal = (obj: any, key: AddressField): any => obj ? (obj as any)[key] : undefined;
    const bVal = getVal(baseline, field) as T | undefined;
    const sVal = getVal(source, field) as T | undefined;
    const lVal = getVal(llm, field) as T | undefined;

    // Normalize for comparison (strings trimmed/lowercased, numbers as-is)
    const norm = (v: any) => {
      if (v === undefined || v === null) return undefined;
      if (typeof v === 'number') return v;
      return String(v).trim().toLowerCase();
    };

    // Candidates with source weights (merge by fuzzy equality for strings)
    const candidates = new Map<string | number, { value: T; weight: number; provs: Provenance[] }>();
    const add = (val: T | undefined, w: number, prov: Provenance) => {
      if (val === undefined || val === null || (typeof val === 'string' && val === '')) return;
      // Try to merge with existing candidate by fuzzy match (only for strings)
      let merged = false;
      if (typeof val === 'string') {
        for (const [k, existing] of candidates) {
          if (typeof existing.value === 'string' && fuzzyEqual(existing.value as any, val as any, policy.fuzzyMaxDistance)) {
            existing.weight += w;
            if (!existing.provs.includes(prov)) existing.provs.push(prov);
            merged = true;
            break;
          }
        }
      }
      if (!merged) {
        const key = typeof val === 'number' ? (val as any) : (norm(val) as any);
        const current = candidates.get(key);
        if (current) {
          current.weight += w;
          if (!current.provs.includes(prov)) current.provs.push(prov);
        } else {
          candidates.set(key, { value: val, weight: w, provs: [prov] });
        }
      }
    };

    // If LLM is present, ignore parsing per rules (LLM acts as a better parser)
    const hasLLM = !!llm;
    if (!hasLLM) add(bVal as T, policy.weights.parsing, 'parsing');
    add(sVal as T, policy.weights.source_check, 'source_check');
    if (hasLLM) add(lVal as T, policy.weights.llm, 'llm');

    // Consensus boost if two or more agree
    for (const entry of candidates.values()) {
      if (entry.provs.length >= 2) {
        entry.weight += policy.agreementBoost;
      }
    }

    // Conflict penalty if fully split
    const distinct = candidates.size;
    if (distinct >= 3) {
      for (const entry of candidates.values()) entry.weight = Math.max(0, entry.weight - policy.conflictPenalty);
    }

    // Pick the highest weight; break ties preferring source_check, then consensus count, then llm, then baseline
    const sorted = Array.from(candidates.values()).sort((a, b) => {
      if (b.weight !== a.weight) return b.weight - a.weight;
      const pref = (e: { provs: Provenance[] }) => (
        (e.provs.includes('source_check') ? 4 : 0) +
        (e.provs.length >= 2 ? 2 : 0) +
        (e.provs.includes('llm') ? 1 : 0)
      );
      return pref(b) - pref(a);
    });

    const best = sorted[0] ?? { value: (bVal as T)!, weight: 0, provs: ['parsing' as Provenance] };
    // Bonus if the chosen string appears in original text approximately
    let confidence = Math.max(0, Math.min(1, best.weight));
    if (originalText && typeof best.value === 'string') {
      if (approxInOriginal(originalText, best.value, policy.fuzzyMaxDistance)) {
        confidence = Math.min(1, confidence + policy.foundInOriginalBonus);
      }
    }
    const provenance: Provenance = best.provs.length >= 2 ? 'consensus' : best.provs[0] ?? 'parsing';

    return {
      value: best.value,
      confidence,
      provenance,
      sources: {
        parsing: bVal as T,
        source_check: sVal as T,
        llm: lVal as T,
      },
    } as FieldDecision<T>;
  }

  // Public API that returns both the reconciled DTO and meta decisions per field.
  async reconcileWithMeta(input: ConciliationInput): Promise<{ dto: ValidatedAddressDto; meta: ConciliationResultMeta; unresolvedFields: AddressField[] }> {
    const { baseline, source, llm, original } = input;

    // Early exit: if parsing and source-check highly agree, use source-check and stop
    if (source) {
      const core: AddressField[] = ['street', 'number', 'city', 'state', 'zipCode'];
      let agree = 0, total = 0;
      for (const f of core) {
        const a: any = (baseline as any)[f];
        const b: any = (source as any)[f];
        total++;
        if (fuzzyEqual(a as any, b as any, defaultConciliationPolicy.fuzzyMaxDistance)) agree++;
      }
      const ratio = total ? agree / total : 0;
      if (ratio >= defaultConciliationPolicy.earlyExitAgreementRatio) {
        // Build meta marking source_check as provenance with high confidence
        const mk = <T>(val: T): FieldDecision<T> => ({
          value: val,
          confidence: 0.9,
          provenance: 'source_check',
          sources: { source_check: val },
        });
        const fields: ConciliationResultMeta['fields'] = {
          street: mk(source.street || ''),
          complement: mk(source.complement || ''),
          neighbourhood: mk(source.neighbourhood || ''),
          number: mk(source.number || 0) as any,
          city: mk(source.city || ''),
          state: mk(source.state || ''),
          zipCode: mk(source.zipCode || ''),
          type: mk(source.type) as any,
          validationStatus: mk(source.validationStatus) as any,
        } as any;
        const meta: ConciliationResultMeta = {
          fields,
          overallConfidence: 0.9,
        };
        return { dto: source as ValidatedAddressDto, meta, unresolvedFields: [] };
      }
    }

    const fields: ConciliationResultMeta['fields'] = {
      street: this.decideField('street', baseline, source, llm, original),
      complement: this.decideField('complement', baseline, source, llm, original),
      neighbourhood: this.decideField('neighbourhood', baseline, source, llm, original),
      number: this.decideField('number', baseline, source, llm, original),
      city: this.decideField('city', baseline, source, llm, original),
      state: this.decideField('state', baseline, source, llm, original),
      zipCode: this.decideField('zipCode', baseline, source, llm, original),
      type: this.decideField('type', baseline, source, llm, original),
      validationStatus: this.decideField('validationStatus', baseline, source, llm, original),
    } as any;

    const policy = defaultConciliationPolicy;
    const unresolved: AddressField[] = [];
    const pick = <T>(fd: FieldDecision<T>, fallback: T): T => {
      if (fd.confidence >= policy.acceptThreshold) return fd.value;
      unresolved.push(undefined as any); // temporary marker; will fix below
      return fallback;
    };

    const dto: ValidatedAddressDto = {
      street: pick(fields.street, baseline.street || ''),
      complement: pick(fields.complement, baseline.complement || ''),
      neighbourhood: pick(fields.neighbourhood, baseline.neighbourhood || ''),
      number: pick(fields.number, baseline.number || 0) as number,
      city: pick(fields.city, baseline.city || ''),
      state: pick(fields.state, baseline.state || ''),
      zipCode: pick(fields.zipCode, baseline.zipCode || ''),
      type: pick(fields.type, baseline.type) as any,
      validationStatus: pick(fields.validationStatus, baseline.validationStatus) as any,
    } as ValidatedAddressDto;

    // Build unresolved field list correctly
    const addIfUnresolved = (name: AddressField, fd: FieldDecision<any>) => {
      if (fd.confidence < policy.acceptThreshold) unresolved.push(name);
    };
    addIfUnresolved('street', fields.street);
    addIfUnresolved('complement', fields.complement);
    addIfUnresolved('neighbourhood', fields.neighbourhood);
    addIfUnresolved('number', fields.number);
    addIfUnresolved('city', fields.city);
    addIfUnresolved('state', fields.state);
    addIfUnresolved('zipCode', fields.zipCode);
    addIfUnresolved('type', fields.type);
    addIfUnresolved('validationStatus', fields.validationStatus);

    const overallConfidence = (
      fields.street.confidence +
      fields.complement.confidence +
      fields.neighbourhood.confidence +
      fields.number.confidence +
      fields.city.confidence +
      fields.state.confidence +
      fields.zipCode.confidence +
      fields.type.confidence +
      fields.validationStatus.confidence
    ) / 9;

    const meta: ConciliationResultMeta = {
      fields: fields as any,
      overallConfidence,
    };

    return { dto, meta, unresolvedFields: unresolved };
  }

  // Backward compatible API
  async reconcile(input: ConciliationInput): Promise<ValidatedAddressDto> {
    const { dto } = await this.reconcileWithMeta(input);
    return dto;
  }
}
