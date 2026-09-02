import type { RouteHandler } from "@hono/zod-openapi";
import {
  and,
  asc,
  db,
  eq,
  ilike,
  isNull,
  persons,
  prizes,
  regions,
  sql,
  winners,
} from "@raffle_v2/db";
import type { AppEnv } from "../lib/context";
import { paginate } from "../lib/pagination";
import type {
  claimWinnerRoute,
  deleteWinnerRoute,
  listUnclaimedWinnersRoute,
  listWinnersRoute,
  redrawWinnerRoute,
} from "../routes/winners.route";

export const listWinnersHandler: RouteHandler<typeof listWinnersRoute, AppEnv> = async (c) => {
  const { page, pageSize, search } = c.req.valid("query");

  const activeWinnerCondition = and(
    isNull(winners.deletedAt),
    search ? ilike(persons.fullname, `%${search}%`) : undefined,
  );

  const result = await paginate({
    page,
    pageSize,
    count: async () => {
      const rows = await db
        .select({ count: sql<number>`count(*)` })
        .from(winners)
        .innerJoin(persons, eq(winners.personId, persons.id))
        .where(activeWinnerCondition);

      return rows[0]?.count ?? 0;
    },
    query: async ({ limit, offset }) => {
      const rows = await db
        .select({
          id: winners.id,
          isReceived: winners.isReceived,
          receivedAt: winners.receivedAt,
          createdAt: winners.createdAt,
          person: persons,
          region: {
            id: regions.id,
            region: regions.region,
            regionName: regions.regionName,
          },
          prize: prizes,
        })
        .from(winners)
        .innerJoin(persons, eq(winners.personId, persons.id))
        .innerJoin(regions, eq(persons.regionId, regions.id))
        .innerJoin(prizes, eq(winners.prizeId, prizes.id))
        .where(activeWinnerCondition)
        .orderBy(asc(winners.id))
        .limit(limit)
        .offset(offset);

      return rows.map(({ region, ...row }) => ({
        ...row,
        person: { ...row.person, region },
      }));
    },
  });

  const [receivedCounts] = await db
    .select({
      receivedCount: sql<number>`count(*) filter (where ${winners.isReceived} = true)`,
      pendingCount: sql<number>`count(*) filter (where ${winners.isReceived} = false)`,
    })
    .from(winners)
    .where(isNull(winners.deletedAt));

  const [totalPrizesResult] = await db.select({ totalPrizes: sql<number>`count(*)` }).from(prizes);

  return c.json(
    {
      ...result,
      meta: {
        ...result.meta,
        stats: {
          receivedCount: receivedCounts?.receivedCount ?? 0,
          pendingCount: receivedCounts?.pendingCount ?? 0,
          totalPrizes: totalPrizesResult?.totalPrizes ?? 0,
        },
      },
    },
    200,
  );
};

export const listUnclaimedWinnersHandler: RouteHandler<
  typeof listUnclaimedWinnersRoute,
  AppEnv
> = async (c) => {
  const { page, pageSize } = c.req.valid("query");

  const result = await paginate({
    page,
    pageSize,
    count: async () => {
      const rows = await db
        .select({ count: sql<number>`count(*)` })
        .from(winners)
        .innerJoin(persons, eq(winners.personId, persons.id))
        .where(isNull(winners.deletedAt));

      return rows[0]?.count ?? 0;
    },
    query: async ({ limit, offset }) => {
      const rows = await db
        .select({
          id: winners.id,
          isReceived: winners.isReceived,
          receivedAt: winners.receivedAt,
          createdAt: winners.createdAt,
          person: persons,
          region: {
            id: regions.id,
            region: regions.region,
            regionName: regions.regionName,
          },
          prize: prizes,
        })
        .from(winners)
        .innerJoin(persons, eq(winners.personId, persons.id))
        .innerJoin(regions, eq(persons.regionId, regions.id))
        .innerJoin(prizes, eq(winners.prizeId, prizes.id))
        .where(isNull(winners.deletedAt))
        .orderBy(asc(winners.id))
        .limit(limit)
        .offset(offset);

      return rows.map(({ region, ...row }) => ({
        ...row,
        person: { ...row.person, region },
      }));
    },
  });

  const [receivedCounts] = await db
    .select({
      receivedCount: sql<number>`count(*) filter (where ${winners.isReceived} = true)`,
      pendingCount: sql<number>`count(*) filter (where ${winners.isReceived} = false)`,
    })
    .from(winners)
    .where(isNull(winners.deletedAt));

  const [totalPrizesResult] = await db.select({ totalPrizes: sql<number>`count(*)` }).from(prizes);

  return c.json(
    {
      ...result,
      meta: {
        ...result.meta,
        stats: {
          receivedCount: receivedCounts?.receivedCount ?? 0,
          pendingCount: receivedCounts?.pendingCount ?? 0,
          totalPrizes: totalPrizesResult?.totalPrizes ?? 0,
        },
      },
    },
    200,
  );
};

export const claimWinnerHandler: RouteHandler<typeof claimWinnerRoute, AppEnv> = async (c) => {
  const { winnerId } = c.req.valid("json");
  const user = c.get("user");

  if (!user) {
    return c.json({ message: "Not Allowed" }, 400);
  }

  const [existing] = await db.select().from(winners).where(eq(winners.id, winnerId));

  if (!existing) {
    return c.json({ message: "Winner not found" }, 400);
  }

  if (existing.isReceived) {
    return c.json({ message: "Prize already claimed" }, 400);
  }

  await db
    .update(winners)
    .set({ isReceived: true, receivedAt: new Date(), givenByUserId: user.id })
    .where(eq(winners.id, winnerId));

  return c.json({ success: true }, 200);
};

export const deleteWinnerHandler: RouteHandler<typeof deleteWinnerRoute, AppEnv> = async (c) => {
  const { id } = c.req.valid("param");
  const { reason } = c.req.valid("json");

  const trimmedReason = reason.trim();

  if (!trimmedReason) {
    return c.json({ message: "Reason is required." }, 400);
  }

  const [existing] = await db
    .select()
    .from(winners)
    .where(and(eq(winners.id, id), isNull(winners.deletedAt)));

  if (!existing) {
    return c.json({ message: "Winner not found" }, 400);
  }

  await db
    .update(winners)
    .set({ deletedAt: new Date(), reason: trimmedReason })
    .where(eq(winners.id, id));

  await db.update(persons).set({ isEligible: true }).where(eq(persons.id, existing.personId));

  return c.json({ success: true }, 200);
};

export const redrawWinnerHandler: RouteHandler<typeof redrawWinnerRoute, AppEnv> = async (c) => {
  const { winnerId, reason } = c.req.valid("json");
  const trimmedReason = reason.trim();

  if (!trimmedReason) {
    return c.json({ message: "Reason is required." }, 400);
  }

  const [existing] = await db
    .select()
    .from(winners)
    .where(and(eq(winners.id, winnerId), isNull(winners.deletedAt)));

  if (!existing) {
    return c.json({ message: "Winner not found" }, 400);
  }

  const replacementWinner = await db
    .update(winners)
    .set({ reason: trimmedReason, deletedAt: new Date() })
    .where(eq(winners.id, winnerId))
    .returning();

  await db.update(persons).set({ isEligible: true }).where(eq(persons.id, existing.personId));

  return c.json({ success: true, winnerId: replacementWinner[0]?.id ?? winnerId }, 200);
};
