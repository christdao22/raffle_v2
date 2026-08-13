import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { paginatedResponseSchema, paginationQuerySchema, regionSchema } from "@raffle_v2/shared";
import { listRegionHandler } from "../controller/region.controller";
import type { AppEnv } from "../lib/context";

const app = new OpenAPIHono<AppEnv>();

// const ErrorSchema = z.object({
//   message: z.string(),
// });

export const regionsQuerySchema = paginationQuerySchema.extend({
  search: z.string().trim().min(1).optional(),
});

export const regionPersonEligible = regionSchema.extend({
  eligibleCount: z.number(),
});

export const regionsRoute = createRoute({
  method: "get",
  path: "/",
  tags: ["Regions"],
  request: { query: regionsQuerySchema },
  summary: "Get all regions",
  responses: {
    200: {
      content: { "application/json": { schema: paginatedResponseSchema(regionPersonEligible) } },
      description: "Successfully retrieved list of regions",
    },
  },
});

const routes = app.openapi(regionsRoute, listRegionHandler);

export default routes;
