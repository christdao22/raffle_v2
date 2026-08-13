import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import type { AppEnv } from "../lib/context";
import { broadcastEvent, getLatestEvents, getSocketCount } from "../lib/ws";
import { winnerPersonSchema } from "./winners.route";

const app = new OpenAPIHono<AppEnv>();

const displayTypeEnum = z.enum(["standby", "live"]);
const latestEventsSchema = z.record(z.string(), z.object({ payload: z.unknown() }));

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

export const getLiveStatusRoute = createRoute({
  method: "get",
  path: "/status",
  tags: ["Live"],
  summary: "Viewer Counter",
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.object({ connectedSockets: z.number() }),
        },
      },
      description: "Current live viewer count",
    },
  },
});

export const getLiveEvents = createRoute({
  method: "get",
  path: "/events",
  tags: ["Live"],
  summary: "Active Events",
  responses: {
    200: {
      content: {
        "application/json": {
          schema: latestEventsSchema,
        },
      },
      description: "Current live events",
    },
  },
});

export const displayWinners = createRoute({
  method: "post",
  path: "/winners",
  tags: ["Live"],
  summary: "Display Winners to LiveDraw",
  request: {
    body: {
      content: {
        "application/json": {
          schema: z.object({
            persons: z.array(winnerPersonSchema),
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
            persons: z.array(winnerPersonSchema),
          }),
        },
      },
      description: "Prize selection broadcasted to LiveDraw",
    },
  },
});

const routes = app
  .openapi(displaySelection, async (c) => {
    const { type } = c.req.valid("json");
    broadcastEvent("DISPLAY_SELECTION", type);
    return c.json({ success: true, type }, 200);
  })
  .openapi(getLiveStatusRoute, (c) => {
    return c.json({ connectedSockets: getSocketCount() }, 200);
  })
  .openapi(getLiveEvents, (c) => {
    return c.json(getLatestEvents(), 200);
  })
  .openapi(displayWinners, async (c) => {
    const { persons } = c.req.valid("json");
    broadcastEvent("WINNERS", persons);
    return c.json({ success: true, persons }, 200);
  });

export default routes;
