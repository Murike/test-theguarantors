import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { LlmProvider } from '../core/llm.types';
import type { ValidatedAddressDto } from '../../dto/validatedAddress.dto';
import type { LlmAddressResult } from '../../dto/llmAddressResult.dto';
import { anthropicAddressPrompt } from '../prompts/anthropic-address.prompt';

@Injectable()
export class AnthropicProvider implements LlmProvider {
  constructor(private readonly config: ConfigService) {}

  async extractAddress(original: string, hint?: ValidatedAddressDto): Promise<LlmAddressResult> {
    const prompt = anthropicAddressPrompt(hint ? JSON.stringify(hint) : '{}', original);
    void prompt;

    return {
      street: null,
      unitType: null,
      unit: null,
      city: null,
      state: null,
      zip5: null,
      zipPlus4: null,
      poBox: null,
      type: null,
      validationStatus: 'unverifiable',
      confidence: 0,
      fieldConfidence: {
        street: null,
        unitType: null,
        unit: null,
        city: null,
        state: null,
        zip5: null,
        zipPlus4: null,
        poBox: null,
        type: null,
      },
      corrections: [],
      error: { hasError: true, message: 'Anthropic provider not implemented yet' },
    };
  }
}
