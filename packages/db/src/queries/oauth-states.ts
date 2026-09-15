import { and, eq, gt, isNull } from "drizzle-orm";

import { db } from "../client.js";
import { oauthStates } from "../schema/oauth-states.js";

export async function createOauthState(data: {
    userId: string;
    workspaceId: string;
    provider: string;
    stateHash: string;
    expiresAt: Date;
}) {
    const result = await db
        .insert(oauthStates)
        .values({
            userId: data.userId,
            workspaceId: data.workspaceId,
            provider: data.provider,
            stateHash: data.stateHash,
            expiresAt: data.expiresAt,
        })
        .returning();

    return result[0] ?? null;
}

export async function findValidOauthState(
    stateHash: string,
) {
    const result = await db
        .select()
        .from(oauthStates)
        .where(
            and(
                eq(oauthStates.stateHash, stateHash),
                isNull(oauthStates.usedAt),
                gt(oauthStates.expiresAt, new Date()),
            ),
        )
        .limit(1);

    return result[0] ?? null;
}

export async function markOauthStateUsed(
    id: string,
) {
    const result = await db
        .update(oauthStates)
        .set({
            usedAt: new Date(),
        })
        .where(
            and(
                eq(oauthStates.id, id),
                isNull(oauthStates.usedAt),
            ),
        )
        .returning();

    return result[0] ?? null;
}