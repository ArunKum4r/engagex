import {
    pgTable,
    uuid,
    varchar,
    text,
    integer,
    boolean,
    timestamp,
} from "drizzle-orm/pg-core";

export const subscriptionAddons = pgTable(
    "subscription_addons",
    {
        id: uuid("id")
            .defaultRandom()
            .primaryKey(),

        name: varchar("name", {
            length: 255,
        }).notNull(),

        slug: varchar("slug", {
            length: 100,
        })
            .notNull()
            .unique(),

        description: text("description"),

        price: integer("price").notNull(),

        currency: varchar("currency", {
            length: 3,
        })
            .notNull()
            .default("INR"),

        billingInterval: varchar("billing_interval", {
            length: 32,
        }).notNull(),

        isActive: boolean("is_active")
            .notNull()
            .default(true),

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