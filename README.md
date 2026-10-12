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

## Run the API with Docker

The API has its own Dockerfile at `apps/api/Dockerfile`. Build from the
repository root so the Docker build can access the npm workspace packages:

```sh
docker build -f apps/api/Dockerfile -t todo-api .
```

Run the API and point `DB_URL` at the MongoDB instance that is already running.
The address must be reachable from the API container. If MongoDB is another
container, add `--network <existing-network>` to the command below and use
MongoDB's network hostname.

```sh
docker run --rm --name todo-api --network host \
  -e NODE_ENV=production \
  -e DB_URL=mongodb://localhost:27017/todo \
  -e DB_NAME=todo \
  todo-api
```

Replace `mongo-host` with the hostname or address of the existing MongoDB
instance. `localhost` inside the API container refers to the API container
itself. The API listens on port `8000` and is available at
`http://localhost:8000`. A separate Dockerfile for `apps/website` can be added
when website containerization is needed.
