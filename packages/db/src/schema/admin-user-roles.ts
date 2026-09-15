import {
  pgTable,
  uuid,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";

import { adminUsers } from "./admin-users.js";
import { adminRoles } from "./admin-roles.js";

export const adminUserRoles = pgTable(
  "admin_user_roles",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    adminUserId: uuid("admin_user_id")
      .notNull()
      .references(() => adminUsers.id, {
        onDelete: "cascade",
      }),

    roleId: uuid("role_id")
      .notNull()
      .references(() => adminRoles.id, {
        onDelete: "cascade",
      }),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    unique().on(table.adminUserId, table.roleId),
  ],
);