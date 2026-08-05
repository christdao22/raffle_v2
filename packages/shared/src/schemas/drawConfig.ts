import { z } from "zod";
import { RegionEnum } from "./region";

export const drawConfigSchema = z.object({
  prizeId: z.string().uuid("Please select a prize tier"),
  targetRegion: RegionEnum,
  includeGlobalPool: z.boolean().default(false),
  spinDurationSeconds: z.number().int().min(1).max(60).default(15),
  winnerCount: z.number().int().min(1).max(50).default(1),
});

export type DrawConfig = z.infer<typeof drawConfigSchema>;
