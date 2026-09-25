import { and, eq } from "drizzle-orm";
import { db } from "../client.js";
import { platformAccounts } from "../schema/platform-accounts.js";
import { webhookEvents } from "../schema/webhook-events.js";
import { contacts } from "../schema/contacts.js";
import { contactIdentities } from "../schema/contact-identities.js";
import { conversations } from "../schema/conversations.js";
import { messages } from "../schema/messages.js";
import { resolveInstagramContact } from "./instagram.js";

export async function processInstagramMessageWebhook(data: {
    recipientId: string;
    senderId: string;
    messageId: string;
    text?: string | null;
    timestamp: number;
    payload: Record<string, unknown>;
    profile?: {
        name?: string | null;
        username?: string | null;
        profilePic?: string | null;
        isVerifiedUser?: boolean;
        followerCount?: number;
        isUserFollowBusiness?: boolean;
        isBusinessFollowUser?: boolean;
    } | null;
}) {
    return db.transaction(async (tx) => {
        const accounts = await tx.select()
            .from(platformAccounts)
            .where(and(
                eq(platformAccounts.platform, "INSTAGRAM"),
                eq(platformAccounts.externalAccountId, data.recipientId),
            ));

        if (accounts.length === 0) {
            throw new Error(
                `Instagram platform account not found: ${data.recipientId}`,
            );
        }

        if (accounts.length > 1) {
            throw new Error(
                `Multiple Instagram platform accounts found for external ID: ${data.recipientId}`,
            );
        }

        const account = accounts[0];

        const existingEvent = await tx.select()
            .from(webhookEvents)
            .where(and(
                eq(webhookEvents.platformAccountId, account.id),
                eq(webhookEvents.externalEventId, data.messageId),
            ))
            .limit(1);

        if (existingEvent[0]?.status === "PROCESSED") {
            return {
                duplicate: true,
                contactId: null,
                conversationId: null,
                messageId: null,
            };
        }

        const profile = data.profile;

        const { contact, identity } = await resolveInstagramContact({
            workspaceId: account.workspaceId,
            platformAccountId: account.id,
            externalUserId: data.senderId,
            profile,
        });

        let conversation = await tx.select()
            .from(conversations)
            .where(and(
                eq(conversations.platformAccountId, account.id),
                eq(conversations.contactId, contact.id),
            ))
            .limit(1)
            .then((result) => result[0] ?? null);

        const messageDate = new Date(data.timestamp);

        if (!conversation) {
            conversation = await tx.insert(conversations)
                .values({
                    workspaceId: account.workspaceId,
                    contactId: contact.id,
                    platformAccountId: account.id,
                    externalConversationId: data.senderId,
                    status: "OPEN",
                    unreadCount: 1,
                    lastMessageAt: messageDate,
                })
                .returning()
                .then((result) => result[0] ?? null);

            if (!conversation) {
                throw new Error("Failed to create Instagram conversation");
            }
        } else {
            conversation = await tx.update(conversations)
                .set({
                    unreadCount: conversation.unreadCount + 1,
                    lastMessageAt: messageDate,
                    updatedAt: new Date(),
                })
                .where(eq(conversations.id, conversation.id))
                .returning()
                .then((result) => result[0] ?? conversation);
        }

        const existingMessage = await tx.select()
            .from(messages)
            .where(and(
                eq(messages.conversationId, conversation.id),
                eq(messages.externalMessageId, data.messageId),
            ))
            .limit(1);

        let message = existingMessage[0] ?? null;

        if (!message) {
            message = await tx.insert(messages)
                .values({
                    conversationId: conversation.id,
                    senderContactId: contact.id,
                    direction: "INBOUND",
                    type: "TEXT",
                    content: data.text ?? null,
                    externalMessageId: data.messageId,
                    source: "PLATFORM",
                    metadata: {
                        senderId: data.senderId,
                        recipientId: data.recipientId,
                        timestamp: data.timestamp,
                    },
                    createdAt: messageDate,
                })
                .returning()
                .then((result) => result[0] ?? null);
        }

        if (!message) {
            throw new Error("Failed to create Instagram message");
        }

        let webhookEventId: string;

        if (existingEvent[0]) {
            webhookEventId = existingEvent[0].id;

            await tx.update(webhookEvents)
                .set({
                    status: "PROCESSED",
                    processedAt: new Date(),
                    errorMessage: null,
                    metadata: {
                        contactId: contact.id,
                        contactIdentityId: identity.id,
                        conversationId: conversation.id,
                        messageId: message.id,
                    },
                })
                .where(eq(webhookEvents.id, existingEvent[0].id));
        } else {
            const insertedEvent = await tx.insert(webhookEvents)
                .values({
                    workspaceId: account.workspaceId,
                    platformAccountId: account.id,
                    platform: "INSTAGRAM",
                    eventType: "MESSAGE",
                    externalEventId: data.messageId,
                    payload: data.payload,
                    status: "PROCESSED",
                    processedAt: new Date(),
                    metadata: {
                        contactId: contact.id,
                        contactIdentityId: identity.id,
                        conversationId: conversation.id,
                        messageId: message.id,
                    },
                })
                .returning();

            const webhookEvent = insertedEvent[0];

            if (!webhookEvent) {
                throw new Error("Failed to create Instagram webhook event");
            }

            webhookEventId = webhookEvent.id;
        }

        return {
            duplicate: false,
            webhookEventId,
            contactId: contact.id,
            contactIdentityId: identity.id,
            conversationId: conversation.id,
            messageId: message.id,
        };
    });
}

