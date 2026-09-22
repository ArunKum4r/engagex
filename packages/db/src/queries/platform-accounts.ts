import { eq, and, inArray } from "drizzle-orm";
import { db } from "../client.js";
import { platformAccounts } from "../schema/platform-accounts.js";
import { platforms } from "../schema/platforms.js";
import { contactIdentities } from "../schema/contact-identities.js";
import { conversations } from "../schema/conversations.js";
import { webhookEvents } from "../schema/webhook-events.js";
import { automations } from "../schema/automations.js";
import { automationExecutions } from "../schema/automation-executions.js";

export async function createPlatformAccount(data: {
    workspaceId: string;
    platform: string;
    externalAccountId: string;
    name?: string;
    username?: string;
    status?: string;
    credentials?: Record<string, unknown>;
    metadata?: Record<string, unknown>;
}) {
    const result = await db.insert(platformAccounts)
        .values({
            workspaceId: data.workspaceId,
            platform: data.platform,
            externalAccountId: data.externalAccountId,
            name: data.name,
            username: data.username,
            status: data.status ?? "ACTIVE",
            credentials: data.credentials ?? {},
            metadata: data.metadata ?? {},
        })
        .returning();

    return result[0] ?? null;
}

export async function findWorkspacePlatformAccounts(workspaceId: string) {
    const result = await db
        .select()
        .from(platformAccounts)
        .where(
            eq(
                platformAccounts.workspaceId,
                workspaceId,
            ),
        );

    return result;
}

export async function findPlatformAccountById(platformAccountId: string) {
    const result = await db
        .select()
        .from(platformAccounts)
        .where(
            eq(
                platformAccounts.id,
                platformAccountId,
            ),
        )
        .limit(1);

    return result[0] ?? null;
}

export async function findWorkspacePlatformAccount(workspaceId: string, platformAccountId: string) {
    const result = await db
        .select()
        .from(platformAccounts)
        .where(
            and(
                eq(
                    platformAccounts.workspaceId,
                    workspaceId,
                ),
                eq(
                    platformAccounts.id,
                    platformAccountId,
                ),
            ),
        )
        .limit(1);

    return result[0] ?? null;
}

export async function findPlatformAccountByExternalId(workspaceId: string, platform: string, externalAccountId: string) {
    const result = await db
        .select()
        .from(platformAccounts)
        .where(
            and(
                eq(
                    platformAccounts.workspaceId,
                    workspaceId,
                ),
                eq(
                    platformAccounts.platform,
                    platform,
                ),
                eq(
                    platformAccounts.externalAccountId,
                    externalAccountId,
                ),
            ),
        )
        .limit(1);

    return result[0] ?? null;
}

export async function updatePlatformAccount(
    platformAccountId: string,
    data: {
        name?: string;
        username?: string;
        status?: string;
        credentials?: Record<string, unknown>;
        metadata?: Record<string, unknown>;
    },
) {
    const result = await db
        .update(platformAccounts)
        .set({
            ...data,
            updatedAt: new Date(),
        })
        .where(
            eq(
                platformAccounts.id,
                platformAccountId,
            ),
        )
        .returning();

    return result[0] ?? null;
}

export async function deletePlatformAccount(platformAccountId: string) {
    const result = await db
        .delete(platformAccounts)
        .where(
            eq(
                platformAccounts.id,
                platformAccountId,
            ),
        )
        .returning();

    return result[0] ?? null;
}

export async function findPlatformAccountWithPlatform(workspaceId: string, platformAccountId: string) {
    const result = await db
        .select({
            account: platformAccounts,
            platform: platforms,
        })
        .from(platformAccounts)
        .leftJoin(
            platforms,
            eq(platformAccounts.platformId, platforms.id),
        )
        .where(and(
            eq(platformAccounts.workspaceId, workspaceId),
            eq(platformAccounts.id, platformAccountId),
        ))
        .limit(1);

    return result[0] ?? null;
}

export async function deletePlatformAccountWithData(
    workspaceId: string,
    platformAccountId: string,
) {
    return db.transaction(async (tx) => {
        const accountResult = await tx
            .select()
            .from(platformAccounts)
            .where(
                and(
                    eq(platformAccounts.id, platformAccountId),
                    eq(platformAccounts.workspaceId, workspaceId),
                ),
            )
            .limit(1);

        const account = accountResult[0] ?? null;

        if (!account) {
            return null;
        }

        const accountAutomations = await tx
            .select({
                id: automations.id,
            })
            .from(automations)
            .where(
                and(
                    eq(
                        automations.workspaceId,
                        workspaceId,
                    ),
                    eq(
                        automations.platformAccountId,
                        platformAccountId,
                    ),
                ),
            );

        const automationIds = accountAutomations.map(
            (automation) => automation.id,
        );

        if (automationIds.length > 0) {
            await tx
                .delete(automationExecutions)
                .where(
                    inArray(
                        automationExecutions.automationId,
                        automationIds,
                    ),
                );

            await tx
                .delete(automations)
                .where(
                    inArray(
                        automations.id,
                        automationIds,
                    ),
                );
        }

        await tx
            .delete(contactIdentities)
            .where(
                eq(
                    contactIdentities.platformAccountId,
                    platformAccountId,
                ),
            );

        await tx
            .delete(conversations)
            .where(
                eq(
                    conversations.platformAccountId,
                    platformAccountId,
                ),
            );

        await tx
            .delete(webhookEvents)
            .where(
                eq(
                    webhookEvents.platformAccountId,
                    platformAccountId,
                ),
            );

        const deleted = await tx
            .delete(platformAccounts)
            .where(
                and(
                    eq(platformAccounts.id, platformAccountId),
                    eq(platformAccounts.workspaceId, workspaceId),
                ),
            )
            .returning();

        return deleted[0] ?? null;
    });
}

export async function findPlatformAccountsByExternalId(
    platform: string,
    externalAccountId: string,
) {
    return db.select()
        .from(platformAccounts)
        .where(and(
            eq(platformAccounts.platform, platform),
            eq(platformAccounts.externalAccountId, externalAccountId),
        ));
}