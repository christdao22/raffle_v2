import { db, eq } from "@raffle_v2/db";
import { user } from "@raffle_v2/db/schema";
import { auth } from "../lib/auth";

/**
 * Goes through Better Auth's real sign-up flow rather than inserting rows
 * by hand, so the password gets hashed the same way a normal sign-up would.
 * `role` and `emailVerified` are server-owned (role has `input: false`),
 * so they're patched directly after the account exists.
 */
async function main() {
  const email = process.env.SEED_ADMIN_EMAIL ?? "christian.daohog@deped.gov.ph";
  const password = process.env.SEED_ADMIN_PASSWORD ?? "Depedcdo!123";

  const existing = await db.query.user.findFirst({ where: eq(user.email, email) });

  if (existing) {
    console.log(`Admin user already exists: ${email}`);
    process.exit(0);
  }

  const result = await auth.api.signUpEmail({
    body: { email, password, name: "System Admin" },
  });

  await db
    .update(user)
    .set({ role: "admin", emailVerified: true })
    .where(eq(user.id, result.user.id));

  console.log(`Seeded admin user: ${email} / ${password}`);
  console.log("Change this password after first login.");
  process.exit(0);
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
