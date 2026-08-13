# apps/api/Dockerfile
# Build context MUST be the monorepo root, e.g.:
#   docker build -f apps/api/Dockerfile -t .

FROM node:22-alpine AS base
RUN apk add --no-cache libc6-compat
RUN corepack enable

# ---- 1. Prune the monorepo down to only what @raffle_v2/api needs ----
FROM base AS pruner
WORKDIR /app
COPY . .
RUN npx turbo prune @raffle_v2/api --docker

# ---- 2. Install deps + build ----
FROM base AS builder
WORKDIR /app
# First copy just the pruned lockfile/package.jsons -> better layer caching
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN pnpm install --frozen-lockfile

# Now copy the actual pruned source
COPY --from=pruner /app/out/full/ .
RUN pnpm turbo run build --filter=@raffle_v2/api...

# ---- 3. Slim runtime image ----
FROM base AS runner
WORKDIR /app
RUN addgroup --system --gid 1001 hono && adduser --system --uid 1001 hono
COPY --from=builder --chown=hono:hono /app .

USER hono
ENV NODE_ENV=production
EXPOSE 3000

# Adjust this to wherever your build actually emits the entrypoint
CMD ["node", "apps/api/dist/index.js"]
