import { z } from "zod";
import { personSchema } from "./person";
import { prizeSchema } from "./prize";
import { regionSchema } from "./region";

export const winnerSchema = z.object({
  id: z.string().uuid(),
  drawId: z.string().uuid(),
  person: personSchema,
  prize: prizeSchema,
  drawnAt: z.date().or(z.string().datetime()),
  ticketNumber: z.string().min(1, "Ticket number is required"),
  region: regionSchema,
});

export type Winner = z.infer<typeof winnerSchema>;
