import {
  pgTable,
  uuid,
  integer,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";
import { subscriptions } from "./subscriptions.js";

export const subscriptionUsagePeriods = pgTable(
  "subscription_usage_periods",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    subscriptionId: uuid("subscription_id")
      .notNull()
      .references(() => subscriptions.id, { onDelete: "cascade" }),

    periodStart: timestamp("period_start", {
      withTimezone: true,
    }).notNull(),

    periodEnd: timestamp("period_end", {
      withTimezone: true,
    }).notNull(),

    includedDms: integer("included_dms").notNull().default(0),

    usedIncludedDms: integer("used_included_dms").notNull().default(0),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    }).notNull().defaultNow(),

    updatedAt: timestamp("updated_at", {
      withTimezone: true,
    }).notNull().defaultNow(),
  },
  (table) => ({
    subscriptionPeriodUnique: unique().on(
      table.subscriptionId,
      table.periodStart,
    ),
  }),
);