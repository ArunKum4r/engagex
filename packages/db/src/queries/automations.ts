import { eq, and, ne } from "drizzle-orm";
import { db } from "../client.js";
import { automations } from "../schema/automations.js";
import { automationTriggers } from "../schema/automation-triggers.js";
import { automationSteps } from "../schema/automation-steps.js";
import { automationEdges } from "../schema/automation-edges.js";
import { validateAutomationGraph } from "./automation-graphs.js";
import { findPlatformAccountWithPlatform } from "./platform-accounts.js";
import { validateInstagramPlatformAccount } from "./instagram.js";
import { validateInstagramAutomationCapabilities } from "./automation-capabilities.js";

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

export async function findWorkspaceAutomations(
    workspaceId: string,
) {
    return db
        .select()
        .from(automations)
        .where(
            and(
                eq(automations.workspaceId, workspaceId),
                ne(automations.status, "ARCHIVED"),
            ),
        );
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

export async function deleteAutomation(
    automationId: string,
) {
    const result = await db
        .update(automations)
        .set({
            status: "ARCHIVED",
            updatedAt: new Date(),
        })
        .where(eq(automations.id, automationId))
        .returning();

    return result[0] ?? null;
}

export async function activateAutomation(automationId: string) {
    const automation = await db
        .select()
        .from(automations)
        .where(
            eq(
                automations.id,
                automationId,
            ),
        )
        .limit(1);

        
    const currentAutomation = automation[0];
    if (!currentAutomation) {
        return {
            success: false as const,
            errors: [
                "Automation not found.",
            ],
        };
    }

    const automationGraph = await findAutomationWithGraph(currentAutomation.id);
    if (!automationGraph) {
        return {
            success: false as const,
            errors: [
                "Automation graph could not be loaded.",
            ],
        };
    }

    const validation = await validateAutomationGraph(automationId);
    if (!validation.valid) {
        return {
            success: false as const,
            errors: validation.errors,
        };
    }

    if (!currentAutomation.platformAccountId) {
        return {
            success: false as const,
            errors: [
                "Automation must have a connected platform account.",
            ],
        };
    }

    const platformAccount =
        await findPlatformAccountWithPlatform(
            currentAutomation.workspaceId,
            currentAutomation.platformAccountId,
        );

    if (!platformAccount) {
        return {
            success: false as const,
            errors: [
                "Connected platform account was not found.",
            ],
        };
    }

    if (platformAccount.account.status !== "ACTIVE") {
        return {
            success: false as const,
            errors: [
                "Connected platform account is not active.",
            ],
        };
    }

    if (platformAccount.account.platform === "INSTAGRAM") {
        const errors = validateInstagramPlatformAccount(platformAccount.account);
        if (errors.length > 0) {
            return {
                success: false as const,
                errors,
            };
        }

        const trigger = automationGraph.triggers[0] ?? null;

        const capabilityErrors =
            validateInstagramAutomationCapabilities({
                trigger:
                    trigger
                        ? {
                            type:
                                trigger.type,
                        }
                        : null,
                steps:
                    automationGraph.steps.map(
                        (step) => ({
                            type: step.type,
                        }),
                    ),
            });

        if (
            capabilityErrors.length > 0
        ) {
            return {
                success: false as const,
                errors: capabilityErrors,
            };
        }
    }

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

    return {
        success: true as const,
        automation:
            result[0] ?? null,
    };
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