import { z } from "zod";
import { regionSchema } from "./region";

export const personSchema = z.object({
  id: z.string().uuid("Invalid UUID format"),
  employeeId: z.string().min(1, "Employee ID is required"),
  fullname: z.string().min(2, "Name must be at least 2 characters"),
  region: regionSchema,
  isEligible: z.boolean().default(true),
  image: z.string().optional(),
  schoolsDivision: z.string().min(1, "Schools Division is required"),
  station: z.string().min(1, "Station is required"),
  designation: z.string().min(1, "Designation is required"),
  email: z.string().min(1, "Email is required").email("Invalid email address"),
});

export type Person = z.infer<typeof personSchema>;
