import { ValidatedAddressDto } from '../../dto/validatedAddress.dto';
import { LlmAddressResult } from '../../dto/llmAddressResult.dto';

export interface LlmProvider {
  extractAddress(original: string, hint?: ValidatedAddressDto): Promise<LlmAddressResult>;
}
