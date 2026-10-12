import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';

import { isMongooseError } from '@todo/db';

import { HttpStatus } from '../common/http-status.js';
import { isAppError } from '../errors/index.js';

export function isZodError(error: unknown): error is z.ZodError {
    return error instanceof z.ZodError;
}

export function errorHandlerMiddleware(error: unknown, req: Request, res: Response, _next: NextFunction) {
    if (typeof error === 'object' && error !== null && 'type' in error) {
        if (error.type === 'entity.parse.failed') {
            res.status(HttpStatus.BadRequest).send({ message: 'Malformed JSON request body.' });
            return;
        }
        if (error.type === 'entity.too.large') {
            res.status(HttpStatus.PayloadTooLarge).send({ message: 'Request body is too large.' });
            return;
        }
    }

    if (isZodError(error)) {
        const message = error.issues
            .map((issue) => `${issue.path.join('.') || 'request'}: ${issue.message}`)
            .join('; ');
        res.status(HttpStatus.BadRequest).send({ message: `Validation failed: ${message}` });
        return;
    }

    if (isMongooseError(error)) {
        console.error(`server: ERROR: `, error);
        res.status(HttpStatus.InternalServerError).send({ message: 'Something Bad Happened, please try again later.' });
        return;
    }
    let statusCode = HttpStatus.InternalServerError;
    let errorMessage = error instanceof Error ? error.message : 'Unknown Error';

    if (isAppError(error)) {
        statusCode = error.statusCode ?? statusCode;
        errorMessage = error.message;
    } else {
        console.error(`server: ERROR: `, error);
    }

    res.status(statusCode).send({ message: errorMessage });
}
