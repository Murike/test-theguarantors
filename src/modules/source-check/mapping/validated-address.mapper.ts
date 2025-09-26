import type { SourceCheckResult } from '../source-check.types';
import type { ValidatedAddressDto } from '@common/dto/validatedAddress.dto';

// Helper: safely pick first candidate from Geoapify response across common shapes
function pickGeoapifyCandidate(data: any): any | null {
  if (!data) return null;
  // features[].properties (geojson)
  const prop = data?.features?.[0]?.properties;
  if (prop) return prop;
  // results[] (format=json)
  const res = data?.results?.[0];
  if (res) return res;
  return null;
}

// Detect PO Box pattern in provided strings
function detectPoBox(...values: Array<string | undefined | null>): string | null {
  for (const v of values) {
    if (!v) continue;
    const s = String(v);
    const m = s.match(/P\s*O\s*Box\s*(\d+)/i);
    if (m) return `PO Box ${m[1]}`;
  }
  return null;
}

// Build complement and decide address type based on unit/apartment/suite/po box hints
function buildComplementAndType(candidate: any, baseComplement: string): { complement: string; type: 'house' | 'apartment' | 'po_box' | 'unknown' } {
  const parts: string[] = [];
  if (baseComplement) parts.push(baseComplement);

  // Common unit-type fields from geocoders
  const unit = candidate.unit || candidate.apartment || candidate.flat || candidate.unit_number || candidate.level || candidate.block || '';
  const suite = candidate.suite || '';
  const addressLine2 = candidate.address_line2 || '';
  const po = detectPoBox(candidate.po_box, candidate.poBox, addressLine2, candidate.address_line1, candidate.formatted);

  let type: 'house' | 'apartment' | 'po_box' | 'unknown' = 'unknown';
  if (po) {
    parts.push(po);
    type = 'po_box';
  }

  const unitStr = [suite, unit].filter(Boolean).join(' ').trim();
  if (unitStr) {
    parts.push(unitStr);
    if (type !== 'po_box') type = 'apartment';
  }

  // If address_line2 exists and wasn't used exclusively as a PO Box indicator, include it in complement
  if (addressLine2) {
    const isPoText = /P\s*O\s*Box/i.test(addressLine2);
    if (!isPoText) {
      parts.push(addressLine2);
    }
  }

  // Heuristic: if we have a housenumber and no unit, it's likely a house
  if (type === 'unknown' && (candidate.housenumber || candidate.house_number)) {
    type = 'house';
  }

  const complement = parts.filter(Boolean).join(', ');
  return { complement, type };
}

// Merge provider result onto the hint, favoring provider when present and plausible
export function mapToValidatedAddress(result: SourceCheckResult, hint: ValidatedAddressDto): ValidatedAddressDto {
  const base: ValidatedAddressDto = { ...hint } as ValidatedAddressDto;

  if (result.hasError) {
    return { ...base, validationStatus: 'unverifiable' } as ValidatedAddressDto;
  }

  const candidate = pickGeoapifyCandidate(result.data);
  if (!candidate) {
    // No structured data to use; consider unverifiable
    return { ...base, validationStatus: 'unverifiable' } as ValidatedAddressDto;
  }

  // Geoapify common fields (accommodate both properties and results schemas)
  const countryCode: string | undefined = (candidate.country_code || candidate.countryCode || '').toString().toLowerCase();
  if (countryCode && countryCode !== 'us') {
    return { ...base, validationStatus: 'unverifiable' } as ValidatedAddressDto;
  }

  const city = candidate.city || candidate.town || candidate.village || candidate.county || base.city;
  const state = candidate.state_code || candidate.state || base.state;
  const postcode = candidate.postcode || candidate.zip || base.zipCode;
  const streetName = candidate.street || candidate.road || candidate.address_line1 || '';
  const houseNumber = candidate.housenumber || candidate.house_number || '';
  const neighbourhood = candidate.neighbourhood || candidate.suburb || base.neighbourhood;

  const street = [streetName].filter(Boolean).join(' ').trim();
  const number = houseNumber ? parseInt(String(houseNumber).replace(/[^0-9]/g, ''), 10) || base.number : base.number;
  const zipCode = (postcode as string) || base.zipCode;

  const { complement, type } = buildComplementAndType(candidate, base.complement || '');

  const updated: ValidatedAddressDto = {
    ...base,
    street: street || base.street,
    number,
    city: city || base.city,
    state: state || base.state,
    zipCode,
    neighbourhood,
    complement,
    type: type || base.type,
    validationStatus: 'corrected',
  } as ValidatedAddressDto;

  return updated;
}
