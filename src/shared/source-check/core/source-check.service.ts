import { Injectable, Inject } from '@nestjs/common';
import type { ValidatedAddressDto } from '../../dto/validatedAddress.dto';
import type { SourceCheckProvider, SourceCheckResult } from './source-check.types';
import { mapSourceToValidated } from '../mapping/address.mapper';

export const SOURCE_CHECK_PROVIDER_TOKEN = 'SOURCE_CHECK_PROVIDER_TOKEN';

@Injectable()
export class SourceCheckOrchestratorService {
  constructor(
    @Inject(SOURCE_CHECK_PROVIDER_TOKEN)
    private readonly provider: SourceCheckProvider,
  ) {}

  async checkAddress(original: string, hint?: ValidatedAddressDto): Promise<SourceCheckResult> {
    const res = await this.provider.checkAddress(original, hint);
    return res;
  }

  async validateAddressUsingSource(original: string, hint: ValidatedAddressDto): Promise<ValidatedAddressDto> {
    const lowLevel = await this.checkAddress(original, hint);
    const mapped = mapSourceToValidated(lowLevel, hint);
    return mapped;
  }
}
