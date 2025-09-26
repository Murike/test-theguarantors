import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SourceCheckOrchestratorService, SOURCE_CHECK_PROVIDER_TOKEN } from './source-check.service';
import { GeoapifyProvider } from './providers/geoapify.provider';
import { GoogleAddressProvider } from './providers/google.provider';
import { PinoLogger } from 'nestjs-pino';

@Module({
  providers: [
    SourceCheckOrchestratorService,
    {
      provide: SOURCE_CHECK_PROVIDER_TOKEN,
      inject: [ConfigService, PinoLogger],
      useFactory: (config: ConfigService, logger: PinoLogger) => {
        const provider = (config.get<string>('SOURCE_PROVIDER') || 'geoapify').toLowerCase();
        switch (provider) {
          case 'google':
            return new GoogleAddressProvider(config, logger);
          case 'geoapify':
          default:
            return new GeoapifyProvider(config, logger);
        }
      },
    },
    PinoLogger,
  ],
  exports: [SourceCheckOrchestratorService],
})
export class SourceCheckModule {}
