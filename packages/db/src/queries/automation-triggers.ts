import { and, eq } from "drizzle-orm";

import { db } from "../client.js";
import { automationTriggers } from "../schema/automation-triggers.js";
import { automations } from "../schema/automations.js";

export async function createAutomationTrigger(data: {
    automationId: string;
    type: string;
    entryStepId?: string | null;
    config?: Record<string, unknown>;
}) {
    const result = await db
        .insert(automationTriggers)
        .values({
            automationId: data.automationId,
            type: data.type,
            entryStepId: data.entryStepId ?? null,
            config: data.config ?? {},
        })
        .returning();

    return result[0] ?? null;
}

export async function findAutomationTrigger(
    automationId: string,
    triggerId: string,
) {
    const result = await db
        .select()
        .from(automationTriggers)
        .where(
            and(
                eq(automationTriggers.id, triggerId),
                eq(automationTriggers.automationId, automationId),
            ),
        )
        .limit(1);

    return result[0] ?? null;
}

export async function updateAutomationTrigger(
    automationId: string,
    triggerId: string,
    data: {
        type?: string;
        entryStepId?: string | null;
        config?: Record<string, unknown>;
    },
) {
    const result = await db
        .update(automationTriggers)
        .set({
            ...data,
            updatedAt: new Date(),
        })
        .where(
            and(
                eq(automationTriggers.id, triggerId),
                eq(automationTriggers.automationId, automationId),
            ),
        )
        .returning();

    return result[0] ?? null;
}

export async function deleteAutomationTrigger(
    automationId: string,
    triggerId: string,
) {
    const result = await db
        .delete(automationTriggers)
        .where(
            and(
                eq(automationTriggers.id, triggerId),
                eq(automationTriggers.automationId, automationId),
            ),
        )
        .returning();

    return result[0] ?? null;
}

export async function findActiveAutomationTriggers(
    platformAccountId: string,
) {
    return db
        .select({
            automation: automations,
            trigger: automationTriggers,
        })
        .from(automationTriggers)
        .innerJoin(
            automations,
            eq(
                automationTriggers.automationId,
                automations.id,
            ),
        )
        .where(
            and(
                eq(
                    automations.platformAccountId,
                    platformAccountId,
                ),
                eq(automations.status, "ACTIVE"),
            ),
        );
}