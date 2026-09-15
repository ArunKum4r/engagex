import {
    pgTable,
    uuid,
    integer,
    boolean,
    timestamp,
    unique,
} from "drizzle-orm/pg-core";

import { subscriptionAddons } from "./subscription-addons.js";
import { entitlementDefinitions } from "./entitlement-definitions.js";

export const addonEntitlements = pgTable(
    "addon_entitlements",
    {
        id: uuid("id")
            .defaultRandom()
            .primaryKey(),

        addonId: uuid("addon_id")
            .notNull()
            .references(
                () => subscriptionAddons.id,
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
        addonEntitlementUnique:
            unique().on(
                table.addonId,
                table.entitlementId,
            ),
    }),
);