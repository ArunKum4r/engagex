import {
    pgTable,
    uuid,
    integer,
    boolean,
    timestamp,
    unique,
} from "drizzle-orm/pg-core";

import { subscriptionPlans } from "./subscription-plans.js";
import { entitlementDefinitions } from "./entitlement-definitions.js";

export const planEntitlements = pgTable(
    "plan_entitlements",
    {
        id: uuid("id")
            .defaultRandom()
            .primaryKey(),

        planId: uuid("plan_id")
            .notNull()
            .references(
                () => subscriptionPlans.id,
                {
                    onDelete: "cascade",
                },
            ),

        entitlementId: uuid("entitlement_id")
            .notNull()
            .references(
                () => entitlementDefinitions.id,
                {
                    onDelete: "cascade",
                },
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
        planEntitlementUnique: unique().on(
            table.planId,
            table.entitlementId,
        ),
    }),
);