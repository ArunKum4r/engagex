import { pgTable, uuid, varchar, integer, timestamp, index } from "drizzle-orm/pg-core";

import { users } from "./users.js";

export const emailVerifications = pgTable("email_verifications", {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    codeHash: varchar("code_hash", { length: 255 }).notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    attempts: integer("attempts").notNull().default(0),
    verifiedAt: timestamp("verified_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, 
    (table) => [
        index("email_verifications_user_id_idx").on(table.userId),
        index("email_verifications_expires_at_idx").on(table.expiresAt),
    ],
);