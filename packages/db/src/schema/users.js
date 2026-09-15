import { pgTable, uuid, varchar, timestamp } from "drizzle-orm/pg-core";
export const users = pgTable("users", {
    id: uuid("id").defaultRandom().primaryKey(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    emailVerifiedAt: timestamp("email_verified_at", { withTimezone: true }),
    name: varchar("name", { length: 255 }).notNull(),
    avatarUrl: varchar("avatar_url", { length: 2048 }),
    status: varchar("status", { length: 32 }).notNull().default("ACTIVE"),
    passwordHash: varchar("password_hash", { length: 255 }),
    role: varchar("role", { length: 32 }).notNull().default("USER"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
});
