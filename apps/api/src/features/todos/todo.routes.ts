import { Router } from 'express';

import {
    createTodo,
    deleteTodo,
    getTodo,
    listTodos,
    markTodoDone,
    updateTodo,
} from './todo.controller.js';

export const todoRoutes = Router();

todoRoutes.get('/', listTodos);
todoRoutes.post('/', createTodo);
todoRoutes.get('/:id', getTodo);
todoRoutes.patch('/:id', updateTodo);
todoRoutes.patch('/:id/done', markTodoDone);
todoRoutes.delete('/:id', deleteTodo);
