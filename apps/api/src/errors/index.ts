import { HttpStatus } from '../common/http-status.js';

export type AppErrorOptions = {
    message: string;
    type?: string;
    statusCode?: HttpStatus;
};

export class AppError extends Error {
    override name = 'AppError';
    readonly type: string;
    readonly statusCode?: HttpStatus;

    constructor(options: AppErrorOptions) {
        super(options.message);
        this.type = options.type ?? 'Error';
        if (options?.statusCode !== undefined) {
            this.statusCode = options.statusCode;
        }
        Error.captureStackTrace?.(this, AppError);
    }
}

export function isAppError(error: unknown): error is AppError {
    return error instanceof AppError;
}

export type ErrorDefinition = {
    type: string;
    message: string;
    statusCode?: HttpStatus;
};

function defineError<const T extends Record<string, ErrorDefinition>>(specs: T): { [K in keyof T]: ErrorDefinition } {
    return specs;
}

export const AppErrors = defineError({
    NOT_FOUND: {
        type: 'NotFound',
        message: 'Entity not found.',
        statusCode: HttpStatus.NotFound,
    },
});

function createError(errorDef: ErrorDefinition, extras?: { message: string }): AppError {
    const options: AppErrorOptions = {
        message: extras?.message ?? errorDef.message,
        statusCode: errorDef.statusCode,
        type: errorDef.type,
    };
    return new AppError(options);
}

export function raise(errorDef: ErrorDefinition, extras?: { message: string }) {
    throw createError(errorDef, extras);
}
