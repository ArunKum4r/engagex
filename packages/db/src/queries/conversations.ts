import { and, asc, desc, eq, inArray, sql } from "drizzle-orm";

import { db } from "../client.js";
import { conversations } from "../schema/conversations.js";
import { messages } from "../schema/messages.js";
import { contacts } from "../schema/contacts.js";

export async function findConversation(
    workspaceId: string,
    platformAccountId: string,
    contactId: string,
) {
    const result = await db.select()
        .from(conversations)
        .where(and(
            eq(conversations.workspaceId, workspaceId),
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
        externalConversationId:
            data.externalConversationId ?? null,
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
            unreadCount:
                conversation[0].unreadCount + 1,
            lastMessageAt,
            updatedAt: new Date(),
        })
        .where(eq(conversations.id, conversationId))
        .returning();

    return result[0] ?? null;
}

export async function findConversationsByContact(
    workspaceId: string,
    contactId: string,
) {
    return db.select()
        .from(conversations)
        .where(and(
            eq(conversations.workspaceId, workspaceId),
            eq(conversations.contactId, contactId),
        ))
        .orderBy(
            desc(conversations.lastMessageAt),
        );
}

export async function findConversationMessages(
    conversationId: string,
    limit = 50,
) {
    const result = await db.select()
        .from(messages)
        .where(
            eq(messages.conversationId, conversationId),
        )
        .orderBy(desc(messages.createdAt))
        .limit(limit);

    return result.reverse();
}

export async function findConversationById(
    workspaceId: string,
    conversationId: string,
) {
    const result = await db.select()
        .from(conversations)
        .where(and(
            eq(conversations.workspaceId, workspaceId),
            eq(conversations.id, conversationId),
        ))
        .limit(1);

    return result[0] ?? null;
}

export async function updateConversationAfterOutboundMessage(
    conversationId: string,
    lastMessageAt: Date,
) {
    const result = await db.update(conversations)
        .set({
            lastMessageAt,
            updatedAt: new Date(),
        })
        .where(eq(conversations.id, conversationId))
        .returning();

    return result[0] ?? null;
}

export async function listConversations(
    workspaceId: string,
    options: {
        page?: number;
        limit?: number;
        status?: string;
    } = {},
) {
    const page = Math.max(options.page ?? 1, 1);
    const limit = Math.min(
        Math.max(options.limit ?? 20, 1),
        100,
    );
    const offset = (page - 1) * limit;

    const conditions = [
        eq(conversations.workspaceId, workspaceId),
    ];

    if (options.status) {
        conditions.push(
            eq(conversations.status, options.status),
        );
    }

    const [items, countResult] =
        await Promise.all([
            db.select()
                .from(conversations)
                .where(and(...conditions))
                .orderBy(
                    desc(conversations.lastMessageAt),
                )
                .limit(limit)
                .offset(offset),

            db.select({
                count: sql<number>`count(*)`,
            })
                .from(conversations)
                .where(and(...conditions)),
        ]);

    const contactIds = [
        ...new Set(
            items.map(
                (conversation) =>
                    conversation.contactId,
            ),
        ),
    ];

    const contactRows = contactIds.length
        ? await db.select()
            .from(contacts)
            .where(
                inArray(
                    contacts.id,
                    contactIds,
                ),
            )
        : [];

    const contactsById = new Map(
        contactRows.map((contact) => [
            contact.id,
            contact,
        ]),
    );

    const conversationsWithContacts =
        items.map((conversation) => ({
            ...conversation,
            contact:
                contactsById.get(
                    conversation.contactId,
                ) ?? null,
        }));

    const total = Number(
        countResult[0]?.count ?? 0,
    );

    return {
        items: conversationsWithContacts,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(
                total / limit,
            ),
        },
    };
}

export async function getConversationById(
    workspaceId: string,
    conversationId: string,
) {
    const conversationRows = await db.select()
        .from(conversations)
        .where(
            and(
                eq(conversations.id, conversationId),
                eq(conversations.workspaceId, workspaceId),
            ),
        )
        .limit(1);

    const conversation = conversationRows[0];

    if (!conversation) {
        return null;
    }

    const contactRows = await db.select()
        .from(contacts)
        .where(
            eq(
                contacts.id,
                conversation.contactId,
            ),
        )
        .limit(1);

    const messageRows = await db.select()
        .from(messages)
        .where(
            eq(
                messages.conversationId,
                conversation.id,
            ),
        )
        .orderBy(
            asc(messages.createdAt),
        );

    return {
        ...conversation,
        contact: contactRows[0] ?? null,
        messages: messageRows,
    };
}