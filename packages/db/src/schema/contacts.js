import { pgTable, uuid, varchar, text, timestamp, index, unique } from "drizzle-orm/pg-core";
import { workspaces } from "./workspaces.js";
export const contacts = pgTable("contacts", {
    id: uuid("id").defaultRandom().primaryKey(),
    workspaceId: uuid("workspace_id").notNull().references(() => workspaces.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 255 }),
    email: varchar("email", { length: 320 }),
    phone: varchar("phone", { length: 32 }),
    avatarUrl: varchar("avatar_url", { length: 2048 }),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
    index("contacts_workspace_id_idx").on(table.workspaceId),
    index("contacts_email_idx").on(table.email),
    index("contacts_phone_idx").on(table.phone),
    unique("contacts_workspace_email_unique").on(table.workspaceId, table.email),
    unique("contacts_workspace_id_id_unique").on(table.workspaceId, table.id),
]);
