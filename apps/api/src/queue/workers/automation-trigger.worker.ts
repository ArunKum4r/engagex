import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { Worker, Job } from "bullmq";

import {
    findMessageById,
    findWebhookEventById,
} from "@engagex/db";

import { AutomationExecutionService } from "../../automations/execution/automation-execution.service.js";
import { automationTriggerQueue } from "../queue.instances.js";
import { queueRedis } from "../queue.connection.js";
import type { AutomationTriggerJob } from "../queue.service.js";

@Injectable()
export class AutomationTriggerWorker
    implements OnModuleInit, OnModuleDestroy
{
    private worker?: Worker<AutomationTriggerJob>;

    constructor(
        private readonly automationExecutionService: AutomationExecutionService,
    ) {}

    onModuleInit() {
        this.worker = new Worker<AutomationTriggerJob>(
            automationTriggerQueue.name,
            async (job: Job<AutomationTriggerJob>) => {
                const {
                    webhookEventId,
                    platformAccountId,
                    eventType,
                } = job.data;

                console.log("Processing automation trigger:", {
                    jobId: job.id,
                    webhookEventId,
                    platformAccountId,
                    eventType,
                });

                const webhookEvent =
                    await findWebhookEventById(webhookEventId);

                if (!webhookEvent) {
                    throw new Error(
                        `Webhook event not found: ${webhookEventId}`,
                    );
                }

                if (
                    webhookEvent.platformAccountId !==
                    platformAccountId
                ) {
                    throw new Error(
                        `Webhook event platform account mismatch: ${webhookEventId}`,
                    );
                }

                const metadata =
                    webhookEvent.metadata &&
                    typeof webhookEvent.metadata === "object" &&
                    !Array.isArray(webhookEvent.metadata)
                        ? webhookEvent.metadata as Record<string, unknown>
                        : {};

                const messageId =
                    typeof metadata.messageId === "string"
                        ? metadata.messageId
                        : null;

                const message = messageId
                    ? await findMessageById(messageId)
                    : null;

                await this.automationExecutionService.executeFromTrigger(
                    platformAccountId,
                    {
                        webhookEventId,

                        contactId:
                            typeof metadata.contactId === "string"
                                ? metadata.contactId
                                : undefined,

                        contactIdentityId:
                            typeof metadata.contactIdentityId === "string"
                                ? metadata.contactIdentityId
                                : undefined,

                        conversationId:
                            typeof metadata.conversationId === "string"
                                ? metadata.conversationId
                                : undefined,

                        messageId:
                            messageId ?? undefined,

                        commentId:
                            typeof metadata.commentId === "string"
                                ? metadata.commentId
                                : undefined,

                        message: message?.content ?? undefined,
                    },
                    false,
                    eventType,
                );
            },
            {
                connection: queueRedis,
                concurrency: 20,
            },
        );

        this.worker.on("completed", (job) => {
            console.log("Automation trigger completed:", {
                jobId: job.id,
            });
        });

        this.worker.on("failed", (job, error) => {
            console.error("Automation trigger failed:", {
                jobId: job?.id,
                error: error.message,
            });
        });
    }

    async onModuleDestroy() {
        await this.worker?.close();
    }
}