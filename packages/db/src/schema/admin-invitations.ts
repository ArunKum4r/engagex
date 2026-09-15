import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  index,
} from "drizzle-orm/pg-core";
import { adminUsers } from "./admin-users.js";
import { adminRoles } from "./admin-roles.js";

export const adminInvitations = pgTable(
  "admin_invitations",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    email: varchar("email", { length: 255 }).notNull(),

    name: varchar("name", { length: 255 }).notNull(),

    roleId: uuid("role_id")
      .notNull()
      .references(() => adminRoles.id, {
        onDelete: "restrict",
      }),

    tokenHash: varchar("token_hash", { length: 255 })
      .notNull()
      .unique(),

    invitedByAdminId: uuid("invited_by_admin_id")
      .notNull()
      .references(() => adminUsers.id, {
        onDelete: "restrict",
      }),

    expiresAt: timestamp("expires_at", {
      withTimezone: true,
    }).notNull(),

    acceptedAt: timestamp("accepted_at", {
      withTimezone: true,
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
    index("admin_invitations_email_idx").on(table.email),
    index("admin_invitations_expires_at_idx").on(table.expiresAt),
    index("admin_invitations_invited_by_admin_id_idx").on(
      table.invitedByAdminId,
    ),
  ],
);