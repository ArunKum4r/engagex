import {
    pgTable,
    uuid,
    varchar,
    timestamp,
} from "drizzle-orm/pg-core";

export const entitlementDefinitions = pgTable(
    "entitlement_definitions",
    {
        id: uuid("id")
            .defaultRandom()
            .primaryKey(),

        key: varchar("key", {
            length: 100,
        })
            .notNull()
            .unique(),

        name: varchar("name", {
            length: 255,
        }).notNull(),

        description: varchar("description", {
            length: 1000,
        }),

        type: varchar("type", {
            length: 32,
        }).notNull(),

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