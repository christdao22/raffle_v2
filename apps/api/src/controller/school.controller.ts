import { db, ilike, or } from "@raffle_v2/db";
import { school } from "@raffle_v2/db/schema";
import type { RouteHandler } from "@hono/zod-openapi";
import type { AppEnv } from "../lib/context";
import { paginate } from "../lib/pagination";
import type { schoolCreateRoute, schoolListRoute } from "../routes/school.route";

export const listSchool: RouteHandler<typeof schoolListRoute, AppEnv> = async (c) => {
  const { page, pageSize, search } = c.req.valid("query");

  const whereClause = search ? or(ilike(school.name, `%${search}%`)) : undefined;

  const result = await paginate({
    page,
    pageSize,
    count: () => db.$count(school, whereClause),
    query: ({ limit, offset }) =>
      db.query.school.findMany({
        where: whereClause,
        limit,
        offset,
        orderBy: (fields, { asc }) => [asc(fields.id)],
      }),
  });

  return c.json(result, 200);
};

export const createSchool: RouteHandler<typeof schoolCreateRoute, AppEnv> = async (c) => {
  const body = c.req.valid("json");

  const [row] = await db.insert(school).values(body).returning();
  return c.json(row, 201);
};

