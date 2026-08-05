import { db, eq } from "@raffle_v2/db";
import { persons, prizes, regions, user } from "@raffle_v2/db/schema";
import { auth } from "../lib/auth";

/**
 * Goes through Better Auth's real sign-up flow for the admin user,
 * then seeds regions, prizes, persons, and an attendant user.
 */
async function main() {
  console.log("🌱 Starting database seeding...");

  // ==========================================
  // 1. ADMIN USER SEEDING (via Better Auth)
  // ==========================================
  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? "christian.daohog@deped.gov.ph";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? "Depedcdo!123";

  const existingAdmin = await db.query.user.findFirst({ where: eq(user.email, adminEmail) });

  if (existingAdmin) {
    console.log(`ℹ️ Admin user already exists: ${adminEmail}`);
  } else {
    const result = await auth.api.signUpEmail({
      body: { email: adminEmail, password: adminPassword, name: "System Admin" },
    });

    await db
      .update(user)
      .set({ role: "admin", emailVerified: true })
      .where(eq(user.id, result.user.id));

    console.log(`✅ Seeded admin user: ${adminEmail} / ${adminPassword}`);
  }

  // ==========================================
  // 2. ATTENDANT USER SEEDING (via Better Auth)
  // ==========================================
  const attendantEmail = process.env.SEED_ATTENDANT_EMAIL ?? "attendant@deped.gov.ph";
  const attendantPassword = process.env.SEED_ATTENDANT_PASSWORD ?? "Attendant!123";

  const existingAttendant = await db.query.user.findFirst({
    where: eq(user.email, attendantEmail),
  });

  if (existingAttendant) {
    console.log(`ℹ️ Attendant user already exists: ${attendantEmail}`);
  } else {
    const attendantResult = await auth.api.signUpEmail({
      body: { email: attendantEmail, password: attendantPassword, name: "Prize Desk Attendant" },
    });

    await db
      .update(user)
      .set({ role: "attendant", emailVerified: true })
      .where(eq(user.id, attendantResult.user.id));

    console.log(`✅ Seeded attendant user: ${attendantEmail} / ${attendantPassword}`);
  }

  // ==========================================
  // 3. REGIONS SEEDING (5 Regions)
  // ==========================================
  console.log("Seeding regions...");
  const seededRegions = await db
    .insert(regions)
    .values([
      { id: "reg_01", regionName: "Region 1 - Luzon" },
      { id: "reg_02", regionName: "Region 2 - Visayas" },
      { id: "reg_03", regionName: "Region 3 - Mindanao" },
      { id: "reg_04", regionName: "Region 4 - Corporate HQ" },
      { id: "reg_05", regionName: "Region 5 - International" },
    ])
    .onConflictDoNothing()
    .returning();

  // Handle case where regions were already seeded
  const activeRegions =
    seededRegions.length > 0 ? seededRegions : await db.query.regions.findMany();

  // ==========================================
  // 4. PRIZES SEEDING (5 Prizes)
  // ==========================================
  console.log("Seeding prizes...");
  await db
    .insert(prizes)
    .values([
      {
        id: "prz_01",
        prize: 'Grand Prize: MacBook Pro M3 16"',
        prizeImage: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8",
        sponsor: "Tech Corp",
        sponsorImage: "https://via.placeholder.com/150",
        numberOfWinners: 1,
      },
      {
        id: "prz_02",
        prize: "iPhone 15 Pro Max",
        prizeImage: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab",
        sponsor: "Mobile Solutions Inc.",
        sponsorImage: "https://via.placeholder.com/150",
        numberOfWinners: 2,
      },
      {
        id: "prz_03",
        prize: "Sony WH-1000XM5 Headphones",
        prizeImage: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e",
        sponsor: "Audio Direct",
        sponsorImage: "https://via.placeholder.com/150",
        numberOfWinners: 3,
      },
      {
        id: "prz_04",
        prize: "Nintendo Switch OLED",
        prizeImage: "https://images.unsplash.com/photo-1578303512597-81e6cc155b3e",
        sponsor: "GameStop Philippines",
        sponsorImage: "https://via.placeholder.com/150",
        numberOfWinners: 5,
      },
      {
        id: "prz_05",
        prize: "$100 Shopping Gift Card",
        prizeImage: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48",
        sponsor: "HR Employee Perks",
        sponsorImage: "https://via.placeholder.com/150",
        numberOfWinners: 10,
      },
    ])
    .onConflictDoNothing();

  // ==========================================
  // 5. PERSONS / PARTICIPANTS SEEDING (10 Employees)
  // ==========================================
  console.log("Seeding persons...");

  await db
    .insert(persons)
    .values([
      { id: "per_01", fullname: "Juan Dela Cruz", regionId: activeRegions[0].id },
      { id: "per_02", fullname: "Maria Clara Santos", regionId: activeRegions[0].id },
      { id: "per_03", fullname: "Jose Rizal Reyes", regionId: activeRegions[1].id },
      { id: "per_04", fullname: "Ana Marie Dizon", regionId: activeRegions[1].id },
      { id: "per_05", fullname: "Carlos P. Garcia", regionId: activeRegions[2].id },
      { id: "per_06", fullname: "Lea Salonga", regionId: activeRegions[2].id },
      { id: "per_07", fullname: "Manny Pacquiao", regionId: activeRegions[3].id },
      { id: "per_08", fullname: "Catriona Gray", regionId: activeRegions[3].id },
      { id: "per_09", fullname: "Pia Wurtzbach", regionId: activeRegions[4].id },
      { id: "per_10", fullname: "Arnel Pineda", regionId: activeRegions[4].id },
    ])
    .onConflictDoNothing();

  console.log("🎉 Complete seeding finished successfully!");
  process.exit(0);
}

main().catch((err) => {});
