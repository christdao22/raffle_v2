import { relations } from "drizzle-orm";
import { integer, pgTable, text } from "drizzle-orm/pg-core";
import { winners } from "./winners";

export const prizes = pgTable("prizes", {
  id: text("id").primaryKey(),
  prize: text("prize").notNull(),
  prizeImage: text("prize_image"),
  sponsor: text("sponsor"),
  sponsorImage: text("sponsor_image"),
  numberOfWinners: integer("number_of_winners").default(1).notNull(),
});

export const prizesRelations = relations(prizes, ({ many }) => ({
  winners: many(winners),
}));
