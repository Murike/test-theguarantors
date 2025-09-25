import { LlmAddressResult } from '../dto/llmAddressResult.dto';
import { ValidatedAddressDto } from '../dto/validatedAddress.dto';

function extractHouseNumberAndStreet(street: string | null): { number: number; street: string } {
  if (!street) return { number: 0, street: '' };
  const trimmed = street.trim();
  const m = trimmed.match(/^(\d+[A-Za-z]?)[\s,]+(.+)$/);
  if (m) {
    const rawNum = m[1];
    const parsedNum = parseInt(rawNum.replace(/[^0-9]/g, ''), 10);
    return { number: Number.isFinite(parsedNum) ? parsedNum : 0, street: m[2].trim() };
  }
  // If no number prefix, put all into street and number=0
  return { number: 0, street: trimmed };
}

export function mapLlmToValidated(dto: LlmAddressResult): ValidatedAddressDto {
  const { number, street } = extractHouseNumberAndStreet(dto.street);

  const complementParts: string[] = [];
  if (dto.unitType || dto.unit) complementParts.push(`${dto.unitType ?? ''} ${dto.unit ?? ''}`.trim());
  if (dto.poBox) complementParts.push(dto.poBox);
  const complement = complementParts.filter(Boolean).join(', ');

  const zipCode = dto.zip5 ? (dto.zipPlus4 ? `${dto.zip5}-${dto.zipPlus4}` : dto.zip5) : '';

  // Map type to internal enum: 'house' | 'apartment' | 'po_box' | 'unknown'
  let type: 'house' | 'apartment' | 'po_box' | 'unknown' = 'unknown';
  if (dto.type === 'house') type = 'house';
  else if (dto.type === 'apartment') type = 'apartment';
  else if (dto.type === 'po_box') type = 'po_box';
  else type = 'unknown';

  return {
    street: street || '',
    complement: complement || '',
    neighbourhood: '',
    number,
    city: dto.city ?? '',
    state: dto.state ?? '',
    zipCode,
    type,
    validationStatus: dto.validationStatus as any, // schema matches the union
  } as ValidatedAddressDto;
}
