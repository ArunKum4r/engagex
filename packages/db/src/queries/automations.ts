import { eq, and } from "drizzle-orm";
import { db } from "../client.js";
import { automations } from "../schema/automations.js";
import { automationTriggers } from "../schema/automation-triggers.js";
import { automationSteps } from "../schema/automation-steps.js";
import { automationEdges } from "../schema/automation-edges.js";

export async function createAutomation(data: {
    workspaceId: string;
    platformAccountId?: string;
    createdByUserId: string;
    name: string;
    description?: string;
}) {
    const result = await db
        .insert(automations)
        .values({
            workspaceId: data.workspaceId,
            platformAccountId: data.platformAccountId,
            createdByUserId: data.createdByUserId,
            name: data.name,
            description: data.description,
        })
        .returning();

    return result[0] ?? null;
}

export async function findWorkspaceAutomations(workspaceId: string) {
    const result = await db
        .select()
        .from(automations)
        .where(
            eq(
                automations.workspaceId,
                workspaceId,
            ),
        );

    return result;
}

export async function findAutomationById(automationId: string) {
    const result = await db
        .select()
        .from(automations)
        .where(
            eq(
                automations.id,
                automationId,
            ),
        )
        .limit(1);

    return result[0] ?? null;
}

export async function findAutomationWithGraph(automationId: string) {
    const automation = await findAutomationById(automationId);
    if (!automation) {
        return null;
    }

    const triggers = await db
        .select()
        .from(automationTriggers)
        .where(
            eq(
                automationTriggers.automationId,
                automationId,
            ),
        );

    const steps = await db
        .select()
        .from(automationSteps)
        .where(
            eq(
                automationSteps.automationId,
                automationId,
            ),
        );

    const edges = await db
        .select()
        .from(automationEdges)
        .where(
            eq(
                automationEdges.automationId,
                automationId,
            ),
        );

    return { automation, triggers, steps, edges };
}

export async function updateAutomation(
    automationId: string,
    data: {
        name?: string;
        description?: string;
        platformAccountId?: string;
    },
) {
    const result = await db
        .update(automations)
        .set({
            ...data,
            updatedAt: new Date(),
        })
        .where(
            eq(
                automations.id,
                automationId,
            ),
        )
        .returning();

    return result[0] ?? null;
}

export async function deleteAutomation(automationId: string) {
    const result = await db
        .delete(automations)
        .where(
            eq(
                automations.id,
                automationId,
            ),
        )
        .returning();

    return result[0] ?? null;
}

export async function activateAutomation(automationId: string) {
    const result = await db
        .update(automations)
        .set({
            status: "ACTIVE",
            updatedAt: new Date(),
        })
        .where(
            eq(
                automations.id,
                automationId,
            ),
        )
        .returning();

    return result[0] ?? null;
}

export async function pauseAutomation(automationId: string) {
    const result = await db
        .update(automations)
        .set({
            status: "PAUSED",
            updatedAt: new Date(),
        })
        .where(
            eq(
                automations.id,
                automationId,
            ),
        )
        .returning();

    return result[0] ?? null;
}