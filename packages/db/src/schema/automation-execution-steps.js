import { pgTable, uuid, varchar, jsonb, text, timestamp, index } from "drizzle-orm/pg-core";
import { automationExecutions } from "./automation-executions.js";
import { automationSteps } from "./automation-steps.js";
export const automationExecutionSteps = pgTable("automation_execution_steps", {
    id: uuid("id").defaultRandom().primaryKey(),
    executionId: uuid("execution_id").notNull().references(() => automationExecutions.id, { onDelete: "cascade" }),
    stepId: uuid("step_id").notNull().references(() => automationSteps.id, { onDelete: "restrict" }),
    status: varchar("status", { length: 32 }).notNull().default("PENDING"),
    input: jsonb("input"),
    output: jsonb("output"),
    errorMessage: text("error_message"),
    startedAt: timestamp("started_at", { withTimezone: true }),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
    index("automation_execution_steps_execution_id_idx").on(table.executionId),
    index("automation_execution_steps_step_id_idx").on(table.stepId),
    index("automation_execution_steps_status_idx").on(table.status),
]);
