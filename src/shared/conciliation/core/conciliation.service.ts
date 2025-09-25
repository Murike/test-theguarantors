import { Injectable } from '@nestjs/common';
import type { ValidatedAddressDto } from '../../dto/validatedAddress.dto';

export interface ConciliationInput {
  original: string;
  baseline: ValidatedAddressDto; // parsed address before any external checks
  source?: ValidatedAddressDto | null; // result from Source-Check orchestrator
  llm?: ValidatedAddressDto | null; // result from LLM orchestrator
}

@Injectable()
export class ConciliationService {
  // TODO: Implement final business rules for conciliation here.
  // Notes and ideas:
  // - Define per-field precedence (e.g., ZIP/state from source-check, street/number from LLM)
  // - Consider confidence metrics (when added) to weight fields
  // - Enforce USPS normalization when combining
  // - Keep detailed audit trail of chosen fields
  async reconcile(input: ConciliationInput): Promise<ValidatedAddressDto> {
    const { baseline, source, llm } = input;

    // Placeholder draft rule (simple and explicit):
    // Prefer non-empty fields in source, then LLM, then baseline. Mark as 'corrected' if any changes were applied.
    const pick = <T extends string | number>(s?: T, l?: T, b?: T): T => (s as T) ?? (l as T) ?? (b as T);

    const updated: ValidatedAddressDto = {
      street: pick(source?.street, llm?.street, baseline.street) || '',
      complement: pick(source?.complement, llm?.complement, baseline.complement || '') || '',
      neighbourhood: pick(source?.neighbourhood, llm?.neighbourhood, baseline.neighbourhood) || '',
      number: pick(source?.number as any, llm?.number as any, baseline.number) || 0,
      city: pick(source?.city, llm?.city, baseline.city) || '',
      state: pick(source?.state, llm?.state, baseline.state) || '',
      zipCode: pick(source?.zipCode, llm?.zipCode, baseline.zipCode) || '',
      type: (source?.type ?? llm?.type ?? baseline.type) as any,
      validationStatus: (source?.validationStatus ?? llm?.validationStatus ?? baseline.validationStatus) as any,
    } as ValidatedAddressDto;

    // Future: compute if changes occurred to decide between 'valid'/'corrected'. For now, keep provided status.
    return updated;
  }
}
