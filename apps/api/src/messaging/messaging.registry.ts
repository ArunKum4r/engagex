import {
    BadRequestException,
    Injectable,
} from "@nestjs/common";

import type { MessagingAdapter } from "./messaging.types.js";

@Injectable()
export class MessagingAdapterRegistry {
    private readonly adapters =
        new Map<string, MessagingAdapter>();

    register(
        adapter: MessagingAdapter,
    ) {
        this.adapters.set(
            adapter.platform,
            adapter,
        );
    }

    get(platform: string) {
        const adapter =
            this.adapters.get(platform);

        if (!adapter) {
            throw new BadRequestException(
                `Messaging is not supported for platform: ${platform}`,
            );
        }

        return adapter;
    }
}