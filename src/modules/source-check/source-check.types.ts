import type { ValidatedAddressDto } from '@common/dto/validatedAddress.dto';

export interface SourceCheckProvider {
  checkAddress(original: string, hint?: ValidatedAddressDto): Promise<SourceCheckResult>;
}

export interface SourceCheckResult {
  hasError: boolean;
  message: string | null;
  provider: string;
  data: unknown | null; // provider-specific payload (raw or normalized)
}
