import { and, asc, eq } from "drizzle-orm";

import { db } from "../client.js";
import { automationExecutionSteps } from "../schema/automation-execution-steps.js";

export async function createAutomationExecutionStep(data: {
    executionId: string;
    stepId: string;
    status?: string;
    input?: Record<string, unknown> | null;
}) {
    const result = await db
        .insert(automationExecutionSteps)
        .values({
            executionId: data.executionId,
            stepId: data.stepId,
            status: data.status ?? "PENDING",
            input: data.input ?? null,
        })
        .returning();

    return result[0] ?? null;
}

export async function findAutomationExecutionStepById(
    executionStepId: string,
) {
    const result = await db
        .select()
        .from(automationExecutionSteps)
        .where(eq(automationExecutionSteps.id, executionStepId))
        .limit(1);

    return result[0] ?? null;
}

export async function findAutomationExecutionSteps(executionId: string) {
    return db
        .select()
        .from(automationExecutionSteps)
        .where(eq(automationExecutionSteps.executionId, executionId))
        .orderBy(asc(automationExecutionSteps.createdAt));
}

export async function findAutomationExecutionStep(
    executionId: string,
    stepId: string,
) {
    const result = await db
        .select()
        .from(automationExecutionSteps)
        .where(
            and(
                eq(automationExecutionSteps.executionId, executionId),
                eq(automationExecutionSteps.stepId, stepId),
            ),
        )
        .limit(1);

    return result[0] ?? null;
}

export async function updateAutomationExecutionStep(
    executionStepId: string,
    data: {
        status?: string;
        output?: Record<string, unknown> | null;
        errorMessage?: string | null;
        startedAt?: Date | null;
        completedAt?: Date | null;
    },
) {
    const result = await db
        .update(automationExecutionSteps)
        .set(data)
        .where(eq(automationExecutionSteps.id, executionStepId))
        .returning();

    return result[0] ?? null;
}