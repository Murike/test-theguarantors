import { Injectable, Inject } from '@nestjs/common';
import { ValidatedAddressDto } from '../../dto/validatedAddress.dto';
import { normalizeLlmResult } from '../../address';
import { mapLlmToValidated } from '../address.mapper';
import type { LlmProvider } from './llm.types';

export const LLM_PROVIDER_TOKEN = 'LLM_PROVIDER_TOKEN';

@Injectable()
export class LlmOrchestratorService {
  constructor(@Inject(LLM_PROVIDER_TOKEN) private readonly provider: LlmProvider) {}

  async validateAddressUsingLLM(original: string, hint: ValidatedAddressDto): Promise<ValidatedAddressDto> {
    const llmRaw = await this.provider.extractAddress(original, hint);
    const llmNormalized = normalizeLlmResult(llmRaw);
    const validated = mapLlmToValidated(llmNormalized);
    return validated;
  }
}
