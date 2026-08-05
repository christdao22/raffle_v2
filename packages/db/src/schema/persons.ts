import { relations } from "drizzle-orm";
import { boolean, pgTable, text } from "drizzle-orm/pg-core";
import { regions } from "./regions";
import { winners } from "./winners";

export const persons = pgTable("persons", {
  id: text("id").primaryKey(),
  fullname: text("fullname").notNull(),
  employeeId: text("employee_id").notNull(),
  image: text("image").notNull(),
  regionId: text("region_id")
    .notNull()
    .references(() => regions.id, { onDelete: "cascade" }),
  isEligible: boolean("is_eligible").default(true).notNull(),
});

export const personsRelations = relations(persons, ({ one, many }) => ({
  region: one(regions, {
    fields: [persons.regionId],
    references: [regions.id],
  }),
  wins: many(winners),
}));
