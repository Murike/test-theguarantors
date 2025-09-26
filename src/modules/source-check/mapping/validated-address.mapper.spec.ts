import { mapToValidatedAddress } from './validated-address.mapper';
import type { SourceCheckResult } from '../source-check.types';
import type { ValidatedAddressDto } from '@common/dto/validatedAddress.dto';

function baseHint(): ValidatedAddressDto {
  return {
    street: '',
    complement: '',
    neighbourhood: '',
    number: 0,
    city: '',
    state: '',
    zipCode: '',
    type: 'unknown',
    validationStatus: 'parsed',
  } as ValidatedAddressDto;
}

describe('mapToValidatedAddress (Source-Check)', () => {
  it('returns unverifiable on provider error', () => {
    const res: SourceCheckResult = { hasError: true, message: 'x', provider: 'geoapify', data: null };
    const mapped = mapToValidatedAddress(res, baseHint());
    expect(mapped.validationStatus).toBe('unverifiable');
  });

  it('parses GeoJSON features[0].properties for US', () => {
    const res: SourceCheckResult = {
      hasError: false,
      message: null,
      provider: 'geoapify',
      data: {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            properties: {
              country_code: 'us',
              state_code: 'CA',
              city: 'San Francisco',
              postcode: '94103-1234',
              road: 'Mission St',
              housenumber: '123',
              suburb: 'SoMa',
            },
          },
        ],
      },
    };
    const mapped = mapToValidatedAddress(res, baseHint());
    expect(mapped.city).toBe('San Francisco');
    // mapper does not format state; it copies provider state/state_code as-is
    expect(mapped.state).toBe('CA');
    expect(mapped.street).toBe('Mission St');
    expect(mapped.number).toBe(123);
    // mapper does not truncate ZIP; normalization happens later in orchestrator
    expect(mapped.zipCode).toBe('94103-1234');
    expect(mapped.neighbourhood).toBe('SoMa');
    expect(mapped.validationStatus).toBe('corrected');
  });

  it('parses results[0] shape for US and builds complement from suite/unit', () => {
    const res: SourceCheckResult = {
      hasError: false,
      message: null,
      provider: 'geoapify',
      data: {
        results: [
          {
            countryCode: 'us',
            state: 'ny',
            city: 'New York',
            zip: '10001',
            street: 'W 31st St',
            house_number: '45',
            address_line2: 'Suite 800',
          },
        ],
      },
    };
    const mapped = mapToValidatedAddress(res, baseHint());
    expect(mapped.city).toBe('New York');
    // mapper does not format state; normalization happens later
    expect(mapped.state).toBe('ny');
    expect(mapped.street).toBe('W 31st St');
    expect(mapped.number).toBe(45);
    expect(mapped.zipCode).toBe('10001');
    expect(mapped.complement).toContain('Suite 800');
    expect(['house', 'apartment', 'po_box', 'unknown']).toContain(mapped.type);
    expect(mapped.validationStatus).toBe('corrected');
  });

  it('detects PO Box and sets type to po_box', () => {
    const res: SourceCheckResult = {
      hasError: false,
      message: null,
      provider: 'geoapify',
      data: {
        results: [
          {
            countryCode: 'us',
            state: 'TX',
            city: 'Austin',
            zip: '73301',
            address_line1: 'PO Box 123',
          },
        ],
      },
    };
    const mapped = mapToValidatedAddress(res, baseHint());
    expect(mapped.type).toBe('po_box');
    expect(mapped.complement).toContain('PO Box 123');
  });

  it('returns unverifiable for non-US country', () => {
    const res: SourceCheckResult = {
      hasError: false,
      message: null,
      provider: 'geoapify',
      data: {
        results: [
          { countryCode: 'br', city: 'Sao Paulo' },
        ],
      },
    };
    const mapped = mapToValidatedAddress(res, baseHint());
    expect(mapped.validationStatus).toBe('unverifiable');
  });
});
