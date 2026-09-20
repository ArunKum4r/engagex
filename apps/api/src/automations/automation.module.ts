import { Module } from "@nestjs/common";
import { AutomationController } from "./automation.controller.js";
import { AutomationService } from "./automation.service.js";
import { SubscriptionsModule } from "../subscriptions/subscriptions.module.js";
import { AutomationExecutionService } from "./execution/automation-execution.service.js";
import { AutomationStepExecutorService } from "./execution/automation-step-executor.service.js";
import { IntegrationModule } from "../integrations/integration.module.js";

@Module({
    imports: [SubscriptionsModule, IntegrationModule],
    controllers: [ AutomationController ],
    providers: [ AutomationService, AutomationExecutionService, AutomationStepExecutorService ],
    exports: [ AutomationExecutionService ]
})
export class AutomationModule {}