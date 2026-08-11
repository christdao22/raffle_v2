import { relations, sql } from "drizzle-orm";
import { pgTable, text, uuid } from "drizzle-orm/pg-core";
import { persons } from "./persons";

export const regions = pgTable("regions", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  region: text("region").notNull(),
  regionName: text("region_name").notNull(),
});

export const regionsRelations = relations(regions, ({ many }) => ({
  persons: many(persons),
}));
