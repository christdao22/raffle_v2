import { db, ilike, or } from "@raffle_v2/db";
import { registration } from "@raffle_v2/db/schema";
import type { RouteHandler } from "@hono/zod-openapi";
import { DatabaseError } from "pg";
import type { AppEnv } from "../lib/context";
import { paginate } from "../lib/pagination";
import { generateRegistrationId } from "../lib/registration.utils";
import type { registrationCreateRoute, registrationListRoute } from "../routes/registration.route";

export const listRegistration: RouteHandler<typeof registrationListRoute, AppEnv> = async (c) => {
  const { page, pageSize, search } = c.req.valid("query");

  const whereClause = search ? or(ilike(registration.id, `%${search}%`)) : undefined;

  const result = await paginate({
    page,
    pageSize,
    count: () => db.$count(registration, whereClause),
    query: ({ limit, offset }) =>
      db.query.registration.findMany({
        where: whereClause,
        limit,
        offset,
        orderBy: (fields, { asc }) => [asc(fields.id)],
        with: {
          user: true,
          events: true,
          participants: true,
        },
        columns: {
          participant_id: false,
          event_id: false,
          coach_id: false,
        },
      }),
  });

  const transformedData = result.data.map(({ user, ...rest }) => ({
    ...rest,
    coach: user,
  }));

  return c.json(
    {
      data: transformedData,
      meta: result.meta,
    },
    200,
  );
};

export const createRegistration: RouteHandler<typeof registrationCreateRoute, AppEnv> = async (
  c,
) => {
  const body = c.req.valid("json");

  try {
    const row = await db.transaction(async (tx) => {
      const { id, sequenceNumber } = await generateRegistrationId(tx, body.event_id);

      const [inserted] = await tx
        .insert(registration)
        .values({
          id,
          participant_id: body.participant_id,
          event_id: body.event_id,
          coach_id: body.coach_id,
          role: body.role ?? "individual",
          sequence_number: sequenceNumber,
        })
        .returning();

      return inserted;
    });

    return c.json(row, 201);
  } catch (err) {
    if (err instanceof Error && err.message === "Event not found") {
      return c.json({ error: "Event not found" }, 404);
    }
    // 23505 = unique_violation - backstop in case the constraint ever
    // catches something the lock didn't (e.g. isolation level changes).
    if (err instanceof DatabaseError && err.code === "23505") {
      return c.json(
        { error: "This participant is already registered for this event under this judge" },
        409,
      );
    }
    throw err;
  }
};

