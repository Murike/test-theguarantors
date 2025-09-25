import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LlmOrchestratorService, LLM_PROVIDER_TOKEN } from './llm.service';
import { OpenAiProvider } from '../providers/openai.provider';
import { AnthropicProvider } from '../providers/anthropic.provider';

@Module({
  providers: [
    LlmOrchestratorService,
    {
      provide: LLM_PROVIDER_TOKEN,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const provider = (config.get<string>('LLM_PROVIDER') || 'openai').toLowerCase();
        switch (provider) {
          case 'anthropic':
            return new AnthropicProvider(config);
          case 'openai':
            return new OpenAiProvider(config);
          default:
            return new OpenAiProvider(config);
        }
      },
    },
  ],
  exports: [LlmOrchestratorService],
})
export class LlmModule {}
