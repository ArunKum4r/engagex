import {
    index,
    pgTable,
    text,
    timestamp,
    unique,
    uuid,
    varchar,
} from "drizzle-orm/pg-core";

import { platformAccounts } from "./platform-accounts.js";
import { workspaces } from "./workspaces.js";

export const comments = pgTable(
    "comments",
    {
        id: uuid("id").defaultRandom().primaryKey(),

        workspaceId: uuid("workspace_id")
            .notNull()
            .references(() => workspaces.id, {
                onDelete: "cascade",
            }),

        platformAccountId: uuid("platform_account_id")
            .notNull()
            .references(() => platformAccounts.id, {
                onDelete: "cascade",
            }),

        externalCommentId: varchar("external_comment_id", {
            length: 255,
        }).notNull(),

        externalUserId: varchar("external_user_id", {
            length: 255,
        }).notNull(),

        username: varchar("username", {
            length: 255,
        }),

        text: text("text"),

        mediaId: varchar("media_id", {
            length: 255,
        }),

        mediaType: varchar("media_type", {
            length: 64,
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
    (table) => [
        unique("comments_platform_account_external_unique").on(
            table.platformAccountId,
            table.externalCommentId,
        ),
        index("comments_workspace_idx").on(table.workspaceId),
        index("comments_platform_account_idx").on(
            table.platformAccountId,
        ),
        index("comments_external_user_idx").on(
            table.externalUserId,
        ),
    ],
);