import { Injectable, Inject } from '@nestjs/common';
import type { ValidatedAddressDto } from '@common/dto/validatedAddress.dto';
import type { SourceCheckProvider, SourceCheckResult } from './source-check.types';
import { mapToValidatedAddress } from './mapping/validated-address.mapper';
import { normalizeValidatedAddress } from '@common/utils/address/normalization';
import { PinoLogger } from 'nestjs-pino';

export const SOURCE_CHECK_PROVIDER_TOKEN = 'SOURCE_CHECK_PROVIDER_TOKEN';

@Injectable()
export class SourceCheckOrchestratorService {
  constructor(
    @Inject(SOURCE_CHECK_PROVIDER_TOKEN)
    private readonly provider: SourceCheckProvider,
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext(SourceCheckOrchestratorService.name);
  }

  async checkAddress(original: string, hint?: ValidatedAddressDto): Promise<SourceCheckResult> {
    const res = await this.provider.checkAddress(original, hint);
    return res;
  }

  async validateAddressUsingSource(original: string, hint: ValidatedAddressDto): Promise<ValidatedAddressDto> {
    const lowLevel = await this.checkAddress(original, hint);
    this.logger.info(lowLevel, 'Source-check raw result');
    const mapped = mapToValidatedAddress(lowLevel, hint);
    this.logger.info(mapped, 'Source-check result');
    return normalizeValidatedAddress(mapped);
  }
}
