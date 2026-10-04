import packageJson from '../package.json' with { type: 'json' };

import { z } from 'zod';

export const ProcessEnvSchema = z.object({
    SERVICE_NAME: z.string().trim().default(packageJson.name),
    NODE_ENV: z.string().trim().default('development'),
    PORT: z.number().default(3000),

    DB_URL: z.string().trim().default('mongodb://localhost:27017/todo'),
    DB_NAME: z.string().trim().default('todo'),
});

export const env = ProcessEnvSchema.parse(process.env);
