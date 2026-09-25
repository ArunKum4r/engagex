import { Module, forwardRef } from "@nestjs/common";

import { IntegrationController } from "./integration.controller.js";
import { IntegrationService } from "./integration.service.js";
import { SubscriptionsModule } from "../subscriptions/subscriptions.module.js";

import { InstagramController } from "./instagram/instagram.controller.js";
import { InstagramService } from "./instagram/instagram.service.js";
import { InstagramApiClient } from "./instagram/api/instagram-api.client.js";

import { InstagramWebhookController } from "./instagram/instagram-webhook.controller.js";
import { AutomationModule } from "../automations/automation.module.js";

@Module({
    imports: [SubscriptionsModule, forwardRef(() => AutomationModule)],

    controllers: [
        IntegrationController,
        InstagramController,
        InstagramWebhookController,
    ],

    providers: [
        IntegrationService,
        InstagramService,
        InstagramApiClient,
    ],

    exports: [
        InstagramService,
        InstagramApiClient,
    ],
})
export class IntegrationModule {}