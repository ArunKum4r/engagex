import { Injectable } from "@nestjs/common";
import { Job } from "bullmq";

import {
    automationExecutionQueue,
    automationTriggerQueue,
} from "./queue.instances.js";

export interface AutomationTriggerJob {
    webhookEventId: string;
    platformAccountId: string;
    eventType: string;
}

export interface AutomationExecutionJob {
    executionId: string;
}

@Injectable()
export class QueueService {
    async enqueueAutomationTrigger(data: AutomationTriggerJob) {
        return automationTriggerQueue.add(
            "process-trigger",
            data,
            {
                jobId: `trigger-${data.webhookEventId}`,
                removeOnComplete: {
                    age: 3600,
                    count: 10000,
                },
                removeOnFail: {
                    age: 86400,
                },
                attempts: 3,
                backoff: {
                    type: "exponential",
                    delay: 1000,
                },
            },
        );
    }

    async enqueueAutomationExecution(data: AutomationExecutionJob) {
    return automationExecutionQueue.add(
        "process-execution",
        data,
        {
            jobId: `execution-${data.executionId}`,
            removeOnComplete: {
                age: 3600,
                count: 10000,
            },
            removeOnFail: {
                age: 86400,
            },
            attempts: 3,
            backoff: {
                type: "exponential",
                delay: 1000,
            },
        },
    );
}
}