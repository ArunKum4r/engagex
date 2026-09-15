import { Module } from "@nestjs/common";

import { SubscriptionsController } from "./subscriptions.controller.js";
import { SubscriptionsService } from "./subscriptions.service.js";
import { DmCreditsService } from "./dm-credits.service.js";

@Module({
    controllers: [SubscriptionsController],
    providers: [SubscriptionsService, DmCreditsService],
    exports: [SubscriptionsService, DmCreditsService],
})
export class SubscriptionsModule {}