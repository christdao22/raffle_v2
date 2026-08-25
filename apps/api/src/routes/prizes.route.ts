import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { paginatedResponseSchema, paginationQuerySchema, prizeSchema } from "@raffle_v2/shared";
import {
  createPrizeHandler,
  deletePrizeHandler,
  getPrizeHandler,
  listPrizesHandler,
  selectPrizeHandler,
  updatePrizeHandler,
} from "../controller/prize.controller";
import type { AppEnv } from "../lib/context";
import { requireAuth } from "../middleware/auth";
import { requireRole } from "../middleware/rbac";

const app = new OpenAPIHono<AppEnv>();

const ErrorSchema = z.object({
  message: z.string(),
});

export const listPrizesQuerySchema = paginationQuerySchema.extend({
  search: z.string().trim().min(1).optional(),
});

export const listPrizesRoute = createRoute({
  method: "get",
  path: "/",
  tags: ["Prizes"],
  request: { query: listPrizesQuerySchema },
  summary: "Get all prize tiers",
  responses: {
    200: {
      content: { "application/json": { schema: paginatedResponseSchema(prizeSchema) } },
      description: "Successfully retrieved list of prizes",
    },
  },
});

export const getPrizeRoute = createRoute({
  method: "get",
  path: "/{id}",
  tags: ["Prizes"],
  summary: "Get prize details by ID",
  request: {
    params: z.object({
      id: z.uuid(),
    }),
  },
  responses: {
    200: {
      content: { "application/json": { schema: prizeSchema } },
      description: "Successfully retrieved prize details",
    },
    404: {
      content: { "application/json": { schema: ErrorSchema } },
      description: "Prize not found",
    },
  },
});

export const createPrizeRoute = createRoute({
  method: "post",
  path: "/",
  tags: ["Prizes"],
  middleware: [requireAuth, requireRole("admin")] as const,
  summary: "Create a new prize tier",
  request: {
    body: {
      content: {
        "application/json": {
          schema: prizeSchema.omit({ id: true }),
        },
      },
    },
  },
  responses: {
    201: {
      content: { "application/json": { schema: prizeSchema } },
      description: "Prize successfully created",
    },
  },
});

export const deletePrizeRoute = createRoute({
  method: "delete",
  path: "/delete",
  tags: ["Prizes"],
  summary: "Delete prize tier",
  request: {
    body: {
      content: {
        "application/json": {
          schema: z.object({
            prizeId: z.string().uuid(),
          }),
        },
      },
    },
  },
  responses: {
    200: {
      content: { "application/json": { schema: z.object({ success: z.boolean() }) } },
      description: "Prize successfully deleted",
    },
    400: {
      content: { "application/json": { schema: ErrorSchema } },
      description: "The user is not allowed or the prize was not found",
    },
  },
});

export const updatePrizeRoute = createRoute({
  method: "patch",
  path: "/update/{id}",
  tags: ["Prizes"],
  middleware: [requireAuth, requireRole("admin")] as const,
  summary: "Update prize tier",
  request: {
    body: {
      content: {
        "application/json": {
          schema: prizeSchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: { "application/json": { schema: z.object({ success: z.boolean() }) } },
      description: "Prize successfully updated",
    },
    400: {
      content: { "application/json": { schema: ErrorSchema } },
      description: "The user is not allowed or the prize was not found",
    },
  },
});

export const selectPrizeRoute = createRoute({
  method: "post",
  path: "/select",
  tags: ["Prizes"],
  summary: "Select active prize for live draw",
  request: {
    body: {
      content: {
        "application/json": {
          schema: z.object({
            prizeId: z.string(),
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
            prizeId: z.string(),
          }),
        },
      },
      description: "Prize selection broadcasted to LiveDraw",
    },
  },
});

const routes = app
  .openapi(listPrizesRoute, listPrizesHandler)
  .openapi(getPrizeRoute, getPrizeHandler)
  .openapi(createPrizeRoute, createPrizeHandler)
  .openapi(deletePrizeRoute, deletePrizeHandler)
  .openapi(updatePrizeRoute, updatePrizeHandler)
  .openapi(selectPrizeRoute, selectPrizeHandler);

export default routes;
