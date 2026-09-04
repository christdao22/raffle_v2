import type { RouteHandler } from "@hono/zod-openapi";
import {
  and,
  db,
  eq,
  gte,
  isNull,
  lt,
  persons,
  prizes,
  regions,
  sql,
  winners,
} from "@raffle_v2/db";
import type { AppEnv } from "../lib/context";
import type { getRaffleReportRoute } from "../routes/report.route";

export const getRaffleReportHandler: RouteHandler<typeof getRaffleReportRoute, AppEnv> = async (
  c,
) => {
  const { raffleId } = c.req.valid("param");
  const { startDate, endDate } = c.req.valid("query");

  if (startDate && endDate && startDate > endDate) {
    return c.json({ message: "Start date must be on or before end date" }, 400);
  }

  const startOfDay = startDate ? new Date(`${startDate}T00:00:00.000Z`) : undefined;
  const endOfDay = endDate ? new Date(`${endDate}T00:00:00.000Z`) : undefined;
  if (endOfDay) endOfDay.setUTCDate(endOfDay.getUTCDate() + 1);

  const createdAtInRange = and(
    ...(startOfDay ? [gte(winners.createdAt, startOfDay)] : []),
    ...(endOfDay ? [lt(winners.createdAt, endOfDay)] : []),
  );
  const deletedAtInRange = and(
    ...(startOfDay ? [gte(winners.deletedAt, startOfDay)] : []),
    ...(endOfDay ? [lt(winners.deletedAt, endOfDay)] : []),
  );

  const prizeRows = await db
    .select({
      id: prizes.id,
      prize: prizes.prize,
      sponsor: prizes.sponsor,
      type: prizes.type,
      allocated: prizes.numberOfWinners,
      awarded: sql<number>`coalesce(
        count(${winners.id}) filter (
          where ${winners.isReceived} = true and ${winners.deletedAt} is null
        ),
        0
      )`,
      unclaimed: sql<number>`coalesce(
        count(${winners.id}) filter (
          where ${winners.isReceived} = false and ${winners.deletedAt} is null
        ),
        0
      )`,
    })
    .from(prizes)
    .leftJoin(winners, and(eq(winners.prizeId, prizes.id), createdAtInRange))
    .where(isNull(prizes.deletedAt))
    .groupBy(prizes.id, prizes.prize, prizes.sponsor, prizes.type, prizes.numberOfWinners);

  const [participantStats] = await db
    .select({
      totalParticipants: sql<number>`count(*)`,
      eligibleParticipants: sql<number>`count(*) filter (where ${persons.isEligible} = true)`,
    })
    .from(persons);

  const totalWinnerCount = await db
    .select({ count: sql<number>`count(*)` })
    .from(winners)
    .where(createdAtInRange);

  const validWinnerCount = await db
    .select({ count: sql<number>`count(*)` })
    .from(winners)
    .where(and(isNull(winners.deletedAt), createdAtInRange));

  const invalidatedWinnerCount = await db
    .select({ count: sql<number>`count(*)` })
    .from(winners)
    .where(and(sql`${winners.deletedAt} is not null`, deletedAtInRange));

  const totalParticipants = Number(participantStats?.totalParticipants ?? 0);
  const eligibleParticipants = Number(participantStats?.eligibleParticipants ?? 0);
  const totalWinners = Number(totalWinnerCount[0]?.count ?? 0);
  const validWinnersCount = Number(validWinnerCount[0]?.count ?? 0);
  const invalidatedWinnersCount = Number(invalidatedWinnerCount[0]?.count ?? 0);

  const totalPrizeUnits = prizeRows.reduce((sum, item) => sum + Number(item.allocated), 0);
  const awardedPrizeUnits = prizeRows.reduce((sum, item) => sum + Number(item.awarded), 0);
  const unclaimedPrizeUnits = prizeRows.reduce((sum, item) => sum + Number(item.unclaimed), 0);

  const summary = {
    totalParticipants,
    eligibleParticipants,
    totalWinners,
    validWinners: validWinnersCount,
    invalidatedWinners: invalidatedWinnersCount,
    totalPrizeUnits,
    awardedPrizeUnits,
    unclaimedPrizeUnits,
  };

  const winnerRows = await db
    .select({
      winnerName: persons.fullname,
      position: persons.designation,
      school: persons.schoolsDivision,
      division: regions.regionName,
      region: regions.region,
      prize: prizes.prize,
      sponsor: prizes.sponsor,
      type: prizes.type,
      createdAt: winners.createdAt,
    })
    .from(winners)
    .innerJoin(persons, eq(winners.personId, persons.id))
    .innerJoin(regions, eq(persons.regionId, regions.id))
    .innerJoin(prizes, eq(winners.prizeId, prizes.id))
    .where(and(isNull(winners.deletedAt), createdAtInRange))
    .orderBy(winners.createdAt);

  const invalidatedWinnerRows = await db
    .select({
      drawNumber: sql<number>`1`,
      winnerName: persons.fullname,
      school: persons.schoolsDivision,
      prize: prizes.prize,
      sponsor: prizes.sponsor,
      type: prizes.type,
      deletedAt: winners.deletedAt,
      reason: winners.reason,
    })
    .from(winners)
    .innerJoin(persons, eq(winners.personId, persons.id))
    .innerJoin(prizes, eq(winners.prizeId, prizes.id))
    .where(and(sql`${winners.deletedAt} is not null`, deletedAtInRange))
    .orderBy(winners.deletedAt);

  const payload = {
    raffle: {
      id: raffleId,
      name: "National Teachers' Month Kick-off",
      date: "9/5/2026",
      status: "COMPLETED",
      generatedAt: new Date().toISOString(),
    },
    summary,
    prizes: prizeRows.map((prize) => ({
      id: String(prize.id),
      prize: prize.prize.toLowerCase(),
      sponsor: prize.sponsor?.toLowerCase() ?? null,
      type: prize.type ?? null,
      allocated: Number(prize.allocated),
      awarded: Number(prize.awarded),
      unclaimed: Number(prize.unclaimed),
    })),
    winners: winnerRows.map((winner, index) => ({
      drawNumber: index + 1,
      winnerName: winner.winnerName.toLowerCase(),
      position: winner.position.toLowerCase(),
      school: winner.school.toLowerCase(),
      division: winner.division.toLowerCase(),
      region: winner.region,
      prize: winner.prize.toLowerCase(),
      sponsor: winner.sponsor,
      type: winner.type,
      drawnAt: winner.createdAt?.toISOString() ?? new Date().toISOString(),
    })),
    invalidatedWinners: invalidatedWinnerRows.map((winner, index) => ({
      drawNumber: index + 1,
      winnerName: winner.winnerName.toLowerCase(),
      school: winner.school.toLowerCase(),
      prize: winner.prize.toLowerCase(),
      sponsor: winner.sponsor?.toLowerCase(),
      type: winner.type,
      drawnAt: winner.deletedAt?.toISOString() ?? new Date().toISOString(),
      reason: winner.reason,
    })),
    unclaimedPrizes: prizeRows
      .filter((prize) => Number(prize.unclaimed) > 0)
      .map((prize) => ({
        prize: prize.prize,
        sponsor: prize.sponsor ?? null,
        allocated: Number(prize.allocated),
        awarded: Number(prize.awarded),
        unclaimed: Number(prize.unclaimed),
      })),
  };

  return c.json(payload, 200);
};
