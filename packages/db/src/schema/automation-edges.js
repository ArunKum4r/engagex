import { pgTable, uuid, varchar, timestamp, index, unique, foreignKey } from "drizzle-orm/pg-core";
import { automations } from "./automations.js";
import { automationSteps } from "./automation-steps.js";
export const automationEdges = pgTable("automation_edges", {
    id: uuid("id").defaultRandom().primaryKey(),
    automationId: uuid("automation_id").notNull().references(() => automations.id, { onDelete: "cascade" }),
    fromStepId: uuid("from_step_id").notNull(),
    toStepId: uuid("to_step_id").notNull(),
    branch: varchar("branch", { length: 32 }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
    unique("automation_edges_from_to_unique").on(table.fromStepId, table.toStepId),
    foreignKey({
        columns: [table.automationId, table.fromStepId],
        foreignColumns: [automationSteps.automationId, automationSteps.id],
        name: "automation_edges_from_step_fk",
    }),
    foreignKey({
        columns: [table.automationId, table.toStepId],
        foreignColumns: [automationSteps.automationId, automationSteps.id],
        name: "automation_edges_to_step_fk",
    }),
    index("automation_edges_automation_id_idx").on(table.automationId),
    index("automation_edges_from_step_id_idx").on(table.fromStepId),
    index("automation_edges_to_step_id_idx").on(table.toStepId),
]);
