import { z } from "zod";

export const raffleSummarySchema = z.object({
  totalParticipants: z.number().int().min(0),
  eligibleParticipants: z.number().int().min(0),
  totalWinners: z.number().int().min(0),
  validWinners: z.number().int().min(0),
  invalidatedWinners: z.number().int().min(0),
  totalPrizeUnits: z.number().int().min(0),
  awardedPrizeUnits: z.number().int().min(0),
  unclaimedPrizeUnits: z.number().int().min(0),
});

export const raffleReportPrizeSchema = z.object({
  id: z.string().uuid().or(z.string()),
  prize: z.string(),
  sponsor: z.string().nullable().optional(),
  type: z.string().nullable().optional(),
  allocated: z.number().int().min(0),
  awarded: z.number().int().min(0),
  unclaimed: z.number().int().min(0),
});

export const raffleReportWinnerSchema = z.object({
  drawNumber: z.number().int().min(1),
  winnerName: z.string(),
  position: z.string().optional().nullable(),
  school: z.string().optional().nullable(),
  division: z.string().optional().nullable(),
  region: z.string().optional().nullable(),
  prize: z.string(),
  sponsor: z.string().nullable().optional(),
  status: z.string(),
});

export const raffleReportInvalidatedWinnerSchema = z.object({
  drawNumber: z.number().int().min(1),
  winnerName: z.string(),
  school: z.string().optional().nullable(),
  prize: z.string(),
  sponsor: z.string().nullable().optional(),
  status: z.string(),
  reason: z.string().nullable().optional(),
});

export const raffleReportUnclaimedPrizeSchema = z.object({
  prize: z.string(),
  sponsor: z.string().nullable().optional(),
  allocated: z.number().int().min(0),
  awarded: z.number().int().min(0),
  unclaimed: z.number().int().min(0),
});

export const raffleReportSchema = z.object({
  raffle: z.object({
    id: z.string(),
    name: z.string(),
    date: z.string(),
    status: z.string(),
    generatedAt: z.string(),
  }),
  summary: raffleSummarySchema,
  prizes: z.array(raffleReportPrizeSchema),
  winners: z.array(raffleReportWinnerSchema),
  invalidatedWinners: z.array(raffleReportInvalidatedWinnerSchema),
  unclaimedPrizes: z.array(raffleReportUnclaimedPrizeSchema),
});

export type RaffleSummary = z.infer<typeof raffleSummarySchema>;
export type RaffleReportPrize = z.infer<typeof raffleReportPrizeSchema>;
export type RaffleReportWinner = z.infer<typeof raffleReportWinnerSchema>;
export type RaffleReportInvalidatedWinner = z.infer<typeof raffleReportInvalidatedWinnerSchema>;
export type RaffleReportUnclaimedPrize = z.infer<typeof raffleReportUnclaimedPrizeSchema>;
export type RaffleReport = z.infer<typeof raffleReportSchema>;
