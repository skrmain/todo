import express from 'express';

import { env } from './config.js';

import { connectDb, Todo } from '@todo/db';
import { errorHandlerMiddleware } from './middlewares/error-handler.js';
import { notFoundMiddleware } from './middlewares/not-found.js';

const app = express();

await connectDb(env.DB_URL, env.DB_NAME);

app.get('/', (req, res) => res.send({ message: 'Ok' }));

app.post('/todos', async (req, res) => {
    await Todo.create({ title: 'Get the Job' });

    res.send({ message: 'Todo Created' });
});

app.get('/todos', async (req, res) => {
    const todos = await Todo.find({}, '_id title description').lean();

    // // No Type inference based on select
    // console.log(todos[0].updatedAt);

    res.send({ data: todos });
});

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

app.listen(env.PORT, () => {
    console.log(`server: Listening on '${env.PORT}' port`);
});
