import { pgTable, uuid, varchar, timestamp, index, unique } from "drizzle-orm/pg-core";
import { workspaces } from "./workspaces.js";

export const tags = pgTable("tags", {
    id: uuid("id").defaultRandom().primaryKey(),
    workspaceId: uuid("workspace_id").notNull().references(() => workspaces.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 64 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    unique("tags_workspace_name_unique").on(table.workspaceId, table.name),
    index("tags_workspace_id_idx").on(table.workspaceId),
  ],
);