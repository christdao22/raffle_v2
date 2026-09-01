import { z } from "zod";
import { personSchema } from "./person";
import { prizeSchema } from "./prize";

export const winnerSchema = z.object({
  id: z.string().uuid(),
  person: personSchema,
  prize: prizeSchema,
  isReceived: z.boolean(),
  receivedAt: z.date().or(z.string().datetime()).nullable(),
  reason: z.string().trim().max(1000).nullable().optional(),
  createdAt: z.date().or(z.string().datetime()),
});

export type Winner = z.infer<typeof winnerSchema>;
