import type { RouteHandler } from "@hono/zod-openapi";
import { and, db, eq, ilike, isNull, or, prizes, winners } from "@raffle_v2/db";
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

  const countWhereClause = search
    ? and(
        isNull(prizes.deletedAt),
        or(ilike(prizes.prize, `%${search}%`), ilike(prizes.sponsor, `%${search}%`)),
      )
    : isNull(prizes.deletedAt);

  const result = await paginate({
    page,
    pageSize,
    count: () => db.$count(prizes, countWhereClause),
    query: async ({ limit, offset }) => {
      const rows = await db.query.prizes.findMany({
        where: (fields, { and: andWhere, ilike: ilikeWhere, isNull: isNullWhere, or: orWhere }) => {
          const conditions = [isNullWhere(fields.deletedAt)];

          if (search) {
            const prizeSearch = ilikeWhere(fields.prize, `%${search}%`);
            const sponsorSearch = ilikeWhere(fields.sponsor, `%${search}%`);
            const searchCondition =
              prizeSearch && sponsorSearch
                ? orWhere(prizeSearch, sponsorSearch)
                : (prizeSearch ?? sponsorSearch);

            if (searchCondition) {
              conditions.push(searchCondition);
            }
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
            where: (fields, { isNull: isNullWhere }) => isNullWhere(fields.deletedAt),
          },
        },
      });

      return rows.map(({ winners: existingWinners, ...row }) => ({
        ...row,
        numberOfItemsLeft: Math.max(0, row.numberOfWinners - existingWinners.length),
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
    with: {
      winners: {
        columns: { id: true },
        where: (fields, { isNull: isNullWhere }) => isNullWhere(fields.deletedAt),
      },
    },
  });

  if (!prize) {
    return c.json({ message: "Prize not found" }, 404);
  }

  const { winners: activeWinners, ...prizeData } = prize;

  return c.json(
    {
      ...prizeData,
      numberOfItemsLeft: Math.max(0, prize.numberOfWinners - activeWinners.length),
    },
    200,
  );
};

export const createPrizeHandler: RouteHandler<typeof createPrizeRoute, AppEnv> = async (c) => {
  const body = c.req.valid("json");

  const [newPrize] = await db.insert(prizes).values(body).returning();

  if (!newPrize) {
    throw new Error("Prize creation did not return a record");
  }

  return c.json(
    {
      ...newPrize,
      numberOfItemsLeft: newPrize.numberOfWinners,
    },
    201,
  );
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
  const { id, prize, numberOfWinners, sponsor, imageUrl, sponsorImage, type, raffleMode } =
    c.req.valid("json");

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
      raffleMode: raffleMode ?? null,
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
