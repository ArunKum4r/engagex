import {
    pgTable,
    uuid,
    varchar,
    timestamp,
} from "drizzle-orm/pg-core";

import { users } from "./users.js";
import { subscriptionPlans } from "./subscription-plans.js";

export const subscriptions = pgTable(
    "subscriptions",
    {
        id: uuid("id")
            .defaultRandom()
            .primaryKey(),

        planId: uuid("plan_id")
            .notNull()
            .references(() => subscriptionPlans.id),

        userId: uuid("user_id")
            .notNull()
            .references(() => users.id, {
                onDelete: "cascade",
            }),

        status: varchar("status", {
            length: 32,
        }).notNull(),

        startsAt: timestamp("starts_at", {
            withTimezone: true,
        })
            .notNull()
            .defaultNow(),

        endsAt: timestamp("ends_at", {
            withTimezone: true,
        }),

        createdAt: timestamp("created_at", {
            withTimezone: true,
        })
            .notNull()
            .defaultNow(),

        updatedAt: timestamp("updated_at", {
            withTimezone: true,
        })
            .notNull()
            .defaultNow(),
    },
);