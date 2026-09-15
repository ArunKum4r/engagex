import { pgTable, uuid, varchar, text, jsonb, timestamp, index } from "drizzle-orm/pg-core";
import { users } from "./users.js";
import { workspaces } from "./workspaces.js";
export const adminAuditLogs = pgTable("admin_audit_logs", {
    id: uuid("id").defaultRandom().primaryKey(),
    adminUserId: uuid("admin_user_id").notNull().references(() => users.id, { onDelete: "restrict" }),
    workspaceId: uuid("workspace_id").references(() => workspaces.id, { onDelete: "set null" }),
    targetUserId: uuid("target_user_id").references(() => users.id, { onDelete: "set null" }),
    action: varchar("action", { length: 100 }).notNull(),
    entityType: varchar("entity_type", { length: 64 }),
    entityId: uuid("entity_id"),
    description: text("description"),
    before: jsonb("before").$type(),
    after: jsonb("after").$type(),
    metadata: jsonb("metadata").$type().notNull().default({}),
    ipAddress: varchar("ip_address", { length: 64 }),
    userAgent: varchar("user_agent", { length: 1024 }),
    createdAt: timestamp("created_at", { withTimezone: true, }).notNull().defaultNow(),
}, (table) => [
    index("admin_audit_logs_admin_user_id_idx").on(table.adminUserId),
    index("admin_audit_logs_workspace_id_idx").on(table.workspaceId),
    index("admin_audit_logs_target_user_id_idx").on(table.targetUserId),
    index("admin_audit_logs_entity_idx").on(table.entityType, table.entityId),
    index("admin_audit_logs_action_idx").on(table.action),
    index("admin_audit_logs_created_at_idx").on(table.createdAt),
]);
