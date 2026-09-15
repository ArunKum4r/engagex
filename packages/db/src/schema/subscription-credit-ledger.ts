import {
  pgTable,
  uuid,
  integer,
  varchar,
  timestamp,
} from "drizzle-orm/pg-core";
import { subscriptions } from "./subscriptions.js";
import { subscriptionAddonsPurchased } from "./subscription-addons-purchased.js";

export const subscriptionCreditLedger = pgTable(
  "subscription_credit_ledger",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    subscriptionId: uuid("subscription_id")
      .notNull()
      .references(() => subscriptions.id, { onDelete: "cascade" }),

    creditType: varchar("credit_type", {
      length: 32,
    }).notNull(),

    amount: integer("amount").notNull(),

    consumedAmount: integer("consumed_amount").notNull().default(0),

    addonPurchaseId: uuid("addon_purchase_id").references(
      () => subscriptionAddonsPurchased.id,
      { onDelete: "set null" },
    ),

    startsAt: timestamp("starts_at", {
      withTimezone: true,
    }).notNull(),

    endsAt: timestamp("ends_at", {
      withTimezone: true,
    }),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    }).notNull().defaultNow(),

    updatedAt: timestamp("updated_at", {
      withTimezone: true,
    }).notNull().defaultNow(),
  },
);