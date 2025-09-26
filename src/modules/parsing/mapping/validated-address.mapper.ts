import type { ValidatedAddressDto } from '@common/dto/validatedAddress.dto';

export interface AddressItParsedResult {
  street?: string;
  complement?: string;
  neighbourhood?: string;
  number?: number;
  city?: string;
  state?: string;
  postalcode?: string;
}

export function mapToValidatedAddress(parsed: AddressItParsedResult): ValidatedAddressDto {
  const rawNum = (parsed.number as any);
  const coercedNumber = typeof rawNum === 'number'
    ? rawNum
    : rawNum != null
      ? (parseInt(String(rawNum).replace(/[^0-9]/g, ''), 10) || 0)
      : 0;

  return {
    street: parsed.street || '',
    complement: parsed.complement || '',
    neighbourhood: parsed.neighbourhood || '',
    number: coercedNumber,
    city: parsed.city || '',
    state: parsed.state || '',
    zipCode: parsed.postalcode || '',
    type: 'unknown',
    validationStatus: 'parsed',
  } as ValidatedAddressDto;
}
