import { mapToValidatedAddress, type AddressItParsedResult } from './validated-address.mapper';
import type { ValidatedAddressDto } from '@common/dto/validatedAddress.dto';

describe('Parsing mapper (mapToValidatedAddress)', () => {
  it('maps a typical parsed result into ValidatedAddressDto', () => {
    const parsed: AddressItParsedResult = {
      street: 'Pennsylvania Ave NW',
      complement: '',
      neighbourhood: '',
      number: 1600,
      city: 'Washington',
      state: 'DC',
      postalcode: '20500',
    };

    const dto = mapToValidatedAddress(parsed) as ValidatedAddressDto;

    expect(dto.street).toBe('Pennsylvania Ave NW');
    expect(dto.number).toBe(1600);
    expect(dto.city).toBe('Washington');
    expect(dto.state).toBe('DC');
    expect(dto.zipCode).toBe('20500');
    expect(dto.type).toBe('unknown');
    expect(dto.validationStatus).toBe('parsed');
  });

  it('applies safe defaults for missing fields', () => {
    const parsed: AddressItParsedResult = {};
    const dto = mapToValidatedAddress(parsed) as ValidatedAddressDto;

    expect(dto.street).toBe('');
    expect(dto.number).toBe(0);
    expect(dto.city).toBe('');
    expect(dto.state).toBe('');
    expect(dto.zipCode).toBe('');
    expect(dto.type).toBe('unknown');
    expect(dto.validationStatus).toBe('parsed');
  });
});
