import { relations, sql } from "drizzle-orm";
import { boolean, pgTable, text, uuid } from "drizzle-orm/pg-core";
import { regions } from "./regions";
import { winners } from "./winners";

export const persons = pgTable("persons", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  fullname: text("fullname").notNull(),
  employeeId: text("employee_id").notNull(),
  image: text("image").notNull(),
  regionId: uuid("region_id")
    .notNull()
    .references(() => regions.id, {
      onDelete: "cascade",
    }),
  schoolsDivision: text("schools_division").notNull(),
  station: text("station").notNull(),
  designation: text("designation").notNull(),
  email: text("email").notNull(),
  isEligible: boolean("is_eligible").default(true).notNull(),
});

export const personsRelations = relations(persons, ({ one, many }) => ({
  region: one(regions, {
    fields: [persons.regionId],
    references: [regions.id],
  }),

  wins: many(winners),
}));
