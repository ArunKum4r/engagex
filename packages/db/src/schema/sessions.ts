import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  index,
} from "drizzle-orm/pg-core";

import { users } from "./users.js";
import { adminUsers } from "./admin-users.js";

export const sessions = pgTable(
  "sessions",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, {
        onDelete: "cascade",
      }),

    tokenHash: varchar("token_hash", {
      length: 255,
    })
      .notNull()
      .unique(),

    expiresAt: timestamp("expires_at", {
      withTimezone: true,
    }).notNull(),

    lastSeenAt: timestamp("last_seen_at", {
      withTimezone: true,
    })
      .notNull()
      .defaultNow(),

    ipAddress: varchar("ip_address", {
      length: 64,
    }),

    userAgent: varchar("user_agent", {
      length: 1024,
    }),

    impersonatedByAdminId: uuid("impersonated_by_admin_id").references(
      () => adminUsers.id,
      {
        onDelete: "set null",
      },
    ),

    impersonationExpiresAt: timestamp("impersonation_expires_at", {
      withTimezone: true,
    }),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .notNull()
      .defaultNow(),

    revokedAt: timestamp("revoked_at", {
      withTimezone: true,
    }),
  },
  (table) => [
    index("sessions_user_id_idx").on(table.userId),
    index("sessions_expires_at_idx").on(table.expiresAt),
    index("sessions_impersonated_by_admin_id_idx").on(
      table.impersonatedByAdminId,
    ),
  ],
);