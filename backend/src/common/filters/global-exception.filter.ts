import { 
  ExceptionFilter, 
  Catch, 
  ArgumentsHost, 
  HttpException, 
  HttpStatus, 
  Logger 
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status = exception instanceof HttpException 
      ? exception.getStatus() 
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const correlationId = (request.headers['x-request-id'] as string) || 'unknown';

    let code = 'INTERNAL_ERROR';
    let message = 'An unexpected internal server error occurred.';

    if (exception instanceof HttpException) {
      const res: any = exception.getResponse();
      if (typeof res === 'string') {
        message = res;
      } else if (res && typeof res === 'object') {
        message = res.message || exception.message;
        code = res.error || exception.name || 'API_ERROR';
      }
    }

    if (status === HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(
        `[${correlationId}] Internal Exception on ${request.method} ${request.url}: ${exception instanceof Error ? exception.stack : exception}`
      );
    }

    const isProduction = process.env.NODE_ENV === 'production';

    response.status(status).json({
      success: false,
      error: {
        code,
        message: Array.isArray(message) ? message.join('; ') : message,
        correlationId,
        timestamp: new Date().toISOString(),
        ...(isProduction ? {} : { details: exception instanceof Error ? exception.stack : undefined }),
      },
    });
  }
}
