import type { Request, Response } from 'express';

import { HttpStatus } from '../../common/http-status.js';
import { parseInput } from '../../common/validation.js';
import * as todoService from './todo.service.js';
import {
    createTodoSchema,
    listTodosSchema,
    todoIdSchema,
    updateTodoSchema,
} from './todo.validation.js';

export async function listTodos(req: Request, res: Response) {
    const query = parseInput(listTodosSchema, req.query);
    res.send(await todoService.list(query));
}

export async function getTodo(req: Request, res: Response) {
    const { id } = parseInput(todoIdSchema, req.params);
    res.send({ data: await todoService.get(id) });
}

export async function createTodo(req: Request, res: Response) {
    const input = parseInput(createTodoSchema, req.body);
    res.status(HttpStatus.Created).send({ data: await todoService.create(input) });
}

export async function updateTodo(req: Request, res: Response) {
    const { id } = parseInput(todoIdSchema, req.params);
    const changes = parseInput(updateTodoSchema, req.body);
    res.send({ data: await todoService.update(id, changes) });
}

export async function markTodoDone(req: Request, res: Response) {
    const { id } = parseInput(todoIdSchema, req.params);
    res.send({ data: await todoService.markDone(id) });
}

export async function deleteTodo(req: Request, res: Response) {
    const { id } = parseInput(todoIdSchema, req.params);
    await todoService.remove(id);
    res.status(HttpStatus.NoContent).end();
}
