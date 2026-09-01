import { serve, upgradeWebSocket } from "@hono/node-server";
import { OpenAPIHono } from "@hono/zod-openapi";
import { Scalar } from "@scalar/hono-api-reference";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { WebSocketServer } from "ws";
import { env } from "./env";
import { auth } from "./lib/auth";
import type { AppEnv } from "./lib/context";
import { activeSockets, broadcastEvent } from "./lib/ws";
import authRoute from "./routes/auth.route";
import healthRoute from "./routes/health";
import liveRoute from "./routes/live.route";
import prizesRoute from "./routes/prizes.route";
import regionsRoute from "./routes/region.route";
import reportRoute from "./routes/report.route";
import winnersRoute from "./routes/winners.route";

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

app.on(["POST", "GET"], "/api/auth/**", (c) => auth.handler(c.req.raw));

// WebSocket route with WSContext typing
app.get(
  "/ws",
  upgradeWebSocket(() => ({
    onOpen(_event, ws) {
      activeSockets.add(ws);
      broadcastEvent("VIEWER_COUNT", { count: activeSockets.size });
    },
    onClose(_event, ws) {
      activeSockets.delete(ws);
      broadcastEvent("VIEWER_COUNT", { count: activeSockets.size });
    },
  })),
);

const routes = app
  .route("/health", healthRoute)
  .route("/prizes", prizesRoute)
  .route("/live", liveRoute)
  .route("/user", authRoute)
  .route("/regions", regionsRoute)
  .route("/winners", winnersRoute)
  .route("/report", reportRoute);

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

// Initialize WebSocketServer alongside HTTP listener
const wss = new WebSocketServer({ noServer: true });

serve({ fetch: app.fetch, port: env.PORT, websocket: { server: wss } }, (info) => {
  console.log(`Raffle_v2 API listening on http://localhost:${info.port}`);
  console.log(`  API reference: http://localhost:${info.port}/reference`);
});

export type AppType = typeof routes;
