import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';
import type { Request, Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: PinoLogger) {
    this.logger.setContext(GlobalExceptionFilter.name);
  }

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const req = ctx.getRequest<Request>() as any;
    const res = ctx.getResponse<Response>();

    const isHttp = exception instanceof HttpException;
    const status = isHttp
      ? (exception as HttpException).getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const trackingId = (req as any)?.id;

    // RFC 7807 problem details for HTTP
    const problem = {
      type: isHttp ? 'about:blank' : 'https://httpstatuses.com/500',
      title: isHttp ? (exception as HttpException).name : 'Internal Server Error',
      status,
      detail: this.getDetail(exception),
      instance: req?.url,
      'tracking-id': trackingId,
    } as const;

    const level = status >= 500 ? 'error' : 'warn';
    (this.logger as any)[level](
      {
        err: this.toLoggableError(exception),
        status,
        method: req?.method,
        url: req?.url,
        'tracking-id': trackingId,
      },
      'Unhandled exception',
    );

    res.status(status).type('application/problem+json').send(problem);
  }

  private getDetail(exception: unknown): string {
    if (exception instanceof HttpException) {
      const response = exception.getResponse();
      if (typeof response === 'string') return response;
      if (response && typeof response === 'object') {
        const msg = (response as any).message;
        if (Array.isArray(msg)) return msg.join('; ');
        if (typeof msg === 'string') return msg;
      }
      return exception.message;
    }
    return process.env.NODE_ENV === 'production'
      ? 'An unexpected error occurred.'
      : (exception as any)?.message || 'Internal error';
  }

  private toLoggableError(exception: unknown) {
    if (exception instanceof HttpException) {
      return {
        name: exception.name,
        message: exception.message,
        response: exception.getResponse(),
        stack: process.env.NODE_ENV === 'production' ? undefined : exception.stack,
      };
    }
    if (exception instanceof Error) {
      return {
        name: exception.name,
        message: exception.message,
        stack: process.env.NODE_ENV === 'production' ? undefined : exception.stack,
      };
    }
    return exception;
  }
}
    