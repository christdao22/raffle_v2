import { z } from "zod";

export const prizeSchema = z.object({
  id: z.string().uuid(),
  prize: z.string().min(1, "Prize name is required"),
  imageUrl: z.string().url("Invalid image URL").optional(),
  sponsor: z.string().min(1, "Sponsor name is required"),
  sponsorImage: z.string().url("Invalid sponsor image URL").optional(),
  numberOfWinners: z.number().int().min(1, "Quantity must be at least 1"),
  createdAt: z.date().or(z.string().datetime()),
});

export type Prize = z.infer<typeof prizeSchema>;
