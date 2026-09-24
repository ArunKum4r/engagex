import {
    Controller,
    Get,
    Post,
    Query,
    Req,
    Res,
} from "@nestjs/common";

import type { Request, Response } from "express";

import {
    processInstagramMessageWebhook,
} from "@engagex/db";
import { InstagramService } from "./instagram.service.js";
import { AutomationExecutionService } from "../../automations/execution/automation-execution.service.js";

@Controller("integrations/instagram/webhook")
export class InstagramWebhookController {
    constructor(
        private readonly instagramService: InstagramService,
        private readonly automationExecutionService: AutomationExecutionService
    ) {}
    @Get()
    verify(
        @Query("hub.mode") mode: string,
        @Query("hub.verify_token") verifyToken: string,
        @Query("hub.challenge") challenge: string,
        @Res() response: Response,
    ) {
        const expectedToken =
            process.env.META_WEBHOOK_VERIFY_TOKEN;

        if (
            mode !== "subscribe" ||
            !expectedToken ||
            verifyToken !== expectedToken
        ) {
            return response
                .status(403)
                .send("Forbidden");
        }

        return response
            .status(200)
            .send(challenge);
    }

    @Post()
    async receive(
        @Req() request: Request,
        @Res() response: Response,
    ) {
        const body = request.body as {
            entry?: Array<{
                id?: string;
                time?: number | string;
                messaging?: Array<{
                    sender?: {
                        id?: string;
                    };
                    recipient?: {
                        id?: string;
                    };
                    timestamp?: number | string;
                    message?: {
                        mid?: string;
                        text?: string;
                        is_echo?: boolean;
                        reply_to?: {
                            story?: {
                                id?: string;
                                url?: string;
                            };
                        };
                    };
                }>;
                changes?: Array<{
                    field?: string;
                    value?: {
                        from?: {
                            id?: string;
                            username?: string;
                        };
                        id?: string;
                        text?: string;
                        media?: {
                            id?: string;
                            media_product_type?: string;
                        };
                    };
                }>;
            }>;
        };

        console.log(
            "Instagram webhook received:",
            JSON.stringify(body, null, 2),
        );

        for (const entry of body.entry ?? []) {
            for (const messaging of entry.messaging ?? []) {
                const senderId = messaging.sender?.id;
                const recipientId = messaging.recipient?.id;
                const messageId = messaging.message?.mid;
                const storyReply =
                    messaging.message?.reply_to?.story;

                const isEcho =
                    messaging.message?.is_echo === true;

                const eventType = storyReply
                    ? "INSTAGRAM_STORY_REPLY"
                    : "INSTAGRAM_DM";

                if (!senderId || !recipientId || !messageId) {
                    continue;
                }

                const result =
                    await this.instagramService.processWebhookMessage({
                        senderId,
                        recipientId,
                        messageId,
                        text: messaging.message?.text ?? null,
                        timestamp: Number(messaging.timestamp),
                        payload: body as Record<string, unknown>,
                        isEcho,
                    });

                console.log(
                    "Instagram message processed:",
                    result,
                );

                if (!result.duplicate && !isEcho) {
                    await this.automationExecutionService.executeFromTrigger(
                        result.platformAccountId,
                        {
                            recipientId: senderId,
                            senderId,
                            message: messaging.message?.text ?? "",
                            contactId: result.contactId,
                            contactIdentityId:
                                result.contactIdentityId,
                            conversationId:
                                result.conversationId,
                            messageId: result.messageId,
                            storyId: storyReply?.id ?? null,
                            storyUrl: storyReply?.url ?? null,
                        },
                        false,
                        eventType,
                    );
                }
            }

            for (const change of entry.changes ?? []) {
                if (change.field !== "comments") {
                    continue;
                }

                const comment = change.value;

                const senderId = comment?.from?.id;
                const commentId = comment?.id;

                if (!entry.id || !senderId || !commentId) {
                    continue;
                }

                const result =
                    await this.instagramService.processWebhookComment({
                        recipientId: entry.id,
                        commentId,
                        senderId,
                        username: comment.from?.username,
                        text: comment.text,
                        mediaId: comment.media?.id,
                        mediaType: comment.media?.media_product_type,
                    });
                
                if (!result.duplicate) {
                    console.log("Executing Instagram comment automation:", {
                        platformAccountId: result.comment.platformAccountId,
                        comment: comment.text ?? "",
                    });

                    await this.automationExecutionService.executeFromTrigger(
                        result.comment.platformAccountId,
                        {
                            recipientId: senderId,
                            senderId,
                            message: comment.text ?? "",
                            commentId,
                            mediaId: comment.media?.id,
                            mediaType: comment.media?.media_product_type,
                            contactId: result.contactId,
                        },
                        false,
                    );
                }

                console.log("Instagram comment processed:", result);
            }
        }

        return response.status(200).send("EVENT_RECEIVED");
    }
}