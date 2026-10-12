FROM node:24-alpine AS deps

WORKDIR /app

COPY package.json package-lock.json ./
COPY apps/api/package.json ./apps/api/package.json
COPY packages/db/package.json ./packages/db/package.json

RUN npm ci --include-workspace-root --workspace @todo/db --workspace @todo/api

FROM node:24-alpine AS build

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY package.json package-lock.json ./
COPY tsconfig.node.json ./
COPY apps/api ./apps/api
COPY packages/db ./packages/db

RUN npm run build --workspace=@todo/db \
    && npm run build --workspace=@todo/api

FROM node:24-alpine AS production

ENV NODE_ENV=production

WORKDIR /app

COPY package.json package-lock.json ./
COPY apps/api/package.json ./apps/api/package.json
COPY packages/db/package.json ./packages/db/package.json

RUN npm ci --omit=dev --include-workspace-root --workspace @todo/db --workspace @todo/api \
    && npm cache clean --force

COPY --from=build /app/apps/api/dist ./apps/api/dist
COPY --from=build /app/packages/db/dist ./packages/db/dist

WORKDIR /app/apps/api

EXPOSE 8000

USER node

CMD ["node", "dist/index.js"]
