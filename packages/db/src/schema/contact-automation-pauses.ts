import {
    index,
    pgTable,
    timestamp,
    uuid,
    text,
    unique,
} from "drizzle-orm/pg-core";

import { automations } from "./automations.js";
import { contacts } from "./contacts.js";
import { users } from "./users.js";
import { workspaces } from "./workspaces.js";

export const contactAutomationPauses = pgTable(
    "contact_automation_pauses",
    {
        id: uuid("id").defaultRandom().primaryKey(),

        workspaceId: uuid("workspace_id")
            .notNull()
            .references(() => workspaces.id, {
                onDelete: "cascade",
            }),

        contactId: uuid("contact_id")
            .notNull()
            .references(() => contacts.id, {
                onDelete: "cascade",
            }),

        automationId: uuid("automation_id").references(
            () => automations.id,
            {
                onDelete: "cascade",
            },
        ),

        pausedByUserId: uuid("paused_by_user_id")
            .notNull()
            .references(() => users.id, {
                onDelete: "restrict",
            }),

        reason: text("reason"),

        pausedAt: timestamp("paused_at", {
            withTimezone: true,
        })
            .notNull()
            .defaultNow(),

        resumeAt: timestamp("resume_at", {
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
        index(
            "contact_automation_pauses_workspace_id_idx",
        ).on(table.workspaceId),

        index(
            "contact_automation_pauses_contact_id_idx",
        ).on(table.contactId),

        index(
            "contact_automation_pauses_automation_id_idx",
        ).on(table.automationId),

        index(
            "contact_automation_pauses_resume_at_idx",
        ).on(table.resumeAt),

        unique(
            "contact_automation_pauses_unique",
        ).on(
            table.contactId,
            table.automationId,
        ),
    ],
);