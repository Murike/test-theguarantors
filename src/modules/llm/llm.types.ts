import { ValidatedAddressDto } from '@common/dto/validatedAddress.dto';
import { LlmAddressResult } from '@common/dto/llmAddressResult.dto';

export interface LlmProvider {
  extractAddress(original: string, hint?: ValidatedAddressDto): Promise<LlmAddressResult>;
}
