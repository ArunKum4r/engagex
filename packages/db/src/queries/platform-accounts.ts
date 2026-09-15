import { eq, and } from "drizzle-orm";
import { db } from "../client.js";
import { platformAccounts } from "../schema/platform-accounts.js";

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