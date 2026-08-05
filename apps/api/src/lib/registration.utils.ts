import { type db, eq, events, registration, sql } from "@raffle_v2/db";

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

export async function generateRegistrationId(
  tx: Tx,
  eventId: string,
): Promise<{ id: string; sequenceNumber: number }> {
  // Locks this event row for the rest of the transaction. A second
  // concurrent transaction generating an id for the SAME event blocks
  // here until the first commits/rolls back - other events aren't
  // affected, Postgres row locks don't touch unrelated rows.
  const [event] = await tx
    .select({ code: events.code })
    .from(events)
    .where(eq(events.id, eventId))
    .for("update");

  if (!event) throw new Error("Event not found");

  const [row] = await tx
    .select({ maxSequence: sql<number>`COALESCE(MAX(${registration.sequence_number}), 0)` })
    .from(registration)
    .where(eq(registration.event_id, eventId));

  const sequenceNumber = (row?.maxSequence ?? 0) + 1;
  return { id: `${event.code}${String(sequenceNumber).padStart(3, "0")}`, sequenceNumber };
}

