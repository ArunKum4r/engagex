import { pgTable, uuid, varchar, timestamp, unique, index } from "drizzle-orm/pg-core";
import { users } from "./users.js";
export const authAccounts = pgTable("auth_accounts", {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    provider: varchar("provider", { length: 32 }).notNull(),
    providerAccountId: varchar("provider_account_id", { length: 255 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
    unique("auth_accounts_provider_account_unique").on(table.provider, table.providerAccountId),
    index("auth_accounts_user_id_idx").on(table.userId),
]);
