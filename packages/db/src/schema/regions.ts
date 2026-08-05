import { relations } from "drizzle-orm";
import { pgTable, text } from "drizzle-orm/pg-core";
import { persons } from "./persons";

export const regions = pgTable("regions", {
  id: text("id").primaryKey(),
  region: text("region").notNull(),
  regionName: text("region_name").notNull(),
});

export const regionsRelations = relations(regions, ({ many }) => ({
  persons: many(persons),
}));
