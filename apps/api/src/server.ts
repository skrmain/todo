import express from 'express';

import { errorHandlerMiddleware } from './middlewares/error-handler.js';
import { notFoundMiddleware } from './middlewares/not-found.js';
import { requestLoggerMiddleware } from './middlewares/request-logger.js';
import { todoRoutes } from './features/todos/todo.routes.js';

export function createServer() {
    const app = express();

    app.use(requestLoggerMiddleware);
    app.use(express.json({ limit: '100kb' }));
    app.get('/', (_req, res) => res.send({ message: 'Ok' }));
    app.use('/todos', todoRoutes);
    app.use(notFoundMiddleware);
    app.use(errorHandlerMiddleware);

    return app;
}
