# RaffleV2

A starter monorepo: Turborepo + pnpm workspaces, Hono + Drizzle + Postgres API,
React + Tailwind + TanStack Query frontend, Better Auth with role-based access
control, Biome, and OpenAPI docs.

## Stack

- **Monorepo**: pnpm workspaces + Turborepo
- **API**: Hono, `@hono/zod-openapi`, Drizzle ORM (postgres-js), Better Auth
- **Frontend**: React 19, Vite, Tailwind CSS v4, TanStack Query, React Router
- **Shared types**: a `packages/shared` package of Zod schemas, plus a fully
  typed Hono RPC client on the frontend (`hc<AppType>()`) - see
  [Shared types](#shared-types-between-front-and-back) below
- **Auth**: Better Auth (email/password), with a `role` field on `user`
- **Tooling**: Biome (lint + format), OpenAPI docs via Scalar

## Project structure

```
apps/
  api/    Hono API - auth, RBAC middleware, participants CRUD, OpenAPI docs
  web/    React app - login/register, dashboard, participants
packages/
  db/                 Drizzle schema + client (Postgres)
  shared/              Zod schemas shared by API validation + frontend
  ui/                  Button/Input/Label/Card/Badge - Tailwind + cva
  typescript-config/   Shared tsconfig presets
```

## Getting started

**Prerequisites**: Node 20+, pnpm, Docker (for Postgres) or a local Postgres instance.

```bash
pnpm install

# Start Postgres
docker compose up -d

# Copy env files and fill in values
cp apps/api/.env.example apps/api/.env
cp packages/db/.env.example packages/db/.env
cp apps/web/.env.example apps/web/.env

# Generate a real secret for apps/api/.env's BETTER_AUTH_SECRET
npx @better-auth/cli secret

# Push the schema to Postgres
pnpm db:push

# Create an admin user (admin@example.com / ChangeMe123! by default -
# override via SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD env vars)
pnpm seed

# Run everything
pnpm dev
```

- Web: http://localhost:5173
- API: http://localhost:3000
- API reference (Scalar): http://localhost:3000/reference
- OpenAPI spec (JSON): http://localhost:3000/doc
- Drizzle Studio: `pnpm db:studio`

Sign in with the seeded admin account, or register a new account (new
accounts default to the `participant` role - only an admin can create participant
records or promote roles).

## Shared types between front and back

Two mechanisms work together, both zero-duplication (nothing is hand-copied
between packages):

1. **`packages/shared`** holds Zod schemas (`participantSchema`,
   `createParticipantSchema`, `roleSchema`, ...). The API uses these directly as
   route validation *and* OpenAPI schema generation
   (`@hono/zod-openapi`'s `createRoute`). TS types are inferred from the same
   schemas (`z.infer<...>`), so validation, docs, and types can't drift apart.

2. **`hc<AppType>()`** (Hono's RPC client) infers request/response types
   directly from the API's actual route definitions - see
   `apps/web/src/lib/api-client.ts` and `apps/api/src/index.ts`'s exported
   `AppType`. This means the frontend's fetch calls are typed from the real
   route handlers, not a separately maintained interface.

   This works because `apps/web` has a `devDependency` on `@raffle_v2/api`
   (workspace-linked) used only for `import type` - no server code, Drizzle,
   or Postgres driver ends up in the browser bundle, only type information
   (verify with `pnpm --filter @raffle_v2/web build` and inspect
   `dist/assets/*.js` for `drizzle` or `postgres` - they won't be there).

   **Gotcha if you add new routes**: `AppType` only stays accurate if routes
   are chained directly off the app instance (`app.route(...).route(...)`),
   not called as separate un-chained statements - the latter silently drops
   the added routes from the inferred type.

The same type-only trick is used for the `role` field: the frontend's
`useSession()` wouldn't otherwise know about the custom `role` field, so
`apps/web/src/lib/auth-client.ts` uses Better Auth's `inferAdditionalFields`
client plugin with a type-only import of the server's `auth` instance.

## Role-based access control

- `user.role` is added via Better Auth's `additionalFields` config
  (`apps/api/src/lib/auth.ts`), backed by a plain `text` column (not a
  Postgres enum) - see `packages/shared/src/schemas/auth.ts`'s `ROLES`
  array, which is the single source of truth for valid role names. Adding a
  role is a one-line change there, no migration needed.
- **`input: false`** on the role field is deliberate: it stops `role` from
  being settable through the public sign-up/update-user API, so a request
  body can't just pass `role: "admin"` to self-elevate. Roles only ever
  change server-side (the seed script, or an admin-only route you add).
- `apps/api/src/middleware/auth.ts` (`requireAuth`) resolves the session
  from the request cookie and 401s if missing.
- `apps/api/src/middleware/rbac.ts` (`requireRole(...roles)`) 403s if the
  session's role isn't in the allowed list. Both are composed per-route via
  zod-openapi's `middleware` array:

  ```ts
  createRoute({
    method: "post",
    path: "/",
    middleware: [requireAuth, requireRole("admin")] as const,
    // ...
  });
  ```

## Participants <-> users

- `participants.userId` is a required, unique FK to `user.id` (cascade delete).
  The FK lives on `participants` (not `user`) on purpose: not every `user`
  needs an HR profile (e.g. an admin-only account), but every `participants`
  row must be tied to a login.
- Fields: `lastName`, `firstName`, `middleName` (nullable), `suffix`
  (nullable), `birthdate` (stored as a plain `YYYY-MM-DD` string, not a
  timestamp, so it can't drift by timezone).

## Scripts

| Command | What it does |
|---|---|
| `pnpm dev` | Run API + web together (Turborepo) |
| `pnpm build` | Build all apps/packages |
| `pnpm check-types` | Type-check everything |
| `pnpm lint` / `pnpm lint:fix` | Biome check / check + fix |
| `pnpm db:push` | Push Drizzle schema to Postgres (dev) |
| `pnpm db:generate` | Generate SQL migration files |
| `pnpm db:studio` | Open Drizzle Studio |
| `pnpm auth:generate` | Regenerate `packages/db/src/schema/auth.ts` from the Better Auth config - use this to re-verify the schema after upgrading `better-auth` |
| `pnpm seed` | Create the seed admin user |

## Suggestions for next steps

A few things deliberately left out to keep this a raffle_v2 rather than a
finished app - worth adding as you build on it:

- **Tests**: no Vitest/testing setup yet. Given RBAC is security-critical,
  I'd prioritize integration tests for `middleware/rbac.ts` and the
  participants routes first.
- **CI**: a GitHub Actions workflow running `pnpm lint`, `pnpm check-types`,
  and `pnpm build` on PRs would catch the exact class of bugs this build
  caught locally (missing direct dependencies, peer version mismatches).
- **Rate limiting** on `/api/auth/*` (sign-in especially) - Better Auth has
  a built-in rate-limit option that's off by default.
- **Password reset / email verification flows** - wired for
  email+password only right now, no email sending configured.
- **More participant fields** - position, department, hire date, participant
  number are the obvious next additions given the HR-system direction, but
  weren't part of the original spec so aren't guessed at here.
- **Husky + lint-staged** for a pre-commit Biome pass, if you want that
  enforced locally rather than just in CI.

