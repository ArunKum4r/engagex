import { pgTable, uuid, timestamp, index, unique } from "drizzle-orm/pg-core";
import { contacts } from "./contacts.js";
import { tags } from "./tags.js";
export const contactTags = pgTable("contact_tags", {
    id: uuid("id").defaultRandom().primaryKey(),
    contactId: uuid("contact_id").notNull().references(() => contacts.id, { onDelete: "cascade" }),
    tagId: uuid("tag_id").notNull().references(() => tags.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
    unique("contact_tags_contact_tag_unique").on(table.contactId, table.tagId),
    index("contact_tags_contact_id_idx").on(table.contactId),
    index("contact_tags_tag_id_idx").on(table.tagId),
]);
