import { z } from "zod";
import { regionSchema } from "./region";

export const personSchema = z.object({
  id: z.string().uuid(),
  employeeId: z.string().min(1, "Employee ID is required"),
  fullname: z.string().min(2, "Name must be at least 2 characters"),
  region: regionSchema,
  isEligible: z.boolean().default(true),
  image: z.string().optional(),
});

export type Person = z.infer<typeof personSchema>;
