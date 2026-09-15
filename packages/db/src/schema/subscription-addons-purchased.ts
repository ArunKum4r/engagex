import {
    pgTable,
    uuid,
    integer,
    timestamp,
} from "drizzle-orm/pg-core";

import { subscriptions } from "./subscriptions.js";
import { subscriptionAddons } from "./subscription-addons.js";

export const subscriptionAddonsPurchased = pgTable(
    "subscription_addons_purchased",
    {
        id: uuid("id")
            .defaultRandom()
            .primaryKey(),

        subscriptionId: uuid("subscription_id")
            .notNull()
            .references(
                () => subscriptions.id,
                {
                    onDelete: "cascade",
                },
            ),

        addonId: uuid("addon_id")
            .notNull()
            .references(
                () => subscriptionAddons.id,
            ),

        quantity: integer("quantity")
            .notNull()
            .default(1),

        startsAt: timestamp("starts_at", {
            withTimezone: true,
        }).notNull(),

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