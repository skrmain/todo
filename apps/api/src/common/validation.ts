import { z } from 'zod';

export function parseInput<T extends z.ZodType>(schema: T, input: unknown): z.output<T> {
    return schema.parse(input);
}
