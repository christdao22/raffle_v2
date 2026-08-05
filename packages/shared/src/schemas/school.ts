// school.schema.ts
import { z } from "zod";

export const schoolSchema = z.object({
  id: z.string(),
  name: z.string(),
  principalName: z.string().nullable(),
  schoolGivenId: z.number().int().nullable(), // integer can be null with default
  level: z.number().int().nullable(),
  createdAt: z.string(), // or z.date() depending on how you serialize
  updatedAt: z.string(),
});

// Create schema - omit auto-generated fields
export const createSchoolSchema = z.object({
  name: z.string().trim().min(1, "School Name is required"),
  principalName: z.string().nullable().optional(),
  schoolGivenId: z.number().int().default(0),
  level: z.number().int().default(0),
});

export type School = z.infer<typeof schoolSchema>;
export type CreateSchoolInput = z.infer<typeof createSchoolSchema>;
