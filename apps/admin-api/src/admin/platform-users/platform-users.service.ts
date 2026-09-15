import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import {
  findPlatformUserById,
  findPlatformUserWorkspaces,
  findAllPlatformUsers,
  updatePlatformUserStatus,
  findPlatformUserSubscription,
  findPlatformUserPlanEntitlements,
  findPlatformUserPurchasedAddons,
  findPlatformUserAddonEntitlements,
  findPlatformUserSubscriptionOverrides,
  getPlatformUserDmUsage
} from "@engagex/db";

@Injectable()
export class PlatformUsersService {
  async findAll() {
    return findAllPlatformUsers();
  }

  async findOne(userId: string) {
    const user = await findPlatformUserById(userId);

    if (!user) {
      throw new NotFoundException("User not found");
    }

    return user;
  }

  async findWorkspaces(userId: string) {
    await this.findOne(userId);

    return findPlatformUserWorkspaces(userId);
  }

  async updateStatus(
    userId: string,
    status: "ACTIVE" | "SUSPENDED",
  ) {
    const user = await this.findOne(userId);

    if (user.status === status) {
      return user;
    }

    if (user.status === "PENDING" && status === "ACTIVE") {
      throw new ForbiddenException("User must verify their email before activation");
    }

    const updatedUser = await updatePlatformUserStatus(
      userId,
      status,
    );

    if (!updatedUser) {
      throw new NotFoundException("User not found");
    }

    return updatedUser;
  }

  async findSubscription(userId: string) {
    await this.findOne(userId);

    return findPlatformUserSubscription(userId);
  }

  async findSubscriptionDetails(userId: string) {
    await this.findOne(userId);

    const subscription =
      await findPlatformUserSubscription(userId);

    if (!subscription) {
      return null;
    }

    const now = new Date();

    const periodStart = new Date(
        Date.UTC(
            now.getUTCFullYear(),
            now.getUTCMonth(),
            1,
            0,
            0,
            0,
            0,
        ),
    );

    const dmUsage = await getPlatformUserDmUsage(
        subscription.subscription.id,
        periodStart,
    );

    const planEntitlements =
      await findPlatformUserPlanEntitlements(
        subscription.subscription.planId,
      );

    const purchasedAddons =
      await findPlatformUserPurchasedAddons(
        subscription.subscription.id,
      );

    const addons = await Promise.all(
      purchasedAddons.map(async (purchase) => ({
        purchase: purchase.purchase,
        addon: purchase.addon,
        entitlements:
          await findPlatformUserAddonEntitlements(
            purchase.addon.id,
          ),
      })),
    );

    const overrides =
      await findPlatformUserSubscriptionOverrides(
        subscription.subscription.id,
      );

    return {
      subscription: subscription.subscription,
      plan: subscription.plan,
      planEntitlements,
      addons,
      overrides,
      dmUsage
    };
  }
}