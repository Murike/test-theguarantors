import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { Logger } from 'nestjs-pino';
import { GlobalExceptionFilter } from './common/http/global-exception.filter';
import { setupProcessHandlers } from './bootstrap/setup-process';

const config = new DocumentBuilder()
  .setTitle("theGuarantors' Address Processing API")
  .setDescription('Address processing API')
  .setVersion('1.0')
  .build();

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.useLogger(await app.resolve(Logger));
  app.useGlobalFilters(app.get(GlobalExceptionFilter));

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await setupProcessHandlers(app);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
