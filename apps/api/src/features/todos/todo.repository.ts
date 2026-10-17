import { Todo } from '@todo/db';

import type { ListTodosInput } from './todo.validation.js';

function escapeRegExp(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export async function findTodos(input: ListTodosInput) {
    const filter = {
        ...(input.done !== undefined ? { done: input.done } : {}),
        ...(input.search
            ? {
                  $or: [
                      { title: { $regex: escapeRegExp(input.search), $options: 'i' } },
                      { description: { $regex: escapeRegExp(input.search), $options: 'i' } },
                  ],
              }
            : {}),
    };
    const direction = input.sortOrder === 'asc' ? 1 : -1;
    const skip = (input.page - 1) * input.limit;

    const [data, total] = await Promise.all([
        Todo.find(filter)
            .sort({ [input.sortBy]: direction })
            .skip(skip)
            .limit(input.limit)
            .lean(),
        Todo.countDocuments(filter),
    ]);

    return {
        data,
        pagination: {
            page: input.page,
            limit: input.limit,
            total,
            totalPages: Math.ceil(total / input.limit),
        },
    };
}

export function findTodoById(id: string) {
    return Todo.findById(id).lean();
}

export function insertTodo(todo: { title: string; description?: string }) {
    return Todo.create(todo);
}

export function updateTodoById(id: string, changes: { title?: string; description?: string; done?: boolean }) {
    return Todo.findByIdAndUpdate(id, changes, { returnDocument: 'after', runValidators: true }).lean();
}

export function removeTodoById(id: string) {
    return Todo.findByIdAndDelete(id).lean();
}
