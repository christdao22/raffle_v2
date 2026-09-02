import { z } from "zod";

export const prizeSchema = z.object({
  id: z.string().uuid(),
  prize: z.string().min(1, "Prize name is required"),
  imageUrl: z.string().nullable().optional(),
  sponsor: z.string().min(1, "Sponsor name is required").nullable().optional(),
  sponsorImage: z.string().nullable().optional(),
  numberOfWinners: z.number().int().min(1, "Quantity must be at least 1"),
  numberOfItemsLeft: z.number().int().min(0).optional(),
  type: z.string().min(1, "Prize name is required").nullable().optional(),
  raffleMode: z.string().nullable().optional(),
  deletedAt: z.date().or(z.string().datetime()).nullable().optional(),
});

export type Prize = z.infer<typeof prizeSchema>;
