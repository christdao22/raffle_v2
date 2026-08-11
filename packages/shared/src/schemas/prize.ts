import { z } from "zod";

export const prizeSchema = z.object({
  id: z.string().uuid(),
  prize: z.string().min(1, "Prize name is required"),
  imageUrl: z.string().url("Invalid image URL").nullable().optional(),
  sponsor: z.string().min(1, "Sponsor name is required").nullable().optional(),
  sponsorImage: z.string().url("Invalid sponsor image URL").nullable().optional(),
  numberOfWinners: z.number().int().min(1, "Quantity must be at least 1"),
});

export type Prize = z.infer<typeof prizeSchema>;
