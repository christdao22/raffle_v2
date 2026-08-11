import { z } from "zod";

export const regionSchema = z.object({
  id: z.string().uuid(),
  region: z.string().min(1, "Region name is required"),
  regionName: z.string().min(1, "Region name is required"),
});

export type Region = z.infer<typeof regionSchema>;
