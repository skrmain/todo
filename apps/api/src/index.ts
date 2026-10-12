import { createServer } from './server.js';
import { env } from './config.js';
import { connectDb } from '@todo/db';

await connectDb(env.DB_URL, env.DB_NAME);

const app = createServer();

app.listen(env.PORT, () => {
    console.log(`server: Listening on '${env.PORT}' port`);
});
