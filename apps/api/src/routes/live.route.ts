import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import type { AppEnv } from "../lib/context";
import { broadcastEvent } from "../lib/ws";

const app = new OpenAPIHono<AppEnv>();

const displayTypeEnum = z.enum(["standby", "live"]);

export const displaySelection = createRoute({
  method: "post",
  path: "/type",
  tags: ["Live"],
  summary: "Select Type of Display",
  request: {
    body: {
      content: {
        "application/json": {
          schema: z.object({
            type: displayTypeEnum,
          }),
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean(),
            type: displayTypeEnum,
          }),
        },
      },
      description: "Prize selection broadcasted to LiveDraw",
    },
  },
});

const routes = app.openapi(displaySelection, async (c) => {
  const { type } = c.req.valid("json");

  broadcastEvent("DISPLAY_SELECTION", type);

  return c.json({ success: true, type }, 200);
});

export default routes;
