import { LlmAddressResult } from '@common/dto/llmAddressResult.dto';
import { ValidatedAddressDto } from '@common/dto/validatedAddress.dto';
import { normalizeLlmResult } from '@common/utils/address/normalization';

function extractHouseNumberAndStreet(street: string | null): { number: number; street: string } {
  if (!street) return { number: 0, street: '' };
  const trimmed = street.trim();
  const m = trimmed.match(/^(\d+[A-Za-z]?)\s+(.+)$/);
  if (m) {
    const rawNum = m[1];
    const parsedNum = parseInt(rawNum.replace(/[^0-9]/g, ''), 10);
    return { number: Number.isFinite(parsedNum) ? parsedNum : 0, street: m[2].trim() };
  }
  // If no number prefix, put all into street and number=0
  return { number: 0, street: trimmed };
}

export function mapToValidatedAddress(dto: LlmAddressResult): ValidatedAddressDto {
  // Normalize the LLM-specific raw shape to reduce variance before structural mapping
  const src = normalizeLlmResult(dto);
  const { number, street } = extractHouseNumberAndStreet(src.street);

  const complementParts: string[] = [];
  if (src.unitType || src.unit) complementParts.push(`${src.unitType ?? ''} ${src.unit ?? ''}`.trim());
  if (src.poBox) complementParts.push(src.poBox);
  const complement = complementParts.filter(Boolean).join(', ');

  const zipCode = src.zip5 ? (src.zipPlus4 ? `${src.zip5}-${src.zipPlus4}` : src.zip5) : '';

  // Map type to internal enum: 'house' | 'apartment' | 'po_box' | 'unknown'
  let type: 'house' | 'apartment' | 'po_box' | 'unknown' = 'unknown';
  if (src.type === 'house') type = 'house';
  else if (src.type === 'apartment') type = 'apartment';
  else if (src.type === 'po_box') type = 'po_box';
  else type = 'unknown';

  return {
    street: street || '',
    complement: complement || '',
    neighbourhood: '',
    number,
    city: src.city ?? '',
    state: src.state ?? '',
    zipCode,
    type,
    validationStatus: src.validationStatus as any, // schema matches the union
  } as ValidatedAddressDto;
}
