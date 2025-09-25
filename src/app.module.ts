import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { LlmModule } from './shared/llm/core/llm.module';
import { SourceCheckModule } from './shared/source-check/core/source-check.module';
import { ConciliationModule } from './shared/conciliation/core/conciliation.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    LlmModule,
    SourceCheckModule,
    ConciliationModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
