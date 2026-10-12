import { AppErrors, raise } from '../../errors/index.js';
import {
    findTodoById,
    findTodos,
    insertTodo,
    removeTodoById,
    updateTodoById,
} from './todo.repository.js';
import type { CreateTodoInput, ListTodosInput, UpdateTodoInput } from './todo.validation.js';

export function list(input: ListTodosInput) {
    return findTodos(input);
}

export async function get(id: string) {
    const todo = await findTodoById(id);
    if (!todo) {
        raise(AppErrors.NOT_FOUND, { message: `Todo '${id}' was not found.` });
    }
    return todo;
}

export function create(input: CreateTodoInput) {
    return insertTodo(input);
}

export async function update(id: string, changes: UpdateTodoInput) {
    const todo = await updateTodoById(id, changes);
    if (!todo) {
        raise(AppErrors.NOT_FOUND, { message: `Todo '${id}' was not found.` });
    }
    return todo;
}

export async function markDone(id: string) {
    const todo = await updateTodoById(id, { done: true });
    if (!todo) {
        raise(AppErrors.NOT_FOUND, { message: `Todo '${id}' was not found.` });
    }
    return todo;
}

export async function remove(id: string) {
    const todo = await removeTodoById(id);
    if (!todo) {
        raise(AppErrors.NOT_FOUND, { message: `Todo '${id}' was not found.` });
    }
}
