import {
    pgTable,
    uuid,
    varchar,
    timestamp,
} from "drizzle-orm/pg-core";

import { users } from "./users.js";

export const workspaces = pgTable("workspaces", {
    id: uuid("id")
        .defaultRandom()
        .primaryKey(),

    ownerId: uuid("owner_id")
        .notNull()
        .references(() => users.id, {
            onDelete: "cascade",
        }),

    name: varchar("name", {
        length: 255,
    }).notNull(),

    slug: varchar("slug", {
        length: 100,
    }).notNull().unique(),

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
});