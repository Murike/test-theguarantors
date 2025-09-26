import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import * as YAML from 'yaml';
import { LlmProvider } from '../llm.types';
import { ValidatedAddressDto } from '@common/dto/validatedAddress.dto';
import { LlmAddressResult, LlmAddressResultSchema } from '@common/dto/llmAddressResult.dto';
import { openaiAddressPrompt } from '../prompts/openai-address.prompt';

@Injectable()
export class OpenAiProvider implements LlmProvider {
  constructor(private readonly config: ConfigService) {}

  async extractAddress(original: string, hint?: ValidatedAddressDto): Promise<LlmAddressResult> {
    const apiKey = this.config.get<string>('OA_API_KEY');
    if (!apiKey) {
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
          street: null, unitType: null, unit: null, city: null, state: null, zip5: null, zipPlus4: null, poBox: null, type: null,
        },
        corrections: [],
        error: { hasError: true, message: 'Missing API key' },
      };
    }

    const requestData = {
      model: this.config.get<string>('OA_MODEL'),
      input: openaiAddressPrompt(hint ? YAML.stringify(hint) : YAML.stringify({}), original)
    };

    const response = await axios.post('https://api.openai.com/v1/responses', requestData, {
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` }
    });

    const data = response.data as any;
    const { output } = data;
    const text = output?.[0]?.content?.[0]?.text ?? '';
    const parsed = YAML.parse(text);
    const validated = LlmAddressResultSchema.parse(parsed);
    return validated;
  }
}
