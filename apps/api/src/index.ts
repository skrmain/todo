import { createServer } from './server.js';
import { env } from './config.js';
import { connectDb } from '@todo/db';

await connectDb(env.DB_URL, env.DB_NAME);

const app = createServer();

const server = app.listen(env.PORT);

server.on('listening', () => {
    console.log(`server: Listening on '${env.PORT}' port`);
});

server.on('error', (error) => {
    console.error(`server: Failed to listen on '${env.PORT}' port`, error);
    process.exit(1);
});
