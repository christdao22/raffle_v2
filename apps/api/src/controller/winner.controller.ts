import type { RouteHandler } from "@hono/zod-openapi";
import { asc, db, eq, ilike, persons, prizes, regions, sql, winners } from "@raffle_v2/db";
import type { AppEnv } from "../lib/context";
import { paginate } from "../lib/pagination";
import type { claimWinnerRoute, listWinnersRoute } from "../routes/winners.route";

export const listWinnersHandler: RouteHandler<typeof listWinnersRoute, AppEnv> = async (c) => {
  const { page, pageSize, search } = c.req.valid("query");

  const searchCondition = search ? ilike(persons.fullname, `%${search}%`) : undefined;

  const result = await paginate({
    page,
    pageSize,
    count: async () => {
      const rows = await db
        .select({ count: sql<number>`count(*)` })
        .from(winners)
        .innerJoin(persons, eq(winners.personId, persons.id))
        .where(searchCondition);

      return rows[0]?.count ?? 0;
    },
    query: async ({ limit, offset }) => {
      const rows = await db
        .select({
          id: winners.id,
          isReceived: winners.isReceived,
          receivedAt: winners.receivedAt,
          createdAt: winners.createdAt,
          person: {
            id: persons.id,
            fullname: persons.fullname,
            employeeId: persons.employeeId,
            image: persons.image,
            isEligible: persons.isEligible,
          },
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
        .where(searchCondition)
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
    .from(winners);


  const [totalPrizesResult] = await db
    .select({ totalPrizes: sql<number>`count(*)` })
    .from(prizes);

  return c.json({
    ...result,
    meta: {
      ...result.meta,
      stats:{
        receivedCount: receivedCounts?.receivedCount ?? 0,
        pendingCount: receivedCounts?.pendingCount ?? 0,
        totalPrizes: totalPrizesResult?.totalPrizes ?? 0,
      }
    },
  }, 200);
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