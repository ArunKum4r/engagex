import { and, eq } from "drizzle-orm";

import { db } from "../client.js";
import { comments } from "../schema/comments.js";

export async function processInstagramCommentWebhook(data: {
    workspaceId: string;
    platformAccountId: string;
    externalCommentId: string;
    externalUserId: string;
    username?: string | null;
    text?: string | null;
    mediaId?: string | null;
    mediaType?: string | null;
}) {
    const existing = await db
        .select()
        .from(comments)
        .where(
            and(
                eq(
                    comments.platformAccountId,
                    data.platformAccountId,
                ),
                eq(
                    comments.externalCommentId,
                    data.externalCommentId,
                ),
            ),
        )
        .limit(1);

    if (existing.length > 0) {
        return {
            duplicate: true,
            comment: existing[0],
        };
    }

    const inserted = await db
        .insert(comments)
        .values({
            workspaceId: data.workspaceId,
            platformAccountId: data.platformAccountId,
            externalCommentId: data.externalCommentId,
            externalUserId: data.externalUserId,
            username: data.username ?? null,
            text: data.text ?? null,
            mediaId: data.mediaId ?? null,
            mediaType: data.mediaType ?? null,
        })
        .returning();

    return {
        duplicate: false,
        comment: inserted[0],
    };
}