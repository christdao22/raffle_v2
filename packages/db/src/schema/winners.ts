import { relations, sql } from "drizzle-orm";
import { boolean, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { user } from "./auth";
import { persons } from "./persons";
import { prizes } from "./prizes";

export const winners = pgTable("winners", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  prizeId: uuid("prize_id")
    .notNull()
    .references(() => prizes.id, { onDelete: "cascade" }),
  personId: uuid("person_id")
    .notNull()
    .references(() => persons.id, { onDelete: "cascade" }),
  givenByUserId: text("given_by_user_id").references(() => user.id, { onDelete: "set null" }),
  isReceived: boolean("is_received").default(false).notNull(),
  receivedAt: timestamp("received_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  deletedAt: timestamp("deleted_at"),
});

export const winnersRelations = relations(winners, ({ one }) => ({
  prize: one(prizes, {
    fields: [winners.prizeId],
    references: [prizes.id],
  }),
  person: one(persons, {
    fields: [winners.personId],
    references: [persons.id],
  }),
  givenBy: one(user, {
    fields: [winners.givenByUserId],
    references: [user.id],
  }),
}));
