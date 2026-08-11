import { serve } from "@hono/node-server";
import { OpenAPIHono } from "@hono/zod-openapi";
import { Scalar } from "@scalar/hono-api-reference";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { env } from "./env";
import { auth } from "./lib/auth";
import type { AppEnv } from "./lib/context";
import authRoute from "./routes/auth.route";
import healthRoute from "./routes/health";
import prizesRoute from "./routes/prizes.route";
import regionsRoute from "./routes/region.route";

const app = new OpenAPIHono<AppEnv>();

app.use(logger());

app.use(
  "/*",
  cors({
    origin: env.WEB_URL,
    credentials: true,
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
  }),
);

app.onError((err, c) => {
  console.error(err);
  return c.json({ error: "Internal server error" }, 500);
});

app.notFound((c) => c.json({ error: "Not found" }, 404));

// Better Auth owns everything under /api/auth/** (sign-up, sign-in, sign-out,
// get-session, etc). This has to be mounted with app.on(...) rather than
// app.openapi(...) since Better Auth's handler isn't a zod-openapi route.
app.on(["POST", "GET"], "/api/auth/**", (c) => auth.handler(c.req.raw));

const routes = app
  .route("/health", healthRoute)
  .route("/prizes", prizesRoute)
  .route("/regions", regionsRoute)
  // .route("/participants", participantsRoute)
  // .route("/registration", registrationRoute)
  // .route("/school", schoolRoute)
  .route("/user", authRoute);

app.doc("/doc", {
  openapi: "3.1.0",
  info: {
    title: "Raffle_v2 API",
    version: "0.1.0",
    description: "HR/participant raffle_v2 API - Hono + Drizzle + Better Auth.",
  },
  servers: [{ url: env.BETTER_AUTH_URL, description: "Current environment" }],
});

app.get("/reference", Scalar({ url: "/doc" }));

serve({ fetch: app.fetch, port: env.PORT }, (info) => {
  console.log(`Raffle_v2 API listening on http://localhost:${info.port}`);
  console.log(`  API reference: http://localhost:${info.port}/reference`);
});

// Used by apps/web for the fully-typed hc<AppType>() RPC client - this is
// what makes "shared types between front and back" actually zero-duplication
// instead of hand-copied interfaces.
export type AppType = typeof routes;
