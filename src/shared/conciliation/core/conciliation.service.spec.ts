import { Test, TestingModule } from '@nestjs/testing';
import { ConciliationModule } from './conciliation.module';
import { ConciliationService } from './conciliation.service';
import type { ValidatedAddressDto } from '../../dto/validatedAddress.dto';

function baseline(): ValidatedAddressDto {
  return {
    street: '1600 Pennsylvania Ave NW',
    complement: '',
    neighbourhood: '',
    number: 1600,
    city: 'Washington',
    state: 'DC',
    zipCode: '20500',
    type: 'house',
    validationStatus: 'parsed',
  } as ValidatedAddressDto;
}

function fromSource(): ValidatedAddressDto {
  return {
    street: '1600 Pennsylvania Ave NW',
    complement: '',
    neighbourhood: '',
    number: 1600,
    city: 'Washington',
    state: 'DC',
    zipCode: '20500',
    type: 'house',
    validationStatus: 'corrected',
  } as ValidatedAddressDto;
}

function fromLlm(): ValidatedAddressDto {
  return {
    street: '1600 Pennsylvania Ave NW',
    complement: 'Apt 1',
    neighbourhood: '',
    number: 1600,
    city: 'Washington',
    state: 'DC',
    zipCode: '20500',
    type: 'apartment',
    validationStatus: 'corrected',
  } as ValidatedAddressDto;
}

describe('ConciliationService (integration)', () => {
  let moduleRef: TestingModule;
  let service: ConciliationService;

  beforeAll(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [ConciliationModule],
    }).compile();

    service = moduleRef.get(ConciliationService);
  });

  afterAll(async () => {
    await moduleRef.close();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('reconcile returns a ValidatedAddressDto using placeholder rules', async () => {
    const result = await service.reconcile({
      original: '1600 Pennsylvania Avenue NW, Washington, DC 20500',
      baseline: baseline(),
      source: fromSource(),
      llm: fromLlm(),
    });

    expect(result).toBeDefined();
    expect(result.city).toBe('Washington');
    expect(result.state).toBe('DC');
    // With placeholder rule, complement should be taken from source or llm then baseline
    expect(typeof result.complement).toBe('string');
  });
});
