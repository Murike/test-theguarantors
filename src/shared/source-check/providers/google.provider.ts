import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { SourceCheckProvider, SourceCheckResult } from '../core/source-check.types';
import type { ValidatedAddressDto } from '../../dto/validatedAddress.dto';

@Injectable()
export class GoogleAddressProvider implements SourceCheckProvider {
  constructor(private readonly config: ConfigService) {}

  async checkAddress(original: string, hint?: ValidatedAddressDto): Promise<SourceCheckResult> {
    return { hasError: true, message: 'Google provider not implemented yet', provider: 'google', data: null };
  }
}
