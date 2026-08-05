import { z } from "zod";

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Expected an ISO date (YYYY-MM-DD)");

/**
 * Shape returned by the API. Kept separate from the Drizzle table types on
 * purpose — this is the public contract, the DB schema is an implementation
 * detail that's free to change shape (e.g. add columns) without touching it.
 */
export const participantSchema = z.object({
  id: z.uuid(),
  lastName: z.string(),
  firstName: z.string(),
  middleName: z.string().nullable(),
  suffix: z.string().nullable(),
  birthdate: isoDate,
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const createParticipantSchema = z.object({
  lastName: z.string().trim().min(1, "Last name is required"),
  firstName: z.string().trim().min(1, "First name is required"),
  middleName: z
    .string()
    .trim()
    .min(1)
    .nullable()
    .optional()
    .transform((v) => v ?? null),
  suffix: z
    .string()
    .trim()
    .min(1)
    .nullable()
    .optional()
    .transform((v) => v ?? null),
  birthdate: isoDate,
});

export const updateParticipantSchema = createParticipantSchema.partial();

export const participantIdParamSchema = z.object({
  id: z.string().uuid(),
});

export type Participant = z.infer<typeof participantSchema>;
export type CreateParticipantInput = z.infer<typeof createParticipantSchema>;
export type UpdateParticipantInput = z.infer<typeof updateParticipantSchema>;
