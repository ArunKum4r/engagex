import { Global, Module, forwardRef } from "@nestjs/common";

import { AutomationModule } from "../automations/automation.module.js";

import { QueueService } from "./queue.service.js";
import { AutomationTriggerWorker } from "./workers/automation-trigger.worker.js";
import { AutomationExecutionWorker } from "./workers/automation-execution.worker.js";

@Global()
@Module({
    imports: [
        forwardRef(() => AutomationModule),
    ],
    providers: [
        QueueService,
        AutomationTriggerWorker,
        AutomationExecutionWorker,
    ],
    exports: [
        QueueService,
    ],
})
export class QueueModule {}