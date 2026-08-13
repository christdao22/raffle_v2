# apps/web/Dockerfile
# Build context MUST be the monorepo root, e.g.:
#   docker build -f apps/web/Dockerfile -t raffle-web .

FROM node:22-alpine AS base
RUN apk add --no-cache libc6-compat
RUN corepack enable

# ---- 1. Prune the monorepo down to only what @raffle_v2/web needs ----
FROM base AS pruner
WORKDIR /app
COPY . .
RUN npx turbo prune @raffle_v2/web --docker

# ---- 2. Install deps + build ----
FROM base AS builder
WORKDIR /app
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN pnpm install --frozen-lockfile

COPY --from=pruner /app/out/full/ .

# Accept Build Args from docker-compose.yml
ARG VITE_API_URL
ARG API_URL

ENV VITE_API_URL=$VITE_API_URL
ENV VITE_WS_URL=wss://$API_URL
ENV API_URL=$API_URL

RUN pnpm turbo run build --filter=@raffle_v2/web...

# ---- 3. Serve static build with nginx ----
FROM nginx:1.27-alpine AS runner
COPY --from=builder /app/apps/web/dist /usr/share/nginx/html
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