export async function processInstagramOutboundWebhook(data: {
    senderId: string;
    recipientId: string;
    messageId: string;
    text?: string | null;
    timestamp: number;
    payload: Record<string, unknown>;
}) {
    return db.transaction(async (tx) => {
        const accounts = await tx.select()
            .from(platformAccounts)
            .where(and(
                eq(platformAccounts.platform, "INSTAGRAM"),
                eq(platformAccounts.externalAccountId, data.senderId),
            ));

        if (accounts.length === 0) {
            throw new Error(
                `Instagram platform account not found: ${data.senderId}`,
            );
        }

        if (accounts.length > 1) {
            throw new Error(
                `Multiple Instagram platform accounts found for external ID: ${data.senderId}`,
            );
        }

        const account = accounts[0];

        const existingEvent = await tx.select()
            .from(webhookEvents)
            .where(and(
                eq(webhookEvents.platformAccountId, account.id),
                eq(webhookEvents.externalEventId, data.messageId),
            ))
            .limit(1);

        if (existingEvent[0]?.status === "PROCESSED") {
            return {
                duplicate: true,
                contactId: null,
                contactIdentityId: null,
                conversationId: null,
                messageId: null,
                platformAccountId: account.id,
            };
        }

        const identity = await tx.select()
            .from(contactIdentities)
            .where(and(
                eq(contactIdentities.platformAccountId, account.id),
                eq(contactIdentities.externalId, data.recipientId),
            ))
            .limit(1)
            .then((result) => result[0] ?? null);

        if (!identity) {
            throw new Error(
                `Contact identity not found: ${data.recipientId}`,
            );
        }

        const contact = await tx.select()
            .from(contacts)
            .where(eq(contacts.id, identity.contactId))
            .limit(1)
            .then((result) => result[0] ?? null);

        if (!contact) {
            throw new Error(
                `Contact not found for identity: ${identity.id}`,
            );
        }

        let conversation = await tx.select()
            .from(conversations)
            .where(and(
                eq(conversations.platformAccountId, account.id),
                eq(conversations.contactId, contact.id),
            ))
            .limit(1)
            .then((result) => result[0] ?? null);

        const messageDate = new Date(data.timestamp);

        if (!conversation) {
            conversation = await tx.insert(conversations)
                .values({
                    workspaceId: account.workspaceId,
                    contactId: contact.id,
                    platformAccountId: account.id,
                    externalConversationId: data.recipientId,
                    status: "OPEN",
                    unreadCount: 0,
                    lastMessageAt: messageDate,
                })
                .returning()
                .then((result) => result[0] ?? null);

            if (!conversation) {
                throw new Error(
                    "Failed to create Instagram conversation",
                );
            }
        } else {
            conversation = await tx.update(conversations)
                .set({
                    lastMessageAt: messageDate,
                    updatedAt: new Date(),
                })
                .where(eq(conversations.id, conversation.id))
                .returning()
                .then((result) => result[0] ?? conversation);
        }

        const existingMessage = await tx.select()
            .from(messages)
            .where(and(
                eq(messages.conversationId, conversation.id),
                eq(messages.externalMessageId, data.messageId),
            ))
            .limit(1);

        let message = existingMessage[0] ?? null;

        if (!message) {
            message = await tx.insert(messages)
                .values({
                    conversationId: conversation.id,
                    senderContactId: null,
                    senderUserId: null,
                    direction: "OUTBOUND",
                    type: "TEXT",
                    content: data.text ?? null,
                    externalMessageId: data.messageId,
                    source: "PLATFORM",
                    metadata: {
                        senderId: data.senderId,
                        recipientId: data.recipientId,
                        timestamp: data.timestamp,
                        isEcho: true,
                    },
                    createdAt: messageDate,
                })
                .returning()
                .then((result) => result[0] ?? null);
        }

        if (!message) {
            throw new Error(
                "Failed to create Instagram outbound message",
            );
        }

        if (existingEvent[0]) {
            await tx.update(webhookEvents)
                .set({
                    status: "PROCESSED",
                    processedAt: new Date(),
                    errorMessage: null,
                })
                .where(
                    eq(
                        webhookEvents.id,
                        existingEvent[0].id,
                    ),
                );
        } else {
            await tx.insert(webhookEvents)
                .values({
                    workspaceId: account.workspaceId,
                    platformAccountId: account.id,
                    platform: "INSTAGRAM",
                    eventType: "MESSAGE",
                    externalEventId: data.messageId,
                    payload: data.payload,
                    status: "PROCESSED",
                    processedAt: new Date(),
                });
        }

        return {
            duplicate: false,
            contactId: contact.id,
            contactIdentityId: identity.id,
            conversationId: conversation.id,
            messageId: message.id,
            platformAccountId: account.id,
        };
    });
}