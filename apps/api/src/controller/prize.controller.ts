import type { RouteHandler } from "@hono/zod-openapi";
import { db, ilike, or, prizes } from "@raffle_v2/db";
import type { AppEnv } from "../lib/context";
import { paginate } from "../lib/pagination";
import { broadcastEvent } from "../lib/ws";
import type {
  createPrizeRoute,
  getPrizeRoute,
  listPrizesRoute,
  selectPrizeRoute,
} from "../routes/prizes.route";
// Fixed file import path: prizes.routes instead of prizes.route

export const listPrizesHandler: RouteHandler<typeof listPrizesRoute, AppEnv> = async (c) => {
  const { page, pageSize, search } = c.req.valid("query");

  const whereClause = search ? or(ilike(prizes.prize, `%${search}%`)) : undefined;

  const result = await paginate({
    page,
    pageSize,
    count: () => db.$count(prizes, whereClause),
    query: async ({ limit, offset }) => {
      const rows = await db.query.prizes.findMany({
        where: whereClause,
        limit,
        offset,
        orderBy: (fields, { asc }) => [asc(fields.id)],
      });

      // Map rows to match `prizeSchema` expectations exactly
      return rows.map((row) => ({
        ...row,
        sponsor: row.sponsor ?? "", // Convert null to string if sponsor is required in schema
        imageUrl: row.imageUrl ?? undefined, // Convert null to undefined for Zod optional()
        sponsorImage: row.sponsorImage ?? undefined,
      }));
    },
  });

  return c.json(result, 200);
};

export const getPrizeHandler: RouteHandler<typeof getPrizeRoute, AppEnv> = async (c) => {
  const { id } = c.req.valid("param");

  const prize = await db.query.prizes.findFirst({
    where: (prizes, { eq }) => eq(prizes.id, id),
  });

  if (!prize) {
    return c.json({ message: "Prize not found" }, 404);
  }

  return c.json(prize, 200);
};

export const createPrizeHandler: RouteHandler<typeof createPrizeRoute, AppEnv> = async (c) => {
  const body = c.req.valid("json");

  const newPrize = {
    id: crypto.randomUUID(),
    ...body,
  };

  return c.json(newPrize, 201);
};

export const selectPrizeHandler: RouteHandler<typeof selectPrizeRoute, AppEnv> = async (c) => {
  const { prizeId } = c.req.valid("json");

  // 1. Drizzle DB Update (e.g., mark prize as active)
  // await db.update(prizes).set({ isActive: true }).where(eq(prizes.id, prizeId));

  // 2. Broadcast event to WebSocket subscribers on LiveDraw
  broadcastEvent("PRIZE_SELECTED", { prizeId });

  return c.json({ success: true, prizeId }, 200);
};
