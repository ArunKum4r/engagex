import {
    pgTable,
    uuid,
    integer,
    boolean,
    timestamp,
    unique,
} from "drizzle-orm/pg-core";

import { subscriptions } from "./subscriptions.js";
import { entitlementDefinitions } from "./entitlement-definitions.js";

export const subscriptionEntitlementOverrides = pgTable(
    "subscription_entitlement_overrides",
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

        entitlementId: uuid("entitlement_id")
            .notNull()
            .references(
                () => entitlementDefinitions.id,
            ),

        booleanValue: boolean("boolean_value"),

        limitValue: integer("limit_value"),

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
    (table) => ({
        subscriptionEntitlementUnique:
            unique().on(
                table.subscriptionId,
                table.entitlementId,
            ),
    }),
);