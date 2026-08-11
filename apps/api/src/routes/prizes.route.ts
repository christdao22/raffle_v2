// prizes.routes.ts (Route Definitions / Schemas)
import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { paginatedResponseSchema, paginationQuerySchema, prizeSchema } from "@raffle_v2/shared";
import {
  createPrizeHandler,
  getPrizeHandler,
  listPrizesHandler,
} from "../controller/prize.controller";
import type { AppEnv } from "../lib/context";

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
  path: "/prizes/{id}",
  tags: ["Prizes"],
  summary: "Get prize details by ID",
  request: {
    params: z.object({
      id: z.string().uuid(),
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
  path: "/prizes",
  tags: ["Prizes"],
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

const routes = app
  .openapi(listPrizesRoute, listPrizesHandler)
  .openapi(getPrizeRoute, getPrizeHandler)
  .openapi(createPrizeRoute, createPrizeHandler);

export default routes;
