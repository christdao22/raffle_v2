import type { RouteHandler } from "@hono/zod-openapi";
import { db, eq, isNull, persons, prizes, regions, sql, winners } from "@raffle_v2/db";
import type { AppEnv } from "../lib/context";
import type { getRaffleReportRoute } from "../routes/report.route";

export const getRaffleReportHandler: RouteHandler<typeof getRaffleReportRoute, AppEnv> = async (
  c,
) => {
  const { raffleId } = c.req.valid("param");

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
    })
    .from(prizes)
    .leftJoin(winners, eq(winners.prizeId, prizes.id))
    .where(isNull(prizes.deletedAt))
    .groupBy(prizes.id, prizes.prize, prizes.sponsor, prizes.type, prizes.numberOfWinners);

  const [participantStats] = await db
    .select({
      totalParticipants: sql<number>`count(*)`,
      eligibleParticipants: sql<number>`count(*) filter (where ${persons.isEligible} = true)`,
    })
    .from(persons);

  const totalWinnerCount = await db.select({ count: sql<number>`count(*)` }).from(winners);

  const validWinnerCount = await db
    .select({ count: sql<number>`count(*)` })
    .from(winners)
    .where(isNull(winners.deletedAt));

  const invalidatedWinnerCount = await db
    .select({ count: sql<number>`count(*)` })
    .from(winners)
    .where(sql`${winners.deletedAt} is not null`);

  const totalParticipants = Number(participantStats?.totalParticipants ?? 0);
  const eligibleParticipants = Number(participantStats?.eligibleParticipants ?? 0);
  const totalWinners = Number(totalWinnerCount[0]?.count ?? 0);
  const validWinnersCount = Number(validWinnerCount[0]?.count ?? 0);
  const invalidatedWinnersCount = Number(invalidatedWinnerCount[0]?.count ?? 0);

  const totalPrizeUnits = prizeRows.reduce((sum, item) => sum + Number(item.allocated), 0);
  const awardedPrizeUnits = prizeRows.reduce((sum, item) => sum + Number(item.awarded), 0);
  const unclaimedPrizeUnits = totalPrizeUnits - awardedPrizeUnits;

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
      status: sql<string>`'Valid'`,
    })
    .from(winners)
    .innerJoin(persons, eq(winners.personId, persons.id))
    .innerJoin(regions, eq(persons.regionId, regions.id))
    .innerJoin(prizes, eq(winners.prizeId, prizes.id))
    .where(isNull(winners.deletedAt))
    .orderBy(winners.createdAt);

  const invalidatedWinnerRows = await db
    .select({
      drawNumber: sql<number>`1`,
      winnerName: persons.fullname,
      school: persons.schoolsDivision,
      prize: prizes.prize,
      sponsor: prizes.sponsor,
      status: sql<string>`'Invalidated'`,
      reason: sql<string>`'Deleted from winners list'`,
    })
    .from(winners)
    .innerJoin(persons, eq(winners.personId, persons.id))
    .innerJoin(prizes, eq(winners.prizeId, prizes.id))
    .where(sql`${winners.deletedAt} is not null`)
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
      prize: prize.prize,
      sponsor: prize.sponsor ?? null,
      type: prize.type ?? null,
      allocated: Number(prize.allocated),
      awarded: Number(prize.awarded),
      unclaimed: Math.max(Number(prize.allocated) - Number(prize.awarded), 0),
    })),
    winners: winnerRows.map((winner, index) => ({
      drawNumber: index + 1,
      winnerName: winner.winnerName,
      position: winner.position,
      school: winner.school,
      division: winner.division,
      region: winner.region,
      prize: winner.prize,
      sponsor: winner.sponsor,
      status: winner.status,
    })),
    invalidatedWinners: invalidatedWinnerRows.map((winner, index) => ({
      drawNumber: index + 1,
      winnerName: winner.winnerName,
      school: winner.school,
      prize: winner.prize,
      sponsor: winner.sponsor,
      status: winner.status,
      reason: winner.reason,
    })),
    unclaimedPrizes: prizeRows
      .filter((prize) => Number(prize.allocated) - Number(prize.awarded) > 0)
      .map((prize) => ({
        prize: prize.prize,
        sponsor: prize.sponsor ?? null,
        allocated: Number(prize.allocated),
        awarded: Number(prize.awarded),
        unclaimed: Math.max(Number(prize.allocated) - Number(prize.awarded), 0),
      })),
  };

  return c.json(payload, 200);
};
