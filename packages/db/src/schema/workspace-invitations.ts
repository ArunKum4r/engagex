import { pgTable, uuid, varchar, timestamp, index, unique } from "drizzle-orm/pg-core";
import { workspaces } from "./workspaces.js";

export const workspaceInvitations = pgTable("workspace_invitations", {
    id: uuid("id").defaultRandom().primaryKey(),
    workspaceId: uuid("workspace_id").notNull().references(() => workspaces.id, { onDelete: "cascade" }),
    email: varchar("email", { length: 255 }).notNull(),
    role: varchar("role", { length: 32 }).notNull().default("MEMBER"),
    tokenHash: varchar("token_hash", { length: 255 }).notNull(),
    expiresAt: timestamp("expires_at", {withTimezone: true,}).notNull(),
    acceptedAt: timestamp("accepted_at", {withTimezone: true,}),
    createdAt: timestamp("created_at", {withTimezone: true,}).notNull().defaultNow(),
}, (table) => [
    unique("workspace_invitations_token_hash_unique").on(table.tokenHash),
    index("workspace_invitations_workspace_id_idx").on(table.workspaceId),
    index("workspace_invitations_email_idx").on(table.email),
    index("workspace_invitations_expires_at_idx").on(table.expiresAt),
]);