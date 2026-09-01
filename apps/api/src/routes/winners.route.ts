import { randomInt } from "node:crypto";
import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { and, db, eq, inArray, isNull, notInArray, persons, regions, winners } from "@raffle_v2/db";
import {
  paginatedResponseSchema,
  paginationQuerySchema,
  regionSchema,
  winnerSchema,
} from "@raffle_v2/shared";
import {
  claimWinnerHandler,
  deleteWinnerHandler,
  listUnclaimedWinnersHandler,
  listWinnersHandler,
  redrawWinnerHandler,
} from "../controller/winner.controller";
import type { AppEnv } from "../lib/context";
import { requireAuth } from "../middleware/auth";

const app = new OpenAPIHono<AppEnv>();

export function normalizeRegionIds(regionId?: string | string[]) {
  const values = Array.isArray(regionId)
    ? regionId
    : typeof regionId === "string"
      ? regionId.split(",")
      : [];

  return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}

export function secureRandomIndex(maxExclusive: number) {
  if (!Number.isInteger(maxExclusive) || maxExclusive <= 0) {
    throw new Error("Random index range must be a positive integer");
  }

  return randomInt(0, maxExclusive);
}

export function selectEligibleWinnerIds({
  participants,
  numberOfWinners,
  regionIds,
  rng = secureRandomIndex,
  selectedParticipantIds = new Set<string>(),
}: {
  participants: Array<{ id: string; regionId: string; isEligible: boolean }>;
  numberOfWinners: number;
  regionIds?: string[];
  rng?: (maxExclusive: number) => number;
  selectedParticipantIds?: Set<string>;
}) {
  if (!Number.isInteger(numberOfWinners) || numberOfWinners <= 0) {
    throw new Error("numberOfWinners must be greater than 0");
  }

  const normalizedRegionIds = normalizeRegionIds(regionIds ?? []);
  const candidatePools = new Map<string, string[]>();

  for (const participant of participants) {
    if (!participant.isEligible) continue;
    if (selectedParticipantIds.has(participant.id)) continue;
    if (normalizedRegionIds.length > 0 && !normalizedRegionIds.includes(participant.regionId)) {
      continue;
    }

    const pool = candidatePools.get(participant.regionId) ?? [];
    pool.push(participant.id);
    candidatePools.set(participant.regionId, pool);
  }

  const activeRegions =
    normalizedRegionIds.length > 0 ? normalizedRegionIds : [...candidatePools.keys()];
  const availableEligibleParticipants = [...candidatePools.values()].reduce(
    (sum, pool) => sum + pool.length,
    0,
  );

  if (availableEligibleParticipants === 0) {
    throw new Error("No eligible participants found matching the criteria");
  }

  if (numberOfWinners > availableEligibleParticipants) {
    throw new Error("Requested winners exceed available eligible participants");
  }

  const selectedWinnerIds: string[] = [];

  while (selectedWinnerIds.length < numberOfWinners) {
    const remainingRegions = activeRegions.filter(
      (regionId) => (candidatePools.get(regionId)?.length ?? 0) > 0,
    );

    if (remainingRegions.length === 0) {
      break;
    }

    const shuffledRegions = [...remainingRegions];
    for (let i = shuffledRegions.length - 1; i > 0; i -= 1) {
      const j = rng(i + 1);
      const currentRegion = shuffledRegions[i]!;
      const swapRegion = shuffledRegions[j]!;
      shuffledRegions[i] = swapRegion;
      shuffledRegions[j] = currentRegion;
    }

    let roundSelected = false;

    for (const regionId of shuffledRegions) {
      if (selectedWinnerIds.length >= numberOfWinners) break;

      const regionPool = candidatePools.get(regionId);
      if (!regionPool || regionPool.length === 0) continue;

      const selectedIndex = rng(regionPool.length);
      const [nextWinnerId] = regionPool.splice(selectedIndex, 1);

      if (!nextWinnerId) continue;

      selectedWinnerIds.push(nextWinnerId);
      selectedParticipantIds.add(nextWinnerId);
      roundSelected = true;
    }

    if (!roundSelected) {
      break;
    }
  }

  if (selectedWinnerIds.length < numberOfWinners) {
    throw new Error("No eligible participants found matching the criteria");
  }

  return selectedWinnerIds;
}

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

const winnerListResponseSchema = paginatedResponseSchema(winnerSchema, {
  stats: z.object({
    receivedCount: z.number().int(),
    pendingCount: z.number().int(),
    totalPrizes: z.number().int(),
  }),
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

export const rejectDrawCandidatesRoute = createRoute({
  method: "post",
  path: "/draw/reject",
  tags: ["Winners"],
  summary: "Record rejected draw candidates",
  middleware: [requireAuth],
  request: {
    body: {
      content: {
        "application/json": {
          schema: z.object({
            prizeId: z.string().uuid(),
            personIds: z.array(z.string().uuid()).min(1),
            reason: z.string().trim().min(1, "Reason is required.").max(1000),
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
      description: "Rejected candidates recorded successfully",
    },
    400: {
      content: {
        "application/json": {
          schema: errorResponseSchema,
        },
      },
      description: "Rejected candidate request is invalid",
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
      content: { "application/json": { schema: winnerListResponseSchema } },
      description: "Successfully retrieved list of winners",
    },
  },
});

export const listUnclaimedWinnersRoute = createRoute({
  method: "get",
  path: "/unclaimed",
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

export const deleteWinnerRoute = createRoute({
  method: "delete",
  path: "/delete/{id}",
  tags: ["Winners"],
  summary: "Remove winner",
  middleware: [requireAuth],
  request: {
    params: z.object({
      id: z.string().uuid(),
    }),
    body: {
      content: {
        "application/json": {
          schema: z.object({
            reason: z.string().trim().min(1, "Reason is required.").max(1000),
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
      description: "Winners successfully removed",
    },
    400: {
      content: {
        "application/json": {
          schema: errorResponseSchema,
        },
      },
      description: "Incomplete or invalid path parameters",
    },
  },
});

export const redrawWinnerRoute = createRoute({
  method: "post",
  path: "/redraw",
  tags: ["Winners"],
  summary: "Create a redraw for an invalidated winner",
  middleware: [requireAuth],
  request: {
    body: {
      content: {
        "application/json": {
          schema: z.object({
            winnerId: z.string().uuid(),
            reason: z.string().trim().min(1, "Reason is required.").max(1000),
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
            winnerId: z.string().uuid().nullable().optional(),
          }),
        },
      },
      description: "Winner redraw completed successfully",
    },
    400: {
      content: {
        "application/json": {
          schema: errorResponseSchema,
        },
      },
      description: "Redraw request is invalid",
    },
  },
});

const winnersRoute = app
  // 1. GET Candidates (Excludes existing winners & filters by regionIds if provided)
  .openapi(getDrawRoute, async (c) => {
    const { prizeId, numberOfWinners, regionId } = c.req.valid("query");

    if (prizeId === undefined || numberOfWinners === undefined) {
      return c.json({ message: "Missing required parameter" }, 400);
    }

    const normalizedRegionIds = normalizeRegionIds(regionId);
    const existingWinners = await db
      .select({ personId: winners.personId })
      .from(winners)
      .where(isNull(winners.deletedAt));
    const excludedPersonIds = existingWinners.map((w) => w.personId);

    const conditions = [eq(persons.isEligible, true)];

    if (excludedPersonIds.length > 0) {
      conditions.push(notInArray(persons.id, excludedPersonIds));
    }

    if (normalizedRegionIds.length > 0) {
      conditions.push(inArray(persons.regionId, normalizedRegionIds));
    }

    const eligiblePersons = await db
      .select({
        id: persons.id,
        fullname: persons.fullname,
        employeeId: persons.employeeId,
        image: persons.image,
        isEligible: persons.isEligible,
        regionId: persons.regionId,
        region: {
          id: regions.id,
          region: regions.region,
          regionName: regions.regionName,
        },
      })
      .from(persons)
      .innerJoin(regions, eq(persons.regionId, regions.id))
      .where(and(...conditions));

    const selectedParticipantIds = new Set<string>();
    const chosenIds = selectEligibleWinnerIds({
      participants: eligiblePersons.map((person) => ({
        id: person.id,
        regionId: person.regionId,
        isEligible: person.isEligible,
      })),
      numberOfWinners,
      regionIds: normalizedRegionIds,
      rng: secureRandomIndex,
      selectedParticipantIds,
    });

    const candidatePersons = eligiblePersons.filter((person) => chosenIds.includes(person.id));

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

    if (inserted.length > 0) {
      await db.update(persons).set({ isEligible: false }).where(inArray(persons.id, personIds));
    }

    return c.json({ success: true, count: inserted.length }, 200);
  })
  .openapi(rejectDrawCandidatesRoute, async (c) => {
    const { prizeId, personIds, reason } = c.req.valid("json");
    const user = c.get("user");

    if (!user) {
      return c.json({ message: "Not Allowed" }, 400);
    }

    const rejectedAt = new Date();
    const rejectedCandidates = await db
      .insert(winners)
      .values(
        personIds.map((personId) => ({
          prizeId,
          personId,
          givenByUserId: user.id,
          reason,
          deletedAt: rejectedAt,
        })),
      )
      .returning();

    return c.json({ success: true, count: rejectedCandidates.length }, 200);
  })
  .openapi(listWinnersRoute, listWinnersHandler)
  .openapi(listUnclaimedWinnersRoute, listUnclaimedWinnersHandler)
  .openapi(claimWinnerRoute, claimWinnerHandler)
  .openapi(deleteWinnerRoute, deleteWinnerHandler)
  .openapi(redrawWinnerRoute, redrawWinnerHandler);

export default winnersRoute;
