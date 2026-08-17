import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { and, db, eq, inArray, notInArray, persons, regions, sql, winners } from "@raffle_v2/db";
import { paginatedResponseSchema, paginationQuerySchema, regionSchema, winnerSchema } from "@raffle_v2/shared";
import { claimWinnerHandler, listWinnersHandler } from "../controller/winner.controller";
import type { AppEnv } from "../lib/context";
import { requireAuth } from "../middleware/auth";

const app = new OpenAPIHono<AppEnv>();

// Updated Person output schema
export const winnerPersonSchema = z.object({
  id: z.string().uuid(),
  fullname: z.string(),
  employeeId: z.string(),
  image: z.string(),
  region: regionSchema,
  isEligible: z.boolean(),
});

export const listWinnersQuerySchema = paginationQuerySchema.extend({
  search: z.string().trim().min(1).optional(),
});

const errorResponseSchema = z.object({
  message: z.string(),
  errors: z.array(z.string()).optional(),
});

// GET /winners/draw route definition
export const getDrawRoute = createRoute({
  method: "get",
  path: "/draw",
  tags: ["Winners"],
  middleware: [requireAuth],
  summary: "Get random candidate winners without saving",
  request: {
    query: z.object({
      prizeId: z.string().optional(),
      numberOfWinners: z.coerce.number().optional(),
      regionId: z
        .preprocess(
          (val) => {
            if (typeof val === "string") return val ? val.split(",") : undefined;
            if (Array.isArray(val)) return val;
            return undefined;
          },
          z
            .array(z.string().uuid({ message: "Each regionId must be a valid UUID" }))
            .min(1, { message: "regionId array cannot be empty when provided" }),
        )
        .optional(),
    }),
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.array(winnerPersonSchema),
        },
      },
      description: "Array of randomly selected eligible candidate persons",
    },
    400: {
      content: {
        "application/json": {
          schema: errorResponseSchema,
        },
      },
      description: "Incomplete or invalid query parameters",
    },
  },
});

// POST /winners/draw route definition
export const saveDrawRoute = createRoute({
  method: "post",
  path: "/draw",
  tags: ["Winners"],
  summary: "Save confirmed draw winners",
  middleware: [requireAuth],
  request: {
    body: {
      content: {
        "application/json": {
          schema: z.object({
            prizeId: z.string().uuid(),
            personIds: z.array(z.string().uuid()).min(1),
          }),
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean(),
            count: z.number(),
          }),
        },
      },
      description: "Winners successfully saved to database",
    },
    400: {
      content: {
        "application/json": {
          schema: errorResponseSchema,
        },
      },
      description: "Incomplete or invalid query parameters",
    },
  },
});


export const listWinnersRoute = createRoute({
  method: "get",
  path: "/",
  tags: ["Winners"],
  request: { query: listWinnersQuerySchema },
  summary: "Get all winners",
  responses: {
    200: {
      content: { "application/json": { schema: paginatedResponseSchema(winnerSchema) } },
      description: "Successfully retrieved list of winners",
    },
  },
});

export const claimWinnerRoute = createRoute({
  method: "patch",
  path: "/claim",
  tags: ["Winners"],
  summary: "Updates winner if the prize is claimed",
  middleware: [requireAuth],
  request: {
    body: {
      content: {
        "application/json": {
          schema: z.object({
            winnerId: z.string().uuid(),
          }),
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean(),
          }),
        },
      },
      description: "Winners successfully claimed the prize",
    },
    400: {
      content: {
        "application/json": {
          schema: errorResponseSchema,
        },
      },
      description: "Incomplete or invalid query parameters",
    },
  },
});

const winnersRoute = app
  // 1. GET Candidates (Excludes existing winners & filters by regionIds if provided)
  .openapi(getDrawRoute, async (c) => {
    const { prizeId, numberOfWinners, regionId } = c.req.valid("query");

    if (prizeId === undefined || numberOfWinners === undefined || regionId === undefined) {
      return c.json({ message: "Missing required parameter" }, 400);
    }

    const existingWinners = await db.select({ personId: winners.personId }).from(winners);

    const excludedPersonIds = existingWinners.map((w) => w.personId);

    const conditions = [];

    if (excludedPersonIds.length > 0) {
      conditions.push(notInArray(persons.id, excludedPersonIds));
    }

    if (regionId && regionId.length > 0) {
      conditions.push(inArray(persons.regionId, regionId));
    }

    const candidatePersons = await db
      .select({
        id: persons.id,
        fullname: persons.fullname,
        employeeId: persons.employeeId,
        image: persons.image,
        isEligible: persons.isEligible,
        region: {
          id: regions.id,
          region: regions.region,
          regionName: regions.regionName,
        },
      })
      .from(persons)
      .innerJoin(regions, eq(persons.regionId, regions.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(sql`RANDOM()`)
      .limit(numberOfWinners);

    if (candidatePersons.length === 0) {
      return c.json({ message: "No eligible candidates found matching the criteria" }, 400);
    }

    return c.json(candidatePersons, 200);
  })

  // 2. POST Save Winners
  .openapi(saveDrawRoute, async (c) => {
    const { prizeId, personIds } = c.req.valid("json");
    const user = c.get("user");

    if (!user) {
      return c.json({ message: "Not Allowed" }, 400);
    }

    const recordsToInsert = personIds.map((personId) => ({
      prizeId,
      personId,
      givenByUserId: null,
    }));

    const inserted = await db.insert(winners).values(recordsToInsert).returning();

    return c.json({ success: true, count: inserted.length }, 200);
  })
  .openapi(listWinnersRoute, listWinnersHandler)
  .openapi(claimWinnerRoute, claimWinnerHandler);

export default winnersRoute;
