import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { SourceCheckProvider, SourceCheckResult } from '../source-check.types';
import type { ValidatedAddressDto } from '@common/dto/validatedAddress.dto';
import { PinoLogger } from 'nestjs-pino';

@Injectable()
export class GoogleAddressProvider implements SourceCheckProvider {
  constructor(private readonly config: ConfigService, private readonly logger: PinoLogger) {}

  async checkAddress(original: string, hint?: ValidatedAddressDto): Promise<SourceCheckResult> {
    this.logger.info(original, 'original');
    return { hasError: true, message: 'Google provider not implemented yet', provider: 'google', data: null };
  }
}
