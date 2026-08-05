import type { RouteHandler } from "@hono/zod-openapi";
import { db, eq, ilike, or } from "@raffle_v2/db";
import { participants } from "@raffle_v2/db/schema";
import type { AppEnv } from "../lib/context";
import { paginate } from "../lib/pagination";
import type {
  participantCreateRoute,
  participantDeleteRoute,
  participantGetRoute,
  participantListRoute,
  participantUpdateRoute,
} from "../routes/participants.route";

export const createParticipant: RouteHandler<typeof participantCreateRoute, AppEnv> = async (c) => {
  const body = c.req.valid("json");

  const [row] = await db.insert(participants).values(body).returning();
  return c.json(row, 201);
};

export const listParticipant: RouteHandler<typeof participantListRoute, AppEnv> = async (c) => {
  const { page, pageSize, search } = c.req.valid("query");

  // undefined when there's no search term (a no-op filter). Passed to
  // BOTH count() and query() below - if only one of them got it, total
  // would stop matching what's actually returned.
  const whereClause = search
    ? or(
        ilike(participants.lastName, `%${search}%`),
        ilike(participants.firstName, `%${search}%`),
        ilike(participants.middleName, `%${search}%`),
        ilike(participants.suffix, `%${search}%`),
      )
    : undefined;

  const result = await paginate({
    page,
    pageSize,
    count: () => db.$count(participants, whereClause),
    query: ({ limit, offset }) =>
      db.query.participants.findMany({
        where: whereClause,
        limit,
        offset,
        orderBy: (fields, { asc }) => [asc(fields.lastName), asc(fields.firstName)],
      }),
  });

  return c.json(result, 200);
};

export const getParticipant: RouteHandler<typeof participantGetRoute, AppEnv> = async (c) => {
  const { id } = c.req.valid("param");
  const row = await db.query.participants.findFirst({ where: eq(participants.id, id) });
  if (!row) return c.json({ error: "Participant not found" }, 404);
  return c.json(row, 200);
};

export const updateParticipant: RouteHandler<typeof participantUpdateRoute, AppEnv> = async (c) => {
  const { id } = c.req.valid("param");
  const body = c.req.valid("json");
  const [row] = await db.update(participants).set(body).where(eq(participants.id, id)).returning();
  if (!row) return c.json({ error: "Participant not found" }, 404);
  return c.json(row, 200);
};

export const deleteParticipant: RouteHandler<typeof participantDeleteRoute, AppEnv> = async (c) => {
  const { id } = c.req.valid("param");
  const [row] = await db.delete(participants).where(eq(participants.id, id)).returning();
  if (!row) return c.json({ error: "Participant not found" }, 404);
  return c.body(null, 204);
};
