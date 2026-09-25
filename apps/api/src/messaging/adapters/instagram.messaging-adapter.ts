import {
    BadRequestException,
    Injectable,
} from "@nestjs/common";

import { InstagramApiClient } from "../../integrations/instagram/api/instagram-api.client.js";

import type {
    MessagingAdapter,
    MessagingAdapterInput,
} from "../messaging.types.js";

@Injectable()
export class InstagramMessagingAdapter
    implements MessagingAdapter
{
    readonly platform = "INSTAGRAM";

    constructor(
        private readonly instagramApiClient: InstagramApiClient,
    ) {}

    async sendMessage(
        input: MessagingAdapterInput,
    ) {
        if (input.type !== "TEXT") {
            throw new BadRequestException(
                "Instagram currently supports TEXT messages only",
            );
        }

        const content =
            input.content.trim();

        if (!content) {
            throw new BadRequestException(
                "Instagram message cannot be empty",
            );
        }

        const result =
            await this.instagramApiClient.sendMessage(
                input.accessToken,
                input.accountExternalId,
                input.recipientExternalId,
                content,
            );

        return {
            externalMessageId:
                typeof result?.message_id === "string"
                    ? result.message_id
                    : null,
            metadata: {
                response: result,
            },
        };
    }
}