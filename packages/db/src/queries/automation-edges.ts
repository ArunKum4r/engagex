import { and, eq } from "drizzle-orm";

import { db } from "../client.js";
import { automationEdges } from "../schema/automation-edges.js";

export async function createAutomationEdge(data: {
    automationId: string;
    fromStepId: string;
    toStepId: string;
    branch?: string;
}) {
    const result = await db
        .insert(automationEdges)
        .values({
            automationId: data.automationId,
            fromStepId: data.fromStepId,
            toStepId: data.toStepId,
            branch: data.branch,
        })
        .returning();

    return result[0] ?? null;
}

export async function findAutomationEdge(
    automationId: string,
    edgeId: string,
) {
    const result = await db
        .select()
        .from(automationEdges)
        .where(
            and(
                eq(
                    automationEdges.id,
                    edgeId,
                ),
                eq(
                    automationEdges.automationId,
                    automationId,
                ),
            ),
        )
        .limit(1);

    return result[0] ?? null;
}

export async function deleteAutomationEdge(
    automationId: string,
    edgeId: string,
) {
    const result = await db
        .delete(automationEdges)
        .where(
            and(
                eq(
                    automationEdges.id,
                    edgeId,
                ),
                eq(
                    automationEdges.automationId,
                    automationId,
                ),
            ),
        )
        .returning();

    return result[0] ?? null;
}