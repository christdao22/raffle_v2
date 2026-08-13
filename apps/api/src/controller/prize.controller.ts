import type { RouteHandler } from "@hono/zod-openapi";
import { and, db, ilike, prizes, sql } from "@raffle_v2/db";
import type { AppEnv } from "../lib/context";
import { paginate } from "../lib/pagination";
import { broadcastEvent } from "../lib/ws";
import type {
  createPrizeRoute,
  getPrizeRoute,
  listPrizesRoute,
  selectPrizeRoute,
} from "../routes/prizes.route";
// Fixed file import path: prizes.routes instead of prizes.route

export const listPrizesHandler: RouteHandler<typeof listPrizesRoute, AppEnv> = async (c) => {
  const { page, pageSize, search } = c.req.valid("query");

  // Filter for db.$count
  const countFilter = sql`${prizes.numberOfWinners} > (
    SELECT COUNT(*)::int FROM winners WHERE winners.prize_id = ${prizes.id}
  )`;

  const countWhereClause = search
    ? and(ilike(prizes.prize, `%${search}%`), countFilter)
    : countFilter;

  const result = await paginate({
    page,
    pageSize,
    count: () => db.$count(prizes, countWhereClause),
    query: async ({ limit, offset }) => {
      const rows = await db.query.prizes.findMany({
        where: (fields, { and: andWhere, ilike: ilikeWhere, sql: sqlWhere }) => {
          const conditions = [
            sqlWhere`${fields.numberOfWinners} > (
              SELECT COUNT(*)::int FROM winners WHERE winners.prize_id = ${fields.id}
            )`,
          ];

          if (search) {
            conditions.push(ilikeWhere(fields.prize, `%${search}%`));
          }

          return andWhere(...conditions);
        },
        limit,
        offset,
        orderBy: (fields, { asc }) => [asc(fields.id)],
        with: {
          winners: {
            columns: {
              id: true,
            },
          },
        },
      });

      return rows.map(({ winners: existingWinners, ...row }) => ({
        ...row,
        numberOfWinners: Math.max(0, row.numberOfWinners - existingWinners.length),
        sponsor: row.sponsor ?? "",
        imageUrl: row.imageUrl ?? undefined,
        sponsorImage: row.sponsorImage ?? undefined,
      }));
    },
  });

  return c.json(result, 200);
};

export const getPrizeHandler: RouteHandler<typeof getPrizeRoute, AppEnv> = async (c) => {
  const { id } = c.req.valid("param");

  const prize = await db.query.prizes.findFirst({
    where: (prizes, { eq }) => eq(prizes.id, id),
  });

  if (!prize) {
    return c.json({ message: "Prize not found" }, 404);
  }

  return c.json(prize, 200);
};

export const createPrizeHandler: RouteHandler<typeof createPrizeRoute, AppEnv> = async (c) => {
  const body = c.req.valid("json");

  const newPrize = {
    id: crypto.randomUUID(),
    ...body,
  };

  return c.json(newPrize, 201);
};

export const selectPrizeHandler: RouteHandler<typeof selectPrizeRoute, AppEnv> = async (c) => {
  const { prizeId } = c.req.valid("json");

  // 1. Drizzle DB Update (e.g., mark prize as active)
  // await db.update(prizes).set({ isActive: true }).where(eq(prizes.id, prizeId));

  // 2. Broadcast event to WebSocket subscribers on LiveDraw
  broadcastEvent("PRIZE_SELECTED", { prizeId });

  return c.json({ success: true, prizeId }, 200);
};
