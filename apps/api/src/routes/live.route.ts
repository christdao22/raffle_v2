import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { personSchema } from "@raffle_v2/shared";
import type { AppEnv } from "../lib/context";
import { broadcastEvent, getLatestEvents, getSocketCount } from "../lib/ws";

const app = new OpenAPIHono<AppEnv>();

const displayTypeEnum = z.enum(["standby", "live", "unclaimed", "live-unclaimed"]);
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
            persons: z.array(personSchema),
            drawDuration: z.number(),
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
            persons: z.array(personSchema),
            drawDuration: z.number(),
          }),
        },
      },
      description: "Prize selection broadcasted to LiveDraw",
    },
  },
});

export const displayCountdown = createRoute({
  method: "post",
  path: "/countdown",
  tags: ["Live"],
  summary: "Broadcast countdown before revealing winners",
  request: {
    body: {
      content: {
        "application/json": {
          schema: z.object({
            duration: z.number(),
            startedAt: z.number(),
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
            duration: z.number(),
            startedAt: z.number(),
          }),
        },
      },
      description: "Countdown broadcasted to LiveDraw",
    },
  },
});

export const closeModalRoute = createRoute({
  method: "post",
  path: "/modal-closed",
  tags: ["Live"],
  summary: "Broadcast modal closed event to LiveDraw",
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean(),
          }),
        },
      },
      description: "Modal closed event broadcasted to LiveDraw",
    },
  },
});

export const winnerCountRoute = createRoute({
  method: "post",
  path: "/winner-count",
  tags: ["Live"],
  summary: "Broadcast Number of Winners",
  request: {
    body: {
      content: {
        "application/json": {
          schema: z.object({
            count: z.number(),
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
            count: z.number(),
          }),
        },
      },
      description: "Broadcast Number of Winners to be drawn",
    },
  },
});

export const displayRegion = createRoute({
  method: "post",
  path: "/region",
  tags: ["Live"],
  summary: "/region",
  request: {
    body: {
      content: {
        "application/json": {
          schema: z.object({
            regions: z.array(z.string()),
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
            regions: z.array(z.string()),
          }),
        },
      },
      description: "Region selection broadcasted to LiveDraw",
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
  .openapi(displayCountdown, async (c) => {
    const { duration, startedAt } = c.req.valid("json");
    broadcastEvent("COUNTDOWN", { duration, startedAt });
    return c.json({ success: true, duration, startedAt }, 200);
  })
  .openapi(displayWinners, async (c) => {
    const { persons, drawDuration } = c.req.valid("json");
    broadcastEvent("WINNERS", { persons, drawDuration });
    return c.json({ success: true, persons, drawDuration }, 200);
  })
  .openapi(closeModalRoute, async (c) => {
    broadcastEvent("MODAL_CLOSED", true);
    return c.json({ success: true }, 200);
  })
  .openapi(winnerCountRoute, async (c) => {
    const { count } = c.req.valid("json");
    broadcastEvent("WINNER_COUNT", { count });
    return c.json({ success: true, count }, 200);
  })
  .openapi(displayRegion, async (c) => {
    const { regions } = c.req.valid("json");
    broadcastEvent("REGIONS_SELECTED", regions);
    return c.json({ success: true, regions }, 200);
  });

export default routes;
