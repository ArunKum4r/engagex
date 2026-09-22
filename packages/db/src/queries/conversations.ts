import { and, eq } from "drizzle-orm";
import { db } from "../client.js";
import { conversations } from "../schema/conversations.js";

export async function findConversation(
    platformAccountId: string,
    contactId: string,
) {
    const result = await db.select()
        .from(conversations)
        .where(and(
            eq(conversations.platformAccountId, platformAccountId),
            eq(conversations.contactId, contactId),
        ))
        .limit(1);

    return result[0] ?? null;
}

export async function createConversation(data: {
    workspaceId: string;
    contactId: string;
    platformAccountId: string;
    externalConversationId?: string | null;
}) {
    const result = await db.insert(conversations).values({
        workspaceId: data.workspaceId,
        contactId: data.contactId,
        platformAccountId: data.platformAccountId,
        externalConversationId: data.externalConversationId ?? null,
        status: "OPEN",
        unreadCount: 1,
        lastMessageAt: new Date(),
    }).returning();

    return result[0] ?? null;
}

export async function incrementConversationUnread(
    conversationId: string,
    lastMessageAt: Date,
) {
    const conversation = await db.select({
        unreadCount: conversations.unreadCount,
    })
        .from(conversations)
        .where(eq(conversations.id, conversationId))
        .limit(1);

    if (!conversation[0]) {
        return null;
    }

    const result = await db.update(conversations)
        .set({
            unreadCount: conversation[0].unreadCount + 1,
            lastMessageAt,
            updatedAt: new Date(),
        })
        .where(eq(conversations.id, conversationId))
        .returning();

    return result[0] ?? null;
}