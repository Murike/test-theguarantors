import type { INestApplication } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';

export function setupProcessHandlers(app: INestApplication) {
  // Process-level safety nets and graceful shutdown
  const logger = app.get(PinoLogger);
  const isProd = process.env.NODE_ENV === 'production';

  process.on('unhandledRejection', (reason: any) => {
    logger.error({ err: reason }, 'Unhandled Promise Rejection');
    if (isProd) process.exit(1);
  });

  process.on('uncaughtException', (err: any) => {
    logger.fatal({ err }, 'Uncaught Exception');
    if (isProd) process.exit(1);
  });

  const shutdown = async (signal: NodeJS.Signals) => {
    try {
      logger.warn({ signal }, 'Graceful shutdown initiated');
      await app.close();
      logger.warn('Nest application closed');
    } catch (e) {
      logger.error({ err: e }, 'Error during app close');
    } finally {
      process.exit(0);
    }
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}
