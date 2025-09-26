import { Injectable, Inject } from '@nestjs/common';
import { ValidatedAddressDto } from '@common/dto/validatedAddress.dto';
import { normalizeValidatedAddress } from '@common/utils/address/normalization';
import { mapToValidatedAddress } from './validated-address.mapper';
import type { LlmProvider } from './llm.types';
import { PinoLogger } from 'nestjs-pino';

export const LLM_PROVIDER_TOKEN = 'LLM_PROVIDER_TOKEN';

@Injectable()
export class LlmOrchestratorService {
  constructor(@Inject(LLM_PROVIDER_TOKEN) private readonly provider: LlmProvider, private readonly logger: PinoLogger) {
    this.logger.setContext(LlmOrchestratorService.name);
  }

  async validateAddressUsingLLM(original: string, hint: ValidatedAddressDto): Promise<ValidatedAddressDto> {
    const llmRaw = await this.provider.extractAddress(original, hint);
    const mapped = mapToValidatedAddress(llmRaw);
    const normalized = normalizeValidatedAddress(mapped);
    this.logger.info(normalized, 'LLM result');
    return normalized;
  }
}
