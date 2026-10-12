import { z } from 'zod';

const todoBodySchema = z.object({
    title: z.string().trim().min(1).max(200),
    description: z.string().trim().max(5000).optional(),
});

export const createTodoSchema = todoBodySchema;

export const updateTodoSchema = todoBodySchema.extend({ done: z.boolean().optional() }).partial().refine(
    (todo) => Object.keys(todo).length > 0,
    { message: 'At least one of title, description, or done must be provided.' },
);

export const todoIdSchema = z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Must be a valid todo ID.'),
});

export const listTodosSchema = z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20),
    search: z.string().trim().max(200).optional(),
    sortBy: z.enum(['title', 'createdAt']).default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
    done: z.enum(['true', 'false']).transform((value) => value === 'true').optional(),
});

export type CreateTodoInput = z.infer<typeof createTodoSchema>;
export type UpdateTodoInput = z.infer<typeof updateTodoSchema>;
export type ListTodosInput = z.infer<typeof listTodosSchema>;
