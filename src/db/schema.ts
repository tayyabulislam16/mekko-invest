import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

/**
 * Source of truth for the D1 schema. After editing, run `npm run db:generate`
 * to produce a migration in ./migrations, then apply it with
 * `npm run db:migrate:local` (or :remote).
 */

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export const sessions = sqliteTable("sessions", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
});

export const portfolios = sqliteTable("portfolios", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  totalCapital: real("total_capital").notNull().default(0),
  currency: text("currency").notNull().default("PKR"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

/** A holding is one line: a company or the cash bucket. */
export const holdings = sqliteTable("holdings", {
  id: text("id").primaryKey(),
  portfolioId: text("portfolio_id")
    .notNull()
    .references(() => portfolios.id, { onDelete: "cascade" }),
  type: text("type", { enum: ["company", "cash"] }).notNull().default("company"),
  name: text("name").notNull(),
  ticker: text("ticker"),
  targetPercent: real("target_percent").notNull().default(0),
  actualAmount: real("actual_amount").notNull().default(0),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const usersRelations = relations(users, ({ many }) => ({
  portfolios: many(portfolios),
  sessions: many(sessions),
}));

export const portfoliosRelations = relations(portfolios, ({ one, many }) => ({
  user: one(users, { fields: [portfolios.userId], references: [users.id] }),
  holdings: many(holdings),
}));

export const holdingsRelations = relations(holdings, ({ one }) => ({
  portfolio: one(portfolios, {
    fields: [holdings.portfolioId],
    references: [portfolios.id],
  }),
}));

export type User = typeof users.$inferSelect;
export type Session = typeof sessions.$inferSelect;
export type Portfolio = typeof portfolios.$inferSelect;
export type Holding = typeof holdings.$inferSelect;
