import type { RouteHandler } from "@hono/zod-openapi";
import { db, regions } from "@raffle_v2/db";
import type { AppEnv } from "../lib/context";
import { paginate } from "../lib/pagination";
import type { regionsRoute } from "../routes/region.route";

export const listRegionHandler: RouteHandler<typeof regionsRoute, AppEnv> = async (c) => {
  const { page, pageSize } = c.req.valid("query");

  const result = await paginate({
    page,
    pageSize,
    count: () => db.$count(regions),
    query: async ({ limit, offset }) => {
      const rows = await db.query.regions.findMany({
        limit,
        offset,
        orderBy: (fields, { asc }) => [asc(fields.id)],
      });

      return rows;
    },
  });

  return c.json(result, 200);
};
