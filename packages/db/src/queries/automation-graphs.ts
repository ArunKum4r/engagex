import { eq } from "drizzle-orm";

import { db } from "../client.js";
import { automations } from "../schema/automations.js";
import { automationTriggers } from "../schema/automation-triggers.js";
import { automationSteps } from "../schema/automation-steps.js";
import { automationEdges } from "../schema/automation-edges.js";

interface SaveAutomationGraphData {
    trigger: {
        type: string;
        config?: Record<string, unknown>;
        entryStepId?: string | null;
    } | null;

    steps: Array<{
        id?: string;
        type: string;
        position?: number;
        canvasPosition?: {
            x: number;
            y: number;
        };
        config?: Record<string, unknown>;
    }>;

    edges: Array<{
        fromStepId: string;
        toStepId: string;
        branch?: string | null;
    }>;
}

export async function saveAutomationGraph(
    automationId: string,
    data: SaveAutomationGraphData,
) {
    return db.transaction(async (tx) => {
        const automation = await tx
            .select()
            .from(automations)
            .where(eq(automations.id, automationId))
            .limit(1);

        if (!automation[0]) {
            return null;
        }

        if (automation[0].status !== "DRAFT") {
            throw new Error("Only draft automations can be edited");
        }

        // Remove the existing graph
        await tx
            .delete(automationEdges)
            .where(eq(automationEdges.automationId, automationId));

        await tx
            .delete(automationTriggers)
            .where(eq(automationTriggers.automationId, automationId));

        await tx
            .delete(automationSteps)
            .where(eq(automationSteps.automationId, automationId));

        // Create steps first so we have their generated database IDs
        const stepIdMap = new Map<string, string>();

        for (const step of data.steps) {
            const [createdStep] = await tx
                .insert(automationSteps)
                .values({
                    automationId,
                    type: step.type,
                    position: step.position ?? 0,
                    config: step.config ?? {},
                    canvasPosition: step.canvasPosition ?? { x: 0, y: 0}
                })
                .returning({
                    id: automationSteps.id,
                });

            if (!createdStep) {
                throw new Error("Failed to create automation step");
            }

            if (step.id) {
                stepIdMap.set(step.id, createdStep.id);
            }
        }

        // Resolve the trigger's entry step using the temporary frontend ID
        let entryStepId: string | null = null;

        if (data.trigger?.entryStepId) {
            entryStepId =
                stepIdMap.get(data.trigger.entryStepId) ?? null;

            if (!entryStepId) {
                throw new Error(
                    "Automation trigger references an unknown entry step",
                );
            }
        }

        // Create trigger after steps exist
        if (data.trigger) {
            await tx
                .insert(automationTriggers)
                .values({
                    automationId,
                    type: data.trigger.type,
                    entryStepId,
                    config: data.trigger.config ?? {},
                });
        }

        // Create step-to-step edges
        const insertedEdges = new Set<string>();

        for (const edge of data.edges) {
            const fromStepId =
                stepIdMap.get(edge.fromStepId);

            const toStepId =
                stepIdMap.get(edge.toStepId);

            if (!fromStepId || !toStepId) {
                throw new Error(
                    "Automation edge references an unknown step",
                );
            }

            const edgeKey =
                `${fromStepId}:${toStepId}`;

            if (insertedEdges.has(edgeKey)) {
                continue;
            }

            insertedEdges.add(edgeKey);

            await tx
                .insert(automationEdges)
                .values({
                    automationId,
                    fromStepId,
                    toStepId,
                    branch:
                        edge.branch ?? null,
                });
        }

        await tx
            .update(automations)
            .set({
                updatedAt: new Date(),
            })
            .where(eq(automations.id, automationId));

        return true;
    });
}