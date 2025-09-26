import { mapToValidatedAddress } from './validated-address.mapper';
import { LlmAddressResult } from '@common/dto/llmAddressResult.dto';

describe('mapToValidatedAddress (LLM)', () => {
  it('maps fields and preserves po_box type', () => {
    const input: LlmAddressResult = {
      street: '500 Market St',
      unitType: 'Suite',
      unit: '300',
      city: 'San Francisco',
      state: 'CA',
      zip5: '94105',
      zipPlus4: null,
      poBox: 'PO Box 123',
      type: 'po_box',
      validationStatus: 'corrected',
      confidence: 0.8,
      fieldConfidence: {
        street: 0.9,
        unitType: 0.6,
        unit: 0.6,
        city: 0.9,
        state: 0.9,
        zip5: 0.9,
        zipPlus4: 0,
        poBox: 0.7,
        type: 0.7,
      },
      corrections: ['normalized suffix'],
      error: { hasError: false, message: null },
    };

    const out = mapToValidatedAddress(input);
    expect(out.street).toBe('Market St'); // number is split out
    expect(out.number).toBe(500);
    expect(out.city).toBe('San Francisco');
    expect(out.state).toBe('CA');
    expect(out.zipCode).toBe('94105');
    expect(out.type).toBe('po_box');
    expect(out.complement).toContain('Suite 300');
    expect(out.complement).toContain('PO Box 123');
    expect(out.validationStatus).toBe('corrected');
  });
});
