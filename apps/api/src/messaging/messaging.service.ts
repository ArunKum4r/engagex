import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import {
    findConversationById,
    updateConversationAfterOutboundMessage, createMessage, findWorkspacePlatformAccount, findContactIdentityByContact
} from "@engagex/db";
import { MessagingAdapterRegistry } from "./messaging.registry.js";
import type { SendMessageInput } from "./messaging.types.js";

@Injectable()
export class MessagingService {
    constructor(
        private readonly adapterRegistry: MessagingAdapterRegistry,
    ) {}

    async sendMessage(
        input: SendMessageInput,
    ) {
        const content = input.content.trim();

        if (!content) {
            throw new BadRequestException(
                "Message cannot be empty",
            );
        }

        const conversation =
            await findConversationById(
                input.workspaceId,
                input.conversationId,
            );

        if (!conversation) {
            throw new NotFoundException(
                "Conversation not found",
            );
        }

        const account =
            await findWorkspacePlatformAccount(
                input.workspaceId,
                conversation.platformAccountId,
            );

        if (!account) {
            throw new NotFoundException(
                "Platform account not found",
            );
        }

        if (!account.externalAccountId) {
            throw new BadRequestException(
                "Platform account ID is missing",
            );
        }

        const identity =
            await findContactIdentityByContact(
                conversation.platformAccountId,
                conversation.contactId,
            );

        if (!identity) {
            throw new NotFoundException(
                "Contact identity not found",
            );
        }

        const credentials =
            account.credentials &&
            typeof account.credentials === "object" &&
            !Array.isArray(account.credentials)
                ? account.credentials as Record<string, unknown>
                : {};

        const accessToken =
            typeof credentials.accessToken === "string"
                ? credentials.accessToken
                : null;

        if (!accessToken) {
            throw new BadRequestException(
                "Platform access token is missing",
            );
        }

        const adapter =
            this.adapterRegistry.get(
                account.platform,
            );

        const result =
            await adapter.sendMessage({
                accessToken,
                accountExternalId:
                    account.externalAccountId,
                recipientExternalId:
                    identity.externalId,
                type: input.type,
                content,
            });

        const createdAt = new Date();

        const message = await createMessage({
            conversationId:
                conversation.id,
            senderUserId: input.userId,
            direction: "OUTBOUND",
            type: input.type,
            content,
            externalMessageId:
                result.externalMessageId,
            source: "PLATFORM",
            metadata:
                result.metadata ?? {},
            createdAt,
        });

        await updateConversationAfterOutboundMessage(
            conversation.id,
            createdAt,
        );

        return message;
    }
}