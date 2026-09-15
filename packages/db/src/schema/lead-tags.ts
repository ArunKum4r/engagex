import { pgTable, uuid, timestamp, index, unique } from "drizzle-orm/pg-core";
import { leads } from "./leads.js";
import { tags } from "./tags.js";

export const leadTags = pgTable("lead_tags", {
    id: uuid("id").defaultRandom().primaryKey(),
    leadId: uuid("lead_id").notNull().references(() => leads.id, { onDelete: "cascade" }),
    tagId: uuid("tag_id").notNull().references(() => tags.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    unique("lead_tags_lead_tag_unique").on(table.leadId, table.tagId),
    index("lead_tags_lead_id_idx").on(table.leadId),
    index("lead_tags_tag_id_idx").on(table.tagId),
  ],
);