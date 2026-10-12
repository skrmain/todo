# todo

## Tech

1. npm(workspaces)
2. typescript
3. react-typescript with vite
4. NodeJS, express, mongoose
5. MongoDB

## Folder Structure

```tree
todo
- apps
    - website
    - api
        - src/features/todos (routes, controllers, services, repository, validation)
- packages
    - db
    - ui
- .editorconfig
- package.json
- README.md
- tsconfig.node.json
```

## API overview

The Express API connects to MongoDB and exposes CRUD endpoints at `/todos`.
The list endpoint supports pagination (`page`, `limit`), case-insensitive
search (`search`), filtering by completion (`done=true|false`), and sorting by
`title` or `createdAt` (`sortBy`, `sortOrder`). Request bodies and query
parameters are validated before use.

Todo endpoints: `GET /todos`, `GET /todos/:id`, `POST /todos`,
`PATCH /todos/:id`, `PATCH /todos/:id/done`, and `DELETE /todos/:id`.
Todos start with `done: false`; the update endpoint can also set the `done`
field to mark a todo done or reopen it.
