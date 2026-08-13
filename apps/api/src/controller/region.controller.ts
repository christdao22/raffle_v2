import type { RouteHandler } from "@hono/zod-openapi";
import { asc, db, eq, persons, regions, sql, winners } from "@raffle_v2/db";
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
      const rows = await db
        .select({
          id: regions.id,
          region: regions.region,
          regionName: regions.regionName,
          eligibleCount: sql<number>`count(case when ${winners.personId} is null and ${persons.isEligible} = true then ${persons.id} end)::int`,
        })
        .from(regions)
        .leftJoin(persons, eq(persons.regionId, regions.id))
        .leftJoin(winners, eq(winners.personId, persons.id))
        .groupBy(regions.id)
        .orderBy(asc(regions.id))
        .limit(limit)
        .offset(offset);

      return rows;
    },
  });

  return c.json(result, 200);
};
