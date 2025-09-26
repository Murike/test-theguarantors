import { Injectable } from '@nestjs/common';
import * as addressIt from 'addressit';
import { mapToValidatedAddress, type AddressItParsedResult } from './mapping/validated-address.mapper';
import type { ValidatedAddressDto } from '@common/dto/validatedAddress.dto';
import { normalizeValidatedAddress } from '@common/utils/address/normalization';
import { PinoLogger } from 'nestjs-pino';

@Injectable()
export class ParsingService {
    constructor(private readonly logger: PinoLogger) {
      this.logger.setContext(ParsingService.name);
    }
    
    async validateAddressUsingParsing(original: string): Promise<ValidatedAddressDto> {
    // addressit can be a CJS default export depending on bundler; normalizing call
    const fn: any = (addressIt as any)?.default ?? (addressIt as any);
    const parsed = await fn(original) as AddressItParsedResult;
    const mapped = mapToValidatedAddress(parsed);
    this.logger.info(mapped, 'Parsed result');
    return normalizeValidatedAddress(mapped);
  }
}
