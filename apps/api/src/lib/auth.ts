import { db } from "@raffle_v2/db";
import * as schema from "@raffle_v2/db/schema";
import { DEFAULT_ROLE } from "@raffle_v2/shared";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { env } from "../env";

export const auth = betterAuth({
  baseURL: env.BETTER_AUTH_URL,
  secret: env.BETTER_AUTH_SECRET,
  trustedOrigins: [env.WEB_URL],
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  emailAndPassword: {
    enabled: true,
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: DEFAULT_ROLE,
        // `input: false` is the important bit: it stops role from being
        // settable through the public sign-up/update-user API, so a
        // request body can't just pass `role: "admin"` to self-elevate.
        // Roles are only ever changed server-side (see scripts/seed.ts
        // and the admin-only PATCH route you'd add for role changes).
        input: false,
      },
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },
});

export type AuthSession = typeof auth.$Infer.Session;
export type AuthUser = AuthSession["user"];
