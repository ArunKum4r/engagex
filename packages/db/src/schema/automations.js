import { pgTable, uuid, varchar, text, timestamp, index } from "drizzle-orm/pg-core";
import { workspaces } from "./workspaces.js";
import { users } from "./users.js";
import { platformAccounts } from "./platform-accounts.js";
export const automations = pgTable("automations", {
    id: uuid("id").defaultRandom().primaryKey(),
    workspaceId: uuid("workspace_id").notNull().references(() => workspaces.id, { onDelete: "cascade" }),
    platformAccountId: uuid("platform_account_id").references(() => platformAccounts.id, { onDelete: "set null" }),
    createdByUserId: uuid("created_by_user_id").notNull().references(() => users.id, { onDelete: "restrict" }),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),
    status: varchar("status", { length: 32 }).notNull().default("DRAFT"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
    index("automations_workspace_id_idx").on(table.workspaceId),
    index("automations_platform_account_id_idx").on(table.platformAccountId),
    index("automations_created_by_user_id_idx").on(table.createdByUserId),
]);
