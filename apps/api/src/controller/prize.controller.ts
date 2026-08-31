import type { RouteHandler } from "@hono/zod-openapi";
import { and, db, eq, ilike, isNull, prizes, sql, winners } from "@raffle_v2/db";
import { canDeletePrize } from "../guard/prize-delete.guard";
import type { AppEnv } from "../lib/context";
import { paginate } from "../lib/pagination";
import { broadcastEvent } from "../lib/ws";
import type {
  createPrizeRoute,
  deletePrizeRoute,
  getPrizeRoute,
  listPrizesRoute,
  selectPrizeRoute,
  updatePrizeRoute,
} from "../routes/prizes.route";
// Fixed file import path: prizes.routes instead of prizes.route

export const listPrizesHandler: RouteHandler<typeof listPrizesRoute, AppEnv> = async (c) => {
  const { page, pageSize, search } = c.req.valid("query");

  // Filter for db.$count
  const countFilter = sql`${prizes.numberOfWinners} > (
    SELECT COUNT(*)::int FROM winners WHERE winners.prize_id = ${prizes.id}
  )`;

  const countWhereClause = search
    ? and(isNull(prizes.deletedAt), ilike(prizes.prize, `%${search}%`), countFilter)
    : and(isNull(prizes.deletedAt), countFilter);

  const result = await paginate({
    page,
    pageSize,
    count: () => db.$count(prizes, countWhereClause),
    query: async ({ limit, offset }) => {
      const rows = await db.query.prizes.findMany({
        where: (
          fields,
          { and: andWhere, ilike: ilikeWhere, isNull: isNullWhere, sql: sqlWhere },
        ) => {
          const conditions = [
            isNullWhere(fields.deletedAt),
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
    where: (fields, { and: andWhere, eq: eqWhere, isNull: isNullWhere }) =>
      andWhere(eqWhere(fields.id, id), isNullWhere(fields.deletedAt)),
  });

  if (!prize) {
    return c.json({ message: "Prize not found" }, 404);
  }

  return c.json(prize, 200);
};

export const createPrizeHandler: RouteHandler<typeof createPrizeRoute, AppEnv> = async (c) => {
  const body = c.req.valid("json");

  const [newPrize] = await db.insert(prizes).values(body).returning();

  return c.json(newPrize, 201);
};

export const deletePrizeHandler: RouteHandler<typeof deletePrizeRoute, AppEnv> = async (c) => {
  const { prizeId } = c.req.valid("json");

  const [existing] = await db.select().from(prizes).where(eq(prizes.id, prizeId));

  if (!existing) {
    return c.json({ message: "Prize not found" }, 400);
  }

  const winnerCount = await db.$count(winners, eq(winners.prizeId, prizeId));

  if (!canDeletePrize(winnerCount)) {
    return c.json({ message: "Cannot delete a prize that has winners assigned." }, 400);
  }

  await db.update(prizes).set({ deletedAt: new Date() }).where(eq(prizes.id, prizeId));

  return c.json({ success: true }, 200);
};

export const updatePrizeHandler: RouteHandler<typeof updatePrizeRoute, AppEnv> = async (c) => {
  const { id, prize, numberOfWinners, sponsor, imageUrl, sponsorImage, type } = c.req.valid("json");

  const [existing] = await db
    .select()
    .from(prizes)
    .where(and(eq(prizes.id, id), isNull(prizes.deletedAt)));

  if (!existing) {
    return c.json({ message: "Prize not found" }, 400);
  }

  await db
    .update(prizes)
    .set({
      prize,
      numberOfWinners,
      sponsor: sponsor ?? null,
      imageUrl: imageUrl ?? null,
      sponsorImage: sponsorImage ?? null,
      type: type ?? null,
    })
    .where(eq(prizes.id, id));

  return c.json({ success: true }, 200);
};

export const selectPrizeHandler: RouteHandler<typeof selectPrizeRoute, AppEnv> = async (c) => {
  const { prizeId } = c.req.valid("json");

  // 1. Drizzle DB Update (e.g., mark prize as active)
  // await db.update(prizes).set({ isActive: true }).where(eq(prizes.id, prizeId));

  // 2. Broadcast event to WebSocket subscribers on LiveDraw
  broadcastEvent("PRIZE_SELECTED", { prizeId });

  return c.json({ success: true, prizeId }, 200);
};
