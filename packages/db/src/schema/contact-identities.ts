import { pgTable, uuid, varchar, timestamp, index, unique, foreignKey, jsonb } from "drizzle-orm/pg-core";

import { contacts } from "./contacts.js";

import { platformAccounts } from "./platform-accounts.js";

export const contactIdentities = pgTable("contact_identities", {
    id: uuid("id").defaultRandom().primaryKey(),
    workspaceId: uuid("workspace_id").notNull(),
    contactId: uuid("contact_id").notNull(),
    platformAccountId: uuid("platform_account_id").notNull(),
    externalId: varchar("external_id", { length: 255 }).notNull(),
    username: varchar("username", { length: 255 }),
    displayName: varchar("display_name", { length: 255 }),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().notNull().default({}),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    unique("contact_identities_account_external_unique").on(table.platformAccountId, table.externalId),
    foreignKey({
      columns: [table.workspaceId, table.contactId],
      foreignColumns: [contacts.workspaceId, contacts.id],
      name: "contact_identities_workspace_contact_fk",
    }),
    foreignKey({
      columns: [table.workspaceId, table.platformAccountId],
      foreignColumns: [platformAccounts.workspaceId, platformAccounts.id],
      name: "contact_identities_workspace_platform_account_fk",
    }),
    index("contact_identities_workspace_id_idx").on(table.workspaceId),
    index("contact_identities_contact_id_idx").on(table.contactId),
    index("contact_identities_platform_account_id_idx").on(table.platformAccountId),
  ],
);