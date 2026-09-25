import { and, eq } from "drizzle-orm";

import { db } from "../client.js";
import { comments } from "../schema/comments.js";
import { resolveInstagramContact } from "./instagram.js";
import { webhookEvents } from "../schema/webhook-events.js";

export async function processInstagramCommentWebhook(data: {
    workspaceId: string;
    platformAccountId: string;
    externalCommentId: string;
    externalUserId: string;
    username?: string | null;
    text?: string | null;
    mediaId?: string | null;
    mediaType?: string | null;
    payload: Record<string, unknown>;
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

    const { contact, identity } = await resolveInstagramContact({
        workspaceId: data.workspaceId,
        platformAccountId: data.platformAccountId,
        externalUserId: data.externalUserId,
        profile: {
            username: data.username ?? null,
        },
    });

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

    const insertedEvent = await db
        .insert(webhookEvents)
        .values({
            workspaceId: data.workspaceId,
            platformAccountId: data.platformAccountId,
            platform: "INSTAGRAM",
            eventType: "COMMENT",
            externalEventId: data.externalCommentId,
            payload: data.payload,
            status: "PROCESSED",
            processedAt: new Date(),
            metadata: {
                contactId: contact.id,
                contactIdentityId: identity.id,
                commentId: inserted[0]?.id ?? null,
            },
        })
        .returning();

    const webhookEvent = insertedEvent[0];

    if (!webhookEvent) {
        throw new Error("Failed to create Instagram comment webhook event");
    }

    return {
        duplicate: false,
        webhookEventId: webhookEvent.id,
        comment: inserted[0],
        contactId: contact.id,
        contactIdentityId: identity.id,
    };
}