import { relations } from "drizzle-orm";
import { pgTable, text } from "drizzle-orm/pg-core";
import { regions } from "./regions";
import { winners } from "./winners";

export const persons = pgTable("persons", {
  id: text("id").primaryKey(),
  fullname: text("fullname").notNull(),
  regionId: text("region_id")
    .notNull()
    .references(() => regions.id, { onDelete: "cascade" }),
});

export const personsRelations = relations(persons, ({ one, many }) => ({
  region: one(regions, {
    fields: [persons.regionId],
    references: [regions.id],
  }),
  wins: many(winners),
}));
