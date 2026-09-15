import { Module } from "@nestjs/common";
import { AutomationController } from "./automation.controller.js";
import { AutomationService } from "./automation.service.js";
import { SubscriptionsModule } from "../subscriptions/subscriptions.module.js";

@Module({
    imports: [SubscriptionsModule],
    controllers: [ AutomationController ],
    providers: [ AutomationService ],
})
export class AutomationModule {}