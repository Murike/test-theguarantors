import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SourceCheckOrchestratorService, SOURCE_CHECK_PROVIDER_TOKEN } from './source-check.service';
import { GeoapifyProvider } from '../providers/geoapify.provider';
import { GoogleAddressProvider } from '../providers/google.provider';

@Module({
  providers: [
    SourceCheckOrchestratorService,
    {
      provide: SOURCE_CHECK_PROVIDER_TOKEN,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const provider = (config.get<string>('SOURCE_PROVIDER') || 'geoapify').toLowerCase();
        switch (provider) {
          case 'google':
            return new GoogleAddressProvider(config);
          case 'geoapify':
          default:
            return new GeoapifyProvider(config);
        }
      },
    },
  ],
  exports: [SourceCheckOrchestratorService],
})
export class SourceCheckModule {}
