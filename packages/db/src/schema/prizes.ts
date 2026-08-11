import { relations, sql } from "drizzle-orm";
import { integer, pgTable, text, uuid } from "drizzle-orm/pg-core";
import { winners } from "./winners";

export const prizes = pgTable("prizes", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  prize: text("prize").notNull(),
  imageUrl: text("image_url"),
  sponsor: text("sponsor"),
  sponsorImage: text("sponsor_image"),
  numberOfWinners: integer("number_of_winners").default(1).notNull(),
});

export const prizesRelations = relations(prizes, ({ many }) => ({
  winners: many(winners),
}));
