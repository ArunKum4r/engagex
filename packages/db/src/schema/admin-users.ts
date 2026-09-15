import {
  pgTable,
  uuid,
  varchar,
  boolean,
  timestamp,
} from "drizzle-orm/pg-core";

export const adminUsers = pgTable("admin_users", {
  id: uuid("id").defaultRandom().primaryKey(),

  email: varchar("email", { length: 255 })
    .notNull()
    .unique(),

  name: varchar("name", { length: 255 }).notNull(),

  status: varchar("status", { length: 32 })
    .notNull()
    .default("ACTIVE"),

  isActive: boolean("is_active")
    .notNull()
    .default(true),

  lastLoginAt: timestamp("last_login_at", {
    withTimezone: true,
  }),

  passwordHash: varchar("password_hash", {
    length: 255,
  }).notNull(),

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
});