import { and, eq } from "drizzle-orm";

import { db } from "../client.js";
import { automationSteps } from "../schema/automation-steps.js";

export async function createAutomationStep(data: {
    automationId: string;
    type: string;
    position?: number;
    config?: Record<string, unknown>;
}) {
    const result = await db
        .insert(automationSteps)
        .values({
            automationId: data.automationId,
            type: data.type,
            position: data.position ?? 0,
            config: data.config ?? {},
        })
        .returning();

    return result[0] ?? null;
}

export async function findAutomationStep(
    automationId: string,
    stepId: string,
) {
    const result = await db
        .select()
        .from(automationSteps)
        .where(
            and(
                eq(
                    automationSteps.id,
                    stepId,
                ),
                eq(
                    automationSteps.automationId,
                    automationId,
                ),
            ),
        )
        .limit(1);

    return result[0] ?? null;
}

export async function updateAutomationStep(
    automationId: string,
    stepId: string,
    data: {
        type?: string;
        position?: number;
        config?: Record<string, unknown>;
    },
) {
    const result = await db
        .update(automationSteps)
        .set({
            ...data,
            updatedAt: new Date(),
        })
        .where(
            and(
                eq(
                    automationSteps.id,
                    stepId,
                ),
                eq(
                    automationSteps.automationId,
                    automationId,
                ),
            ),
        )
        .returning();

    return result[0] ?? null;
}

export async function deleteAutomationStep(
    automationId: string,
    stepId: string,
) {
    const result = await db
        .delete(automationSteps)
        .where(
            and(
                eq(
                    automationSteps.id,
                    stepId,
                ),
                eq(
                    automationSteps.automationId,
                    automationId,
                ),
            ),
        )
        .returning();

    return result[0] ?? null;
}