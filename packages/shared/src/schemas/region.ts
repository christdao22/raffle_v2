import { z } from "zod";

export const RegionEnum = z.enum([
  "Region IX",
  "Region X",
  "Region XI",
  "Region XII",
  "Region XIII",
  "BARMM",
]);

export const regionPoolSchema = z.object({
  region: RegionEnum,
  includeGlobalPool: z.boolean().default(false),
  eligibleEntriesCount: z.number().int().min(0),
});

export type Region = z.infer<typeof RegionEnum>;
export type RegionPool = z.infer<typeof regionPoolSchema>;
