import { Request, Response, NextFunction } from 'express';
import { AppErrors, raise } from '../errors/index.js';

export function notFoundMiddleware(req: Request, _res: Response, _next: NextFunction): void {
    raise(AppErrors.NOT_FOUND, { message: `Route not found: ${req.method} ${req.originalUrl}` });
}
