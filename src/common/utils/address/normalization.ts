import { LlmAddressResult } from '@common/dto/llmAddressResult.dto';
import type { ValidatedAddressDto } from '@common/dto/validatedAddress.dto';

// Minimal USPS state codes set for normalization
const STATE_CODES = new Set([
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY','DC'
]);

// Common USPS suffix abbreviations (subset)
const SUFFIX_MAP: Record<string, string> = {
  street: 'St', st: 'St',
  avenue: 'Ave', ave: 'Ave',
  boulevard: 'Blvd', blvd: 'Blvd',
  road: 'Rd', rd: 'Rd',
  drive: 'Dr', dr: 'Dr',
  lane: 'Ln', ln: 'Ln',
  court: 'Ct', ct: 'Ct',
  place: 'Pl', pl: 'Pl',
  terrace: 'Ter', ter: 'Ter',
  parkway: 'Pkwy', pkwy: 'Pkwy',
  circle: 'Cir', cir: 'Cir',
  highway: 'Hwy', hwy: 'Hwy',
};

// Directionals
const DIR_MAP: Record<string, string> = {
  north: 'N', n: 'N',
  south: 'S', s: 'S',
  east: 'E', e: 'E',
  west: 'W', w: 'W',
  northeast: 'NE', ne: 'NE',
  northwest: 'NW', nw: 'NW',
  southeast: 'SE', se: 'SE',
  southwest: 'SW', sw: 'SW',
};

export function normalizeState(state: string | null): string | null {
  if (!state) return null;
  const up = state.trim().toUpperCase();
  if (STATE_CODES.has(up)) return up;
  return state; // leave as-is if not recognized
}

function titleCaseWord(w: string): string {
  return w.length ? w[0].toUpperCase() + w.slice(1).toLowerCase() : w;
}

export function normalizeStreet(street: string | null): string | null {
  if (!street) return null;
  const tokens = street.split(/\s+/);
  const out: string[] = [];
  for (let i = 0; i < tokens.length; i++) {
    const raw = tokens[i];
    const key = raw.replace(/[.,]/g, '').toLowerCase();
    if (SUFFIX_MAP[key]) {
      out.push(SUFFIX_MAP[key]);
      continue;
    }
    if (DIR_MAP[key]) {
      out.push(DIR_MAP[key]);
      continue;
    }
    // keep original punctuation but normalize casing for alpha segments
    if (/^[A-Za-z]+$/.test(raw)) out.push(titleCaseWord(raw)); else out.push(raw);
  }
  return out.join(' ')
    .replace(/\s+,/g, ',')
    .replace(/,\s+/g, ', ')
    .trim();
}

export function normalizeZip(zip5: string | null, plus4: string | null): { zip5: string | null; zipPlus4: string | null } {
  const clean5 = zip5 ? zip5.replace(/[^0-9]/g, '') : null;
  const clean4 = plus4 ? plus4.replace(/[^0-9]/g, '') : null;
  const z5 = clean5 && clean5.length >= 5 ? clean5.slice(0, 5) : clean5 ?? null;
  const z4 = clean4 && clean4.length >= 4 ? clean4.slice(0, 4) : clean4 ?? null;
  return { zip5: z5, zipPlus4: z4 };
}

export function normalizeLlmResult(r: LlmAddressResult): LlmAddressResult {
  const normState = normalizeState(r.state);
  const normStreet = normalizeStreet(r.street);
  const { zip5, zipPlus4 } = normalizeZip(r.zip5, r.zipPlus4);
  return {
    ...r,
    state: normState,
    street: normStreet,
    zip5,
    zipPlus4,
  };
}

// Normalize the final ValidatedAddressDto to a consistent USPS-like format
export function normalizeValidatedAddress(dto: ValidatedAddressDto): ValidatedAddressDto {
  const state = dto.state ? (normalizeState(dto.state) ?? dto.state) : dto.state;
  const street = dto.street ? (normalizeStreet(dto.street) ?? dto.street) : dto.street;

  // Extract 5-digit ZIP from any zipCode format (e.g., 94105 or 94105-1234)
  let zipCode = dto.zipCode || '';
  if (zipCode) {
    const digits = zipCode.replace(/[^0-9]/g, '');
    zipCode = digits.slice(0, 5);
  }

  // Trim basic text fields
  const city = (dto.city || '').trim();
  const neighbourhood = (dto.neighbourhood || '').trim();
  const complement = (dto.complement || '').trim();

  return {
    ...dto,
    state: state ?? '',
    street: street ?? '',
    zipCode,
    city,
    neighbourhood,
    complement,
  } as ValidatedAddressDto;
}
