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
      { region: "Region IX", regionName: "Zamboanga Peninsula" },
      { region: "Region X", regionName: "Northern Mindanao" },
      { region: "Region XI", regionName: "Davao Region" },
      { region: "Region XII", regionName: "SOCCSKSARGEN" },
      { region: "Region XIII", regionName: "Caraga" },
      {
        region: "BARMM",
        regionName: "Bangsamoro Autonomous Region in Muslim Mindanao",
      },
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
        prize: 'Grand Prize: MacBook Pro M3 16"',
        imageUrl: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8",
        sponsor: "Tech Corp",
        sponsorImage: "https://via.placeholder.com/150",
        numberOfWinners: 1,
      },
      {
        prize: "iPhone 15 Pro Max",
        imageUrl: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab",
        sponsor: "Mobile Solutions Inc.",
        sponsorImage: "https://via.placeholder.com/150",
        numberOfWinners: 2,
      },
      {
        prize: "Sony WH-1000XM5 Headphones",
        imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e",
        sponsor: "Audio Direct",
        sponsorImage: "https://via.placeholder.com/150",
        numberOfWinners: 3,
      },
      {
        prize: "Nintendo Switch OLED",
        imageUrl: "https://images.unsplash.com/photo-1578303512597-81e6cc155b3e",
        sponsor: "GameStop Philippines",
        sponsorImage: "https://via.placeholder.com/150",
        numberOfWinners: 5,
      },
      {
        prize: "$100 Shopping Gift Card",
        imageUrl: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48",
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

  if (activeRegions.length >= 5) {
    await db
      .insert(persons)
      .values([
        {
          employeeId: "EMP001",
          image: "",
          fullname: "Juan Dela Cruz",
          regionId: activeRegions[0].id,
        },
        {
          employeeId: "EMP001",
          image: "",
          fullname: "Maria Clara Santos",
          regionId: activeRegions[0].id,
        },
        {
          employeeId: "EMP001",
          image: "",
          fullname: "Jose Rizal Reyes",
          regionId: activeRegions[1].id,
        },
        {
          employeeId: "EMP001",
          image: "",
          fullname: "Ana Marie Dizon",
          regionId: activeRegions[1].id,
        },
        {
          employeeId: "EMP001",
          image: "",
          fullname: "Carlos P. Garcia",
          regionId: activeRegions[2].id,
        },
        {
          employeeId: "EMP001",
          image: "",
          fullname: "Lea Salonga",
          regionId: activeRegions[2].id,
        },
        {
          employeeId: "EMP001",
          image: "",
          fullname: "Manny Pacquiao",
          regionId: activeRegions[3].id,
        },
        {
          employeeId: "EMP001",
          image: "",
          fullname: "Catriona Gray",
          regionId: activeRegions[3].id,
        },
        {
          employeeId: "EMP001",
          image: "",
          fullname: "Pia Wurtzbach",
          regionId: activeRegions[4].id,
        },
        {
          employeeId: "EMP001",
          image: "",
          fullname: "Arnel Pineda",
          regionId: activeRegions[4].id,
        },
      ])
      .onConflictDoNothing();
  }

  console.log("🎉 Complete seeding finished successfully!");
  process.exit(0);
}

main().catch((err) => {});
