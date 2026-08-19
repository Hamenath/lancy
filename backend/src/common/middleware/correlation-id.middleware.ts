import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';

@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const existingId = req.headers['x-request-id'];
    const correlationId = (Array.isArray(existingId) ? existingId[0] : existingId) || randomUUID();

    req.headers['x-request-id'] = correlationId;
    res.setHeader('X-Request-Id', correlationId);

    next();
  }
}
