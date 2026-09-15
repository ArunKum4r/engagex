import { Module } from "@nestjs/common";

import { IntegrationController } from "./integration.controller.js";
import { IntegrationService } from "./integration.service.js";
import { SubscriptionsModule } from "../subscriptions/subscriptions.module.js";
import { InstagramController } from "./instagram/instagram.controller.js";
import { InstagramService } from "./instagram/instagram.service.js";

@Module({
    imports: [SubscriptionsModule],
    controllers: [IntegrationController, InstagramController],
    providers: [IntegrationService, InstagramService],
})
export class IntegrationModule {}