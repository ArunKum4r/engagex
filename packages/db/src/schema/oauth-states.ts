import {
    pgTable,
    uuid,
    varchar,
    timestamp,
    index,
} from "drizzle-orm/pg-core";

import { users } from "./users.js";
import { workspaces } from "./workspaces.js";

export const oauthStates = pgTable(
    "oauth_states",
    {
        id: uuid("id")
            .defaultRandom()
            .primaryKey(),

        userId: uuid("user_id")
            .notNull()
            .references(() => users.id, {
                onDelete: "cascade",
            }),

        workspaceId: uuid("workspace_id")
            .notNull()
            .references(() => workspaces.id, {
                onDelete: "cascade",
            }),

        provider: varchar("provider", {
            length: 64,
        }).notNull(),

        stateHash: varchar("state_hash", {
            length: 128,
        }).notNull().unique(),

        expiresAt: timestamp("expires_at", {
            withTimezone: true,
        }).notNull(),

        usedAt: timestamp("used_at", {
            withTimezone: true,
        }),

        createdAt: timestamp("created_at", {
            withTimezone: true,
        }).notNull().defaultNow(),
    },
    (table) => [
        index("oauth_states_user_id_idx").on(table.userId),
        index("oauth_states_workspace_id_idx").on(table.workspaceId),
        index("oauth_states_provider_idx").on(table.provider),
        index("oauth_states_expires_at_idx").on(table.expiresAt),
    ],
);