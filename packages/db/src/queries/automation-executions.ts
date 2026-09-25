import { and, eq, gt, sql } from "drizzle-orm";
import { db } from "../client.js";
import { automationExecutions } from "../schema/automation-executions.js";

export async function createAutomationExecution(data: {
    workspaceId: string;
    automationId: string;
    webhookEventId?: string | null;
    contactId?: string | null;
    conversationId?: string | null;
    currentStepId?: string | null;
    status?: string;
    input?: Record<string, unknown> | null;
    resumeAt?: Date | null;
}) {
    const result = await db
        .insert(automationExecutions)
        .values({
            workspaceId: data.workspaceId,
            automationId: data.automationId,
            webhookEventId: data.webhookEventId ?? null,
            contactId: data.contactId ?? null,
            conversationId: data.conversationId ?? null,
            currentStepId: data.currentStepId ?? null,
            status: data.status ?? "PENDING",
            input: data.input ?? null,
            resumeAt: data.resumeAt ?? null,
        })
        .returning();

    return result[0] ?? null;
}

export async function createAutomationExecutionWithPolicyLock(
    data: {
        workspaceId: string;
        automationId: string;
        webhookEventId?: string | null;
        contactId?: string | null;
        conversationId?: string | null;
        currentStepId?: string | null;
        status?: string;
        input?: Record<string, unknown> | null;
        resumeAt?: Date | null;
    },
    options: {
        scope:
            | "CONTACT"
            | "CONVERSATION";
        since?: Date;
    },
) {
    const scopeId =
        options.scope === "CONTACT"
            ? data.contactId
            : data.conversationId;

    if (!scopeId) {
        const execution =
            await createAutomationExecution(data);

        return {
            created: true,
            execution,
        };
    }

    const lockKey =
        `automation-execution:${data.automationId}:${options.scope}:${scopeId}`;

    return db.transaction(async tx => {
        await tx.execute(
            sql`
                SELECT pg_advisory_xact_lock(
                    hashtext(${lockKey})
                )
            `,
        );

        const conditions = [
            eq(
                automationExecutions.automationId,
                data.automationId,
            ),
            options.scope === "CONTACT"
                ? eq(
                      automationExecutions.contactId,
                      scopeId,
                  )
                : eq(
                      automationExecutions.conversationId,
                      scopeId,
                  ),
            ...(options.since
                ? [
                      gt(
                          automationExecutions.createdAt,
                          options.since,
                      ),
                  ]
                : []),
        ];

        const existing =
            await tx
                .select()
                .from(automationExecutions)
                .where(and(...conditions))
                .limit(1);

        if (existing[0]) {
            return {
                created: false,
                execution: existing[0],
            };
        }

        const result =
            await tx
                .insert(automationExecutions)
                .values({
                    workspaceId:
                        data.workspaceId,
                    automationId:
                        data.automationId,
                    webhookEventId:
                        data.webhookEventId ??
                        null,
                    contactId:
                        data.contactId ?? null,
                    conversationId:
                        data.conversationId ??
                        null,
                    currentStepId:
                        data.currentStepId ??
                        null,
                    status:
                        data.status ??
                        "PENDING",
                    input:
                        data.input ?? null,
                    resumeAt:
                        data.resumeAt ?? null,
                })
                .returning();

        return {
            created: true,
            execution:
                result[0] ?? null,
        };
    });
}

export async function findAutomationExecutionById(
    executionId: string,
) {
    const result = await db
        .select()
        .from(automationExecutions)
        .where(
            eq(
                automationExecutions.id,
                executionId,
            ),
        )
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
                eq(
                    automationExecutions.id,
                    executionId,
                ),
                eq(
                    automationExecutions.automationId,
                    automationId,
                ),
            ),
        )
        .limit(1);

    return result[0] ?? null;
}

export async function updateAutomationExecution(
    executionId: string,
    data: {
        status?: string;
        currentStepId?: string | null;
        input?: Record<string, unknown> | null;
        output?: Record<string, unknown> | null;
        errorMessage?: string | null;
        resumeAt?: Date | null;
        startedAt?: Date | null;
        completedAt?: Date | null;
    },
) {
    const result = await db
        .update(automationExecutions)
        .set({
            ...data,
            updatedAt: new Date(),
        })
        .where(
            eq(
                automationExecutions.id,
                executionId,
            ),
        )
        .returning();

    return result[0] ?? null;
}

export async function findRecentAutomationExecution(
    automationId: string,
    options: {
        contactId?: string | null;
        conversationId?: string | null;
        since?: Date;
    },
) {
    const conditions = [
        eq(
            automationExecutions.automationId,
            automationId,
        ),
        ...(options.contactId
            ? [
                  eq(
                      automationExecutions.contactId,
                      options.contactId,
                  ),
              ]
            : []),
        ...(options.conversationId
            ? [
                  eq(
                      automationExecutions.conversationId,
                      options.conversationId,
                  ),
              ]
            : []),
        ...(options.since
            ? [
                  gt(
                      automationExecutions.createdAt,
                      options.since,
                  ),
              ]
            : []),
    ];

    const result = await db
        .select()
        .from(automationExecutions)
        .where(and(...conditions))
        .limit(1);

    return result[0] ?? null;
}