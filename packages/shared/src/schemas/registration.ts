import { z } from "zod";

export const registrationSchema = z.object({
  id: z.uuid(),
  role: z.string().nullable(),
  sequence_number: z.int(),
});

export const createRegistrationSchema = z.object({
  participant_id: z.uuid(),
  event_id: z.uuid(),
  coach_id: z.string(),
  role: z.string().nullable(),
});

export type Registration = z.infer<typeof registrationSchema>;
export type CreateRegistrationInput = z.infer<typeof createRegistrationSchema>;
