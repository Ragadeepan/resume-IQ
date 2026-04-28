FROM node:22-alpine AS deps
WORKDIR /app

COPY package.json package-lock.json ./
COPY server/package.json server/package.json

RUN npm ci --workspace server --include-workspace-root=false

FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

COPY --from=deps /app/node_modules ./node_modules
COPY package.json package-lock.json ./
COPY server ./server

RUN npm run prisma:generate --workspace server

EXPOSE 5000

CMD ["npm", "run", "start", "--workspace", "server"]

