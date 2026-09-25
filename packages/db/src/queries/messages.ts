import { and, eq } from "drizzle-orm";
import { db } from "../client.js";
import { messages } from "../schema/messages.js";

export async function findMessageById(messageId: string) {
    const result = await db.select()
        .from(messages)
        .where(eq(messages.id, messageId))
        .limit(1);

    return result[0] ?? null;
}

export async function findMessageByExternalId(
    conversationId: string,
    externalMessageId: string,
) {
    const result = await db.select()
        .from(messages)
        .where(and(
            eq(messages.conversationId, conversationId),
            eq(messages.externalMessageId, externalMessageId),
        ))
        .limit(1);

    return result[0] ?? null;
}

export async function createMessage(data: {
    conversationId: string;
    senderContactId?: string | null;
    direction: string;
    type?: string;
    content?: string | null;
    externalMessageId?: string | null;
    source?: string;
    metadata?: Record<string, unknown>;
    createdAt?: Date;
}) {
    const result = await db.insert(messages).values({
        conversationId: data.conversationId,
        senderContactId: data.senderContactId ?? null,
        direction: data.direction,
        type: data.type ?? "TEXT",
        content: data.content ?? null,
        externalMessageId: data.externalMessageId ?? null,
        source: data.source ?? "PLATFORM",
        metadata: data.metadata ?? {},
        createdAt: data.createdAt ?? new Date(),
    }).returning();

    return result[0] ?? null;
}