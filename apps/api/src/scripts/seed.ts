import { readdirSync, readFileSync } from "node:fs";
import { join, parse } from "node:path";
import { db, eq } from "@raffle_v2/db";
import { persons, prizes, regions, user } from "@raffle_v2/db/schema";
import { auth } from "../lib/auth";

type EmployeeRecord = {
  fullname: string;
  schoolsDivision: string;
  station: string;
  designation: string;
  email: string | null;
  region?: string;
};

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
  const regionValues = [
    { region: "Region IX", regionName: "Zamboanga Peninsula" },
    { region: "Region X", regionName: "Northern Mindanao" },
    { region: "Region XI", regionName: "Davao Region" },
    { region: "Region XII", regionName: "SOCCSKSARGEN" },
    { region: "Region XIII", regionName: "Caraga" },
    {
      region: "BARMM",
      regionName: "Bangsamoro Autonomous Region in Muslim Mindanao",
    },
  ];
  const existingRegions = await db.query.regions.findMany();
  const existingRegionNames = new Set(existingRegions.map((region) => region.region));
  const regionsToInsert = regionValues.filter((region) => !existingRegionNames.has(region.region));

  if (regionsToInsert.length > 0) {
    await db.insert(regions).values(regionsToInsert);
  }

  const activeRegions = await db.query.regions.findMany();

  // ==========================================
  // 4. PRIZES SEEDING (5 Prizes)
  // ==========================================
  console.log("Seeding prizes...");
  const prizeValues = [
    {
      prize: "ROPA MITSUBISHI MIRAGE",
      imageUrl: null,
      sponsor: "CHINA BANK SAVINGS",
      sponsorImage: null,
      numberOfWinners: 1,
      type: "Major",
      raffleMode: "Live",
      deletedAt: null,
    },
    {
      prize: "HONDA BEAT MOTORCYCLE",
      imageUrl: null,
      sponsor: "CHINA BANK SAVINGS",
      sponsorImage: null,
      numberOfWinners: 3,
      type: "Major",
      raffleMode: "Pre-draw",
      deletedAt: null,
    },
    {
      prize: "LAPTOP",
      imageUrl: null,
      sponsor: "CHINA BANK SAVINGS",
      sponsorImage: null,
      numberOfWinners: 10,
      type: "Major",
      raffleMode: "Live",
      deletedAt: null,
    },
    {
      prize: "LAPTOP",
      imageUrl: null,
      sponsor: "CITY SAVINGS BANK",
      sponsorImage: null,
      numberOfWinners: 5,
      type: "Major",
      raffleMode: "Live",
      deletedAt: null,
    },
    {
      prize: "SMART PHONE",
      imageUrl: null,
      sponsor: "CITY SAVINGS BANK",
      sponsorImage: null,
      numberOfWinners: 3,
      type: "Minor",
      raffleMode: "Pre-draw",
      deletedAt: null,
    },
    {
      prize: "PRINTER",
      imageUrl: null,
      sponsor: "CITY SAVINGS BANK",
      sponsorImage: null,
      numberOfWinners: 3,
      type: "Minor",
      raffleMode: "Pre-draw",
      deletedAt: null,
    },
    {
      prize: "TABLET",
      imageUrl: null,
      sponsor: "CITY SAVINGS BANK",
      sponsorImage: null,
      numberOfWinners: 2,
      type: "Minor",
      raffleMode: "Pre-draw",
      deletedAt: null,
    },
    {
      prize: "KONZERT BLUETOOTH SPEAKER",
      imageUrl: null,
      sponsor: "STI COLLEGE",
      sponsorImage: null,
      numberOfWinners: 1,
      type: "Minor",
      raffleMode: "Pre-draw",
      deletedAt: null,
    },
    {
      prize: "JBL BLUETOOTH SPEAKER",
      imageUrl: null,
      sponsor: "STI COLLEGE",
      sponsorImage: null,
      numberOfWinners: 1,
      type: "Minor",
      raffleMode: "Pre-draw",
      deletedAt: null,
    },
    {
      prize: "10K GIFT CERTIFICATE",
      imageUrl: null,
      sponsor: "BDO NETWORK BANK",
      sponsorImage: null,
      numberOfWinners: 1,
      type: "Major",
      raffleMode: "Live",
      deletedAt: null,
    },
    {
      prize: "5K GIFT CERTIFICATE",
      imageUrl: null,
      sponsor: "BDO NETWORK BANK",
      sponsorImage: null,
      numberOfWinners: 2,
      type: "Minor",
      raffleMode: "Pre-draw",
      deletedAt: null,
    },
    {
      prize: "LAPTOP",
      imageUrl: null,
      sponsor: "BDO NETWORK BANK",
      sponsorImage: null,
      numberOfWinners: 3,
      type: "Major",
      raffleMode: "Live",
      deletedAt: null,
    },
    {
      prize: "CELLPHONE",
      imageUrl: null,
      sponsor: "BDO NETWORK BANK",
      sponsorImage: null,
      numberOfWinners: 3,
      type: "Minor",
      raffleMode: "Pre-draw",
      deletedAt: null,
    },
    {
      prize: "MICROWAVE OVEN",
      imageUrl: null,
      sponsor: "BDO NETWORK BANK",
      sponsorImage: null,
      numberOfWinners: 5,
      type: "Minor",
      raffleMode: "Pre-draw",
      deletedAt: null,
    },
    {
      prize: "PRINTER",
      imageUrl: null,
      sponsor: "BDO NETWORK BANK",
      sponsorImage: null,
      numberOfWinners: 6,
      type: "Minor",
      raffleMode: "Pre-draw",
      deletedAt: null,
    },
    {
      prize: "GOLF UMBRELLA",
      imageUrl: null,
      sponsor: "BDO NETWORK BANK",
      sponsorImage: null,
      numberOfWinners: 20,
      type: "Minor",
      raffleMode: "Pre-draw",
      deletedAt: null,
    },
    {
      prize: "BLUETOOTH SPEAKER",
      imageUrl: null,
      sponsor: "CITY SAVINGS BANK",
      sponsorImage: null,
      numberOfWinners: 1,
      type: "Minor",
      raffleMode: "Pre-draw",
      deletedAt: null,
    },
    {
      prize: "Php 500.00 WORTH OF GC",
      imageUrl: null,
      sponsor: "JOLLIBEE GROUP FOUNDATION",
      sponsorImage: null,
      numberOfWinners: 10,
      type: "Minor",
      raffleMode: "Pre-draw",
      deletedAt: null,
    },
    {
      prize: "Php 500.00 WORTH OF GC",
      imageUrl: null,
      sponsor: "RONALD MCDONALD HOUSE OF CHARITIES PHILIPPINES",
      sponsorImage: null,
      numberOfWinners: 50,
      type: "Minor",
      raffleMode: "Pre-draw",
      deletedAt: null,
    },
    {
      prize: "1 CASE OF ALASKA 300g POWDERED MILK",
      imageUrl: null,
      sponsor: "ALASKA MILK CORPORATION",
      sponsorImage: null,
      numberOfWinners: 4,
      type: "Minor",
      raffleMode: "Pre-draw",
      deletedAt: null,
    },
    {
      prize: "1 CASE OF FRUITTI YO ORANGE",
      imageUrl: null,
      sponsor: "ALASKA MILK CORPORATION",
      sponsorImage: null,
      numberOfWinners: 2,
      type: "Minor",
      raffleMode: "Pre-draw",
      deletedAt: null,
    },
    {
      prize: "1 CASE OF FRUITTI YO APPLE",
      imageUrl: null,
      sponsor: "ALASKA MILK CORPORATION",
      sponsorImage: null,
      numberOfWinners: 2,
      type: "Minor",
      raffleMode: "Pre-draw",
      deletedAt: null,
    },
    {
      prize: "1 CASE OF FRUITTI YO STRAWBERRY",
      imageUrl: null,
      sponsor: "ALASKA MILK CORPORATION",
      sponsorImage: null,
      numberOfWinners: 2,
      type: "Minor",
      raffleMode: "Pre-draw",
      deletedAt: null,
    },
    {
      prize: "GALA SA ROBINSONS PACKAGE",
      imageUrl: null,
      sponsor: "GOKONGWEI BROTHERS FOUNDATION, INC.",
      sponsorImage: null,
      numberOfWinners: 6,
      type: "Minor",
      raffleMode: "Pre-draw",
      deletedAt: null,
    },
    {
      prize: "TEACHER WELLNESS PACKAGE",
      imageUrl: null,
      sponsor: "GOKONGWEI BROTHERS FOUNDATION, INC.",
      sponsorImage: null,
      numberOfWinners: 6,
      type: "Minor",
      raffleMode: "Pre-draw",
      deletedAt: null,
    },
    {
      prize: "TEACHER'S GROCERY PACKAGE",
      imageUrl: null,
      sponsor: "GOKONGWEI BROTHERS FOUNDATION, INC.",
      sponsorImage: null,
      numberOfWinners: 2,
      type: "Minor",
      raffleMode: "Pre-draw",
      deletedAt: null,
    },
    {
      prize: "TEACHER'S COMFORT KIT PACKAGE",
      imageUrl: null,
      sponsor: "GOKONGWEI BROTHERS FOUNDATION, INC.",
      sponsorImage: null,
      numberOfWinners: 3,
      type: "Minor",
      raffleMode: "Pre-draw",
      deletedAt: null,
    },
    {
      prize: "TREAT YOUR TEACHER BESTIE PACKAGE",
      imageUrl: null,
      sponsor: "GOKONGWEI BROTHERS FOUNDATION, INC.",
      sponsorImage: null,
      numberOfWinners: 1,
      type: "Minor",
      raffleMode: "Pre-draw",
      deletedAt: null,
    },
    {
      prize: "E-Cash Gift for Teachers -PhP 5,000",
      imageUrl: null,
      sponsor: "GOKONGWEI BROTHERS FOUNDATION, INC.",
      sponsorImage: null,
      numberOfWinners: 2,
      type: "Major",
      raffleMode: "Live",
      deletedAt: null,
    },
    {
      prize: "ULTIMATE TEACHER TRAVEL PACKAGE",
      imageUrl: null,
      sponsor: "GOKONGWEI BROTHERS FOUNDATION, INC.",
      sponsorImage: null,
      numberOfWinners: 1,
      type: "Major",
      raffleMode: "Live",
      deletedAt: null,
    },
    {
      prize: "PLDT HOME PREPAID WIFI",
      imageUrl: null,
      sponsor: "SMART COMMUNICATIONS",
      sponsorImage: null,
      numberOfWinners: 10,
      type: "Minor",
      raffleMode: "Pre-draw",
      deletedAt: null,
    },
    {
      prize: "LAPEL MICROPHONE",
      imageUrl: null,
      sponsor: "BDO NETWORK BANK",
      sponsorImage: null,
      numberOfWinners: 10,
      type: "Minor",
      raffleMode: "Pre-draw",
      deletedAt: null,
    },
    {
      prize: "3K GIFT CERTIFICATE",
      imageUrl: null,
      sponsor: "BDO NETWORK BANK",
      sponsorImage: null,
      numberOfWinners: 3,
      type: "Minor",
      raffleMode: "Pre-draw",
      deletedAt: null,
    },
    {
      prize: "RAFFLE PRIZE (TELEVISION)",
      imageUrl: null,
      sponsor: "JA PHILIPPINES",
      sponsorImage: null,
      numberOfWinners: 1,
      type: "Minor",
      raffleMode: "Pre-draw",
      deletedAt: null,
    },
    {
      prize: "UNILEVER",
      imageUrl: null,
      sponsor: "GIFT PACK",
      sponsorImage: null,
      numberOfWinners: 20,
      type: "Minor",
      raffleMode: "Pre-draw",
      deletedAt: null,
    },
  ];
  const existingPrizes = await db.query.prizes.findMany();
  const existingPrizeNames = new Set(existingPrizes.map((prize) => prize.prize));
  const prizesToInsert = prizeValues.filter((prize) => !existingPrizeNames.has(prize.prize));

  if (prizesToInsert.length > 0) {
    await db.insert(prizes).values(prizesToInsert);
  }

  // ==========================================
  // 5. PERSONS / PARTICIPANTS SEEDING
  // ==========================================
  console.log("Seeding persons...");

  const regionByName = new Map(
    activeRegions.map((activeRegion) => [activeRegion.region, activeRegion]),
  );
  const employeeDirectory = join(process.cwd(), "src/scripts/employee");
  const employeeCountByRegion = new Map<string, number>();
  const employeeValues = readdirSync(employeeDirectory)
    .filter((fileName) => fileName.endsWith(".json"))
    .flatMap((fileName) => {
      const employees = JSON.parse(
        readFileSync(join(employeeDirectory, fileName), "utf8"),
      ) as EmployeeRecord[];

      return employees.map((employee) => {
        const regionName = employee.region?.trim() || parse(fileName).name;
        const region = regionByName.get(regionName);

        if (!region) {
          throw new Error(`No database region matches employee region: ${regionName}`);
        }

        const employeeCount = (employeeCountByRegion.get(regionName) ?? 0) + 1;
        employeeCountByRegion.set(regionName, employeeCount);

        const employeeId = `${regionName.replace(/\s+/g, "-").toUpperCase()}-${String(employeeCount).padStart(3, "0")}`;
        const email = employee.email?.trim() || `${employeeId.toLowerCase()}@deped.gov.ph`;

        return {
          employeeId,
          image: "",
          fullname: employee.fullname.trim(),
          regionId: region.id,
          schoolsDivision: employee.schoolsDivision.trim(),
          station: employee.station.trim(),
          designation: employee.designation.trim(),
          email,
        };
      });
    });

  const existingPersons = await db.query.persons.findMany({
    columns: { employeeId: true },
  });
  const existingEmployeeIds = new Set(existingPersons.map((person) => person.employeeId));
  const personsToInsert = employeeValues.filter(
    (person) => !existingEmployeeIds.has(person.employeeId),
  );

  if (personsToInsert.length > 0) {
    await db.insert(persons).values(personsToInsert);
  }

  console.log(`Prepared ${personsToInsert.length} new participants from employee files.`);

  console.log("🎉 Complete seeding finished successfully!");
  process.exit(0);
}

main().catch((e) => {
  console.log(e);
});
