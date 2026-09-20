import { and, eq } from "drizzle-orm";

import { db } from "../client.js";
import { automationExecutions } from "../schema/automation-executions.js";

export async function createAutomationExecution(data: {
    automationId: string;
    webhookEventId?: string | null;
    status?: string;
    input?: Record<string, unknown> | null;
}) {
    const result = await db
        .insert(automationExecutions)
        .values({
            automationId: data.automationId,
            webhookEventId: data.webhookEventId ?? null,
            status: data.status ?? "PENDING",
            input: data.input ?? null,
        })
        .returning();

    return result[0] ?? null;
}

export async function findAutomationExecutionById(executionId: string) {
    const result = await db
        .select()
        .from(automationExecutions)
        .where(eq(automationExecutions.id, executionId))
        .limit(1);

    return result[0] ?? null;
}

export async function findAutomationExecution(
    executionId: string,
    automationId: string,
) {
    const result = await db
        .select()
        .from(automationExecutions)
        .where(
            and(
                eq(automationExecutions.id, executionId),
                eq(automationExecutions.automationId, automationId),
            ),
        )
        .limit(1);

    return result[0] ?? null;
}

export async function updateAutomationExecution(
    executionId: string,
    data: {
        status?: string;
        output?: Record<string, unknown> | null;
        errorMessage?: string | null;
        startedAt?: Date | null;
        completedAt?: Date | null;
    },
) {
    const result = await db
        .update(automationExecutions)
        .set(data)
        .where(eq(automationExecutions.id, executionId))
        .returning();

    return result[0] ?? null;
}