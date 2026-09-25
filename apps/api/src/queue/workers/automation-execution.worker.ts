import {
    Injectable,
    OnModuleDestroy,
    OnModuleInit,
} from "@nestjs/common";
import { Worker } from "bullmq";

import { AutomationExecutionService } from "../../automations/execution/automation-execution.service.js";
import { queueRedis } from "../queue.connection.js";
import { automationExecutionQueue } from "../queue.instances.js";
import type { AutomationExecutionJob } from "../queue.service.js";

@Injectable()
export class AutomationExecutionWorker
    implements OnModuleInit, OnModuleDestroy
{
    private worker?: Worker<AutomationExecutionJob>;

    constructor(
        private readonly automationExecutionService: AutomationExecutionService,
    ) {}

    onModuleInit() {
        this.worker = new Worker<AutomationExecutionJob>(
            automationExecutionQueue.name,
            async (job) => {
                const { executionId } = job.data;

                console.log(
                    "Processing automation execution:",
                    {
                        executionId,
                        jobId: job.id,
                    },
                );

                await this.automationExecutionService.executeByExecutionId(
                    executionId,
                );
            },
            {
                connection: queueRedis,
                concurrency: 20,
            },
        );

        this.worker.on("completed", (job) => {
            console.log(
                "Automation execution completed:",
                job.id,
            );
        });

        this.worker.on("failed", (job, error) => {
            console.error(
                "Automation execution failed:",
                {
                    jobId: job?.id,
                    error: error.message,
                },
            );
        });
    }

    async onModuleDestroy() {
        await this.worker?.close();
    }
}