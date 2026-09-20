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

export async function validateAutomationGraph(
    automationId: string,
) {
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

    const errors: string[] = [];

    if (triggers.length === 0) {
        errors.push(
            "Automation must have a trigger.",
        );
    }

    if (triggers.length > 1) {
        errors.push(
            "Automation can only have one trigger.",
        );
    }

    const trigger = triggers[0];

    if (
        trigger &&
        !trigger.entryStepId
    ) {
        errors.push(
            "Trigger must have an entry step.",
        );
    }

    if (steps.length === 0) {
        errors.push(
            "Automation must have at least one step.",
        );
    }

    const stepIds = new Set(
        steps.map(
            (step) => step.id,
        ),
    );

    if (
        trigger?.entryStepId &&
        !stepIds.has(
            trigger.entryStepId,
        )
    ) {
        errors.push(
            "Trigger entry step does not exist.",
        );
    }

    const incomingEdges = new Map<
        string,
        typeof edges
    >();

    for (const edge of edges) {
        if (
            !stepIds.has(
                edge.fromStepId,
            )
        ) {
            errors.push(
                `Edge references missing source step: ${edge.fromStepId}.`,
            );
        }

        if (
            !stepIds.has(
                edge.toStepId,
            )
        ) {
            errors.push(
                `Edge references missing target step: ${edge.toStepId}.`,
            );
        }

        const incoming =
            incomingEdges.get(
                edge.toStepId,
            ) ?? [];

        incoming.push(edge);

        incomingEdges.set(
            edge.toStepId,
            incoming,
        );
    }

    for (const step of steps) {
        if (
            step.id ===
            trigger?.entryStepId
        ) {
            continue;
        }

        const incoming =
            incomingEdges.get(
                step.id,
            ) ?? [];

        if (incoming.length === 0) {
            errors.push(
                `Step "${step.type}" (${step.id}) has no incoming connection.`,
            );
        }
    }

    const conditionTypes = new Set([
        "KEYWORD_MATCH",
        "FOLLOWER_STATUS",
        "LAST_INTERACTION",
        "LAST_SEEN",
        "FOLLOWER_COUNT",
        "USERNAME",
        "OPTED_IN",
        "VERIFIED",
        "WE_FOLLOW_USER",
        "CONTACT_NAME",
        "CONTACT_STATUS",
        "CONTACT_TAG",
    ]);

    for (const step of steps) {
        const outgoing = edges.filter(
            (edge) =>
                edge.fromStepId ===
                step.id,
        );

        if (
            conditionTypes.has(
                step.type,
            )
        ) {
            const branches =
                new Set(
                    outgoing
                        .map(
                            (edge) =>
                                edge.branch,
                        )
                        .filter(
                            (
                                branch,
                            ): branch is string =>
                                Boolean(
                                    branch,
                                ),
                        ),
                );

            if (
                !branches.has(
                    "YES",
                )
            ) {
                errors.push(
                    `Condition step "${step.id}" is missing a YES branch.`,
                );
            }

            if (
                !branches.has(
                    "NO",
                )
            ) {
                errors.push(
                    `Condition step "${step.id}" is missing a NO branch.`,
                );
            }
        }

        if (step.type === "RANDOMIZER") {
            const config =
                step.config &&
                typeof step.config === "object" &&
                !Array.isArray(step.config)
                    ? (
                        step.config as Record<
                            string,
                            unknown
                        >
                    )
                    : {};

            const pathCount =
                typeof config.paths === "number"
                    ? Math.min(
                        5,
                        Math.max(
                            2,
                            config.paths,
                        ),
                    )
                    : 2;

            if (pathCount < 2) {
                errors.push(
                    `Randomizer step "${step.id}" must have at least 2 paths.`,
                );
            }

            if (pathCount > 5) {
                errors.push(
                    `Randomizer step "${step.id}" cannot have more than 5 paths.`,
                );
            }

            const branches =
                new Set(
                    outgoing
                        .map(
                            (edge) =>
                                edge.branch,
                        )
                        .filter(
                            (
                                branch,
                            ): branch is string =>
                                Boolean(branch),
                        ),
                );

            for (
                let index = 0;
                index < pathCount;
                index += 1
            ) {
                const branch =
                    `PATH_${index + 1}`;

                if (!branches.has(branch)) {
                    errors.push(
                        `Randomizer step "${step.id}" is missing ${branch}.`,
                    );
                }
            }
        }
    }

    return {
        valid:
            errors.length === 0,
        errors,
    };
}