import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import type { AppEnv } from "../lib/context";

const app = new OpenAPIHono<AppEnv>();

const healthRoute = createRoute({
  method: "get",
  path: "/",
  tags: ["Health"],
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.object({ status: z.literal("ok"), time: z.string() }),
        },
      },
      description: "Service is up",
    },
  },
});

const routes = app.openapi(healthRoute, (c) => {
  return c.json({ status: "ok" as const, time: new Date().toISOString() }, 200);
});

export default routes;
