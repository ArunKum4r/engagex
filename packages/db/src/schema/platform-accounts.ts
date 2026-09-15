import { pgTable, uuid, varchar, text, jsonb, timestamp, index, unique } from "drizzle-orm/pg-core";
import { workspaces } from "./workspaces.js";

export const platformAccounts = pgTable("platform_accounts", {
    id: uuid("id").defaultRandom().primaryKey(),
    workspaceId: uuid("workspace_id").notNull().references(() => workspaces.id, { onDelete: "cascade" }),
    platform: varchar("platform", { length: 32 }).notNull(),
    externalAccountId: varchar("external_account_id", { length: 255 }).notNull(),
    name: varchar("name", { length: 255 }),
    username: varchar("username", { length: 255 }),
    status: varchar("status", { length: 32 }).notNull().default("ACTIVE"),
    credentials: jsonb("credentials").$type<Record<string, unknown>>().notNull().default({}),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().notNull().default({}),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    unique("platform_accounts_workspace_platform_external_unique").on(table.workspaceId, table.platform, table.externalAccountId),
    index("platform_accounts_workspace_id_idx").on(table.workspaceId),
    index("platform_accounts_platform_idx").on(table.platform),
    index("platform_accounts_status_idx").on(table.status),
    unique("platform_accounts_workspace_id_id_unique").on(table.workspaceId, table.id),
  ],
);