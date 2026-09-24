import { Module, forwardRef } from "@nestjs/common";
import { AutomationController } from "./automation.controller.js";
import { AutomationService } from "./automation.service.js";
import { SubscriptionsModule } from "../subscriptions/subscriptions.module.js";
import { AutomationExecutionService } from "./execution/automation-execution.service.js";
import { AutomationStepExecutorService } from "./execution/automation-step-executor.service.js";
import { IntegrationModule } from "../integrations/integration.module.js";
import { ContactAutomationPauseController } from "./contact-automation-pause.controller.js";
import { ContactAutomationPauseService } from "./contact-automation-pause.service.js";

@Module({
    imports: [SubscriptionsModule, forwardRef(() => IntegrationModule)],
    controllers: [ AutomationController, ContactAutomationPauseController ],
    providers: [ AutomationService, AutomationExecutionService, AutomationStepExecutorService, ContactAutomationPauseService ],
    exports: [ AutomationExecutionService ]
})
export class AutomationModule {}