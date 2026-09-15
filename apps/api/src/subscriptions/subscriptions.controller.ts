import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { SubscriptionsService } from "./subscriptions.service.js";

@Controller("subscriptions")
export class SubscriptionsController {
  constructor(
    private readonly subscriptionsService: SubscriptionsService,
  ) {}

  @Get("user/:userId")
  async getUserSubscription(
    @Param("userId") userId: string,
  ) {
    return this.subscriptionsService.getUserSubscription(
      userId,
    );
  }

  @Get(":subscriptionId/entitlements")
  async getEntitlements(
    @Param("subscriptionId") subscriptionId: string,
  ) {
    const entitlements =
      await this.subscriptionsService.getEntitlements(
        subscriptionId,
      );

    return Object.fromEntries(entitlements);
  }

    @Post("provision")
    async provisionFreeSubscription(
        @Body("userId") userId: string,
    ) {
        return this.subscriptionsService.provisionFreeSubscription(userId);
    }
}