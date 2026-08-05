import { z } from "zod";

/**
 * Single source of truth for role names. Add new roles here — the DB column
 * is a plain text field (see packages/db/src/schema/auth.ts) specifically so
 * that adding a role never requires a migration, only an update here.
 */
export const ROLES = ["admin", "attendant", "guest"] as const;

export const roleSchema = z.enum(ROLES);

export type Role = z.infer<typeof roleSchema>;

export const DEFAULT_ROLE: Role = "attendant";
