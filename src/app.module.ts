import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LlmModule } from '@modules/llm/llm.module';
import { SourceCheckModule } from '@modules/source-check/source-check.module';
import { ConciliationModule } from '@modules/conciliation/conciliation.module';
import { ParsingModule } from '@modules/parsing/parsing.module';
import { LoggerModule } from 'nestjs-pino';
import { GlobalExceptionFilter } from './common/http/global-exception.filter';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    LoggerModule.forRoot({
      pinoHttp: {
        level: process.env.LOG_LEVEL || 'info',
        autoLogging: true,
        redact: ['req.headers.authorization'],    
        transport: process.env.NODE_ENV === 'production'
          ? undefined
          : {
              target: 'pino-pretty',
              options: { colorize: true, translateTime: 'SYS:standard' },
            },
        serializers: {
          req: (req) => ({
            'tracking-id': req.id,
            method: req.method,
            url: req.url,
          }),
          res: (res) => ({
            'tracking-id': res.id,
            statusCode: res.statusCode,
          }),
        },
      },
    }),
    LlmModule,
    SourceCheckModule,
    ConciliationModule,
    ParsingModule,
  ],
  controllers: [AppController],
  providers: [AppService, GlobalExceptionFilter],
})
export class AppModule {}
