import { Module } from "@nestjs/common";

import { IntegrationModule } from "../integrations/integration.module.js";

import { InstagramMessagingAdapter } from "./adapters/instagram.messaging-adapter.js";
import { MessagingAdapterRegistry } from "./messaging.registry.js";
import { MessagingService } from "./messaging.service.js";

@Module({
    imports: [
        IntegrationModule,
    ],

    providers: [
        MessagingService,
        MessagingAdapterRegistry,
        InstagramMessagingAdapter,
        {
            provide: "MESSAGING_ADAPTERS",
            inject: [
                MessagingAdapterRegistry,
                InstagramMessagingAdapter,
            ],
            useFactory: (
                registry: MessagingAdapterRegistry,
                instagramAdapter: InstagramMessagingAdapter,
            ) => {
                registry.register(
                    instagramAdapter,
                );

                return true;
            },
        },
    ],

    exports: [
        MessagingService,
    ],
})
export class MessagingModule {}