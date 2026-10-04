import { NextFunction, Request, Response } from 'express';

import { isMongooseError } from '@todo/db';

import { isAppError } from '../errors/index.js';

export function errorHandlerMiddleware(error: unknown, req: Request, res: Response, _next: NextFunction) {
    console.log(`server: ERROR: `, error);
    if (isMongooseError(error)) {
        res.status(500).send({ message: 'Something Bad Happened, please try again later.' });
        return;
    }
    let statusCode = 500;
    let errorMessage = error instanceof Error ? error.message : 'Unknown Error';

    if (isAppError(error)) {
        statusCode = !!error.statusCode ? error.statusCode : statusCode;
        errorMessage = error.message;
    }

    res.status(statusCode).send({ message: errorMessage });
}
