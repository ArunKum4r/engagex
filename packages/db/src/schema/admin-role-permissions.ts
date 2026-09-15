import {
  pgTable,
  uuid,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";

import { adminRoles } from "./admin-roles.js";
import { adminPermissions } from "./admin-permissions.js";

export const adminRolePermissions = pgTable(
  "admin_role_permissions",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    roleId: uuid("role_id")
      .notNull()
      .references(() => adminRoles.id, {
        onDelete: "cascade",
      }),

    permissionId: uuid("permission_id")
      .notNull()
      .references(() => adminPermissions.id, {
        onDelete: "cascade",
      }),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    unique().on(
      table.roleId,
      table.permissionId,
    ),
  ],
);