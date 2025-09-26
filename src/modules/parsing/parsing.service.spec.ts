import { Test, TestingModule } from '@nestjs/testing';
import { ParsingModule } from './parsing.module';
import { ParsingService } from './parsing.service';
import type { ValidatedAddressDto } from '@common/dto/validatedAddress.dto';

describe('ParsingService', () => {
  let moduleRef: TestingModule;
  let service: ParsingService;

  beforeAll(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [ParsingModule],
    }).compile();
    service = moduleRef.get(ParsingService);
  });

  afterAll(async () => {
    await moduleRef.close();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('parses a simple US address into ValidatedAddressDto', async () => {
    const result = await service.validateAddressUsingParsing('1600 Pennsylvania Avenue NW, Washington, DC 20500') as ValidatedAddressDto;
    expect(result).toBeDefined();
    expect(typeof result.street).toBe('string');
    expect(typeof result.city).toBe('string');
    expect(typeof result.state).toBe('string');
    expect(typeof result.zipCode).toBe('string');
    expect(typeof result.number).toBe('number');
    expect(result.validationStatus).toBe('parsed');
  });
});
