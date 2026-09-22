import { and, eq } from "drizzle-orm";
import { db } from "../client.js";
import { platformAccounts } from "../schema/platform-accounts.js";
import { webhookEvents } from "../schema/webhook-events.js";
import { contacts } from "../schema/contacts.js";
import { contactIdentities } from "../schema/contact-identities.js";
import { conversations } from "../schema/conversations.js";
import { messages } from "../schema/messages.js";

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

        let identity = await tx.select()
            .from(contactIdentities)
            .where(and(
                eq(contactIdentities.platformAccountId, account.id),
                eq(contactIdentities.externalId, data.senderId),
            ))
            .limit(1)
            .then((result) => result[0] ?? null);

        let contact: any;

        if (identity) {
            contact = await tx.select()
                .from(contacts)
                .where(eq(contacts.id, identity.contactId))
                .limit(1)
                .then((result) => result[0] ?? null);

            if (!contact) {
                throw new Error(
                    `Contact not found for identity: ${identity.id}`,
                );
            }

            if (
                profile?.name ||
                profile?.profilePic
            ) {
                contact = await tx.update(contacts)
                    .set({
                        name: profile.name ?? contact.name,
                        avatarUrl: profile.profilePic ?? contact.avatarUrl,
                        updatedAt: new Date(),
                    })
                    .where(eq(contacts.id, contact.id))
                    .returning()
                    .then((result) => result[0] ?? contact);
            }

            identity = await tx.update(contactIdentities)
                .set({
                    username: profile?.username ?? identity.username,
                    displayName: profile?.name ?? identity.displayName,
                    metadata: {
                        ...(identity.metadata ?? {}),
                        ...(profile
                            ? {
                                isVerifiedUser: profile.isVerifiedUser,
                                followerCount: profile.followerCount,
                                isUserFollowBusiness:
                                    profile.isUserFollowBusiness,
                                isBusinessFollowUser:
                                    profile.isBusinessFollowUser,
                            }
                            : {}),
                    },
                    updatedAt: new Date(),
                })
                .where(eq(contactIdentities.id, identity.id))
                .returning()
                .then((result) => result[0] ?? identity);
        } else {
            contact = await tx.insert(contacts)
                .values({
                    workspaceId: account.workspaceId,
                    name: profile?.name ?? profile?.username ?? null,
                    avatarUrl: profile?.profilePic ?? null,
                })
                .returning()
                .then((result) => result[0] ?? null);

            if (!contact) {
                throw new Error("Failed to create Instagram contact");
            }

            identity = await tx.insert(contactIdentities)
                .values({
                    workspaceId: account.workspaceId,
                    contactId: contact.id,
                    platformAccountId: account.id,
                    externalId: data.senderId,
                    username: profile?.username ?? null,
                    displayName: profile?.name ?? null,
                    metadata: {
                        isVerifiedUser: profile?.isVerifiedUser ?? false,
                        followerCount: profile?.followerCount ?? null,
                        isUserFollowBusiness:
                            profile?.isUserFollowBusiness ?? null,
                        isBusinessFollowUser:
                            profile?.isBusinessFollowUser ?? null,
                    },
                })
                .returning()
                .then((result) => result[0] ?? null);

            if (!identity) {
                throw new Error(
                    "Failed to create Instagram contact identity",
                );
            }
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

        if (existingEvent[0]) {
            await tx.update(webhookEvents)
                .set({
                    status: "PROCESSED",
                    processedAt: new Date(),
                    errorMessage: null,
                })
                .where(eq(webhookEvents.id, existingEvent[0].id));
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
        };
    });
}