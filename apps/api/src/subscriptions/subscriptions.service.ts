import {
    findActiveUserSubscription,
    findPlanEntitlements,
    findPurchasedAddons,
    findSubscriptionOverrides,
    findSubscriptionById,
    getEntitlementUsage,
    findWorkspaceOwnerId,
    findPlanBySlug,
    createUserSubscription,
    ENTITLEMENTS
} from "@engagex/db";
import { Injectable } from "@nestjs/common";

type EntitlementValue = {
    key: string;
    name: string;
    description: string | null;
    type: string;
    booleanValue: boolean | null;
    limitValue: number | null;
};

@Injectable()
export class SubscriptionsService {
    async getUserSubscription(userId: string) {
        return findActiveUserSubscription(userId);
    }

    async getEntitlements(subscriptionId: string) {
        const subscription =
            await findSubscriptionById(subscriptionId);

        if (!subscription) {
            return new Map<string, EntitlementValue>();
        }

        const planEntitlements =
            await findPlanEntitlements(
                subscription.subscription.planId,
            );

        const purchasedAddons =
            await findPurchasedAddons(subscriptionId);

        const overrides =
            await findSubscriptionOverrides(
                subscriptionId,
            );

        const effective =
            new Map<string, EntitlementValue>();

        // ----------------------------------------
        // 1. PLAN
        // ----------------------------------------

        for (const item of planEntitlements) {
            effective.set(item.entitlement.key, {
                key: item.entitlement.key,
                name: item.entitlement.name,
                description:
                    item.entitlement.description,
                type: item.entitlement.type,
                booleanValue:
                    item.value.booleanValue,
                limitValue:
                    item.value.limitValue,
            });
        }

        // ----------------------------------------
        // 2. ADDONS
        // ----------------------------------------

        for (const item of purchasedAddons) {
            if (
                !this.isActivePeriod(
                    item.purchase.startsAt,
                    item.purchase.endsAt,
                )
            ) {
                continue;
            }

            const key = item.definition.key;
            const quantity =
                item.purchase.quantity;

            const existing =
                effective.get(key);

            if (
                item.definition.type === "LIMIT"
            ) {
                const addonLimit =
                    (item.entitlement.limitValue ?? 0) *
                    quantity;

                effective.set(key, {
                    key,
                    name: item.definition.name,
                    description:
                        item.definition.description,
                    type: item.definition.type,
                    booleanValue:
                        existing?.booleanValue ?? null,
                    limitValue:
                        (existing?.limitValue ?? 0) +
                        addonLimit,
                });

                continue;
            }

            if (
                item.definition.type === "BOOLEAN"
            ) {
                effective.set(key, {
                    key,
                    name: item.definition.name,
                    description:
                        item.definition.description,
                    type: item.definition.type,
                    booleanValue:
                        existing?.booleanValue === true ||
                        item.entitlement.booleanValue === true,
                    limitValue:
                        existing?.limitValue ?? null,
                });
            }
        }

        // ----------------------------------------
        // 3. SUBSCRIPTION OVERRIDES
        // ----------------------------------------

        for (const item of overrides) {
            const key = item.definition.key;

            const existing =
                effective.get(key);

            effective.set(key, {
                key,
                name: item.definition.name,
                description:
                    item.definition.description,
                type: item.definition.type,
                booleanValue:
                    item.override.booleanValue ??
                    existing?.booleanValue ??
                    null,
                limitValue:
                    item.override.limitValue ??
                    existing?.limitValue ??
                    null,
            });
        }

        return effective;
    }

    async getEntitlement(
        subscriptionId: string,
        key: string,
    ) {
        const entitlements =
            await this.getEntitlements(subscriptionId);

        return entitlements.get(key) ?? null;
    }

    async hasFeature(
        subscriptionId: string,
        key: string,
    ) {
        const entitlement =
            await this.getEntitlement(
                subscriptionId,
                key,
            );

        return entitlement?.booleanValue === true;
    }

    async getLimit(
        subscriptionId: string,
        key: string,
    ) {
        const entitlement =
            await this.getEntitlement(
                subscriptionId,
                key,
            );

        return entitlement?.limitValue ?? 0;
    }

    async canUse(
        subscriptionId: string,
        key: string,
        currentUsage: number,
        requested = 1,
    ) {
        const entitlement =
            await this.getEntitlement(
                subscriptionId,
                key,
            );

        if (!entitlement) {
            return false;
        }

        if (entitlement.type === "BOOLEAN") {
            return entitlement.booleanValue === true;
        }

        if (entitlement.type === "LIMIT") {
            const limit = entitlement.limitValue;

            if (limit === null) {
                return false;
            }

            return (
                currentUsage + requested <=
                limit
            );
        }

        return false;
    }

    private isActivePeriod(
        startsAt: Date,
        endsAt: Date | null,
    ) {
        const now = new Date();

        if (startsAt > now) {
            return false;
        }

        if (endsAt && endsAt <= now) {
            return false;
        }

        return true;
    }

    async checkLimit({
        subscriptionId,
        key,
        userId,
        workspaceId,
        requested = 1,
    }: {
        subscriptionId: string;
        key: string;
        userId: string;
        workspaceId?: string;
        requested?: number;
    }) {
        const entitlement =
            await this.getEntitlement(
                subscriptionId,
                key,
            );

        if (!entitlement) {
            return {
                allowed: false,
                reason: "ENTITLEMENT_NOT_FOUND" as const,
                limit: 0,
                usage: 0,
                remaining: 0,
            };
        }

        if (entitlement.type !== "LIMIT") {
            return {
                allowed: false,
                reason: "NOT_A_LIMIT" as const,
                limit: null,
                usage: 0,
                remaining: 0,
            };
        }

        const usage =
            await getEntitlementUsage({
                key,
                userId,
                workspaceId,
            });

        const limit =
            entitlement.limitValue ?? 0;

        const remaining =
            Math.max(0, limit - usage);

        return {
            allowed:
                usage + requested <= limit,

            reason:
                usage + requested <= limit
                    ? "ALLOWED" as const
                    : "LIMIT_REACHED" as const,

            limit,
            usage,
            remaining,
        };
    }

    async getWorkspaceSubscription(workspaceId: string) {
        const ownerId = await findWorkspaceOwnerId(workspaceId);

        if (!ownerId) {
            return null;
        }

        return findActiveUserSubscription(ownerId);
    }

    async provisionFreeSubscription(userId: string) {
        const freePlan = await findPlanBySlug("free");

        if (!freePlan) {
            throw new Error("FREE subscription plan not found");
        }

        return createUserSubscription({
            userId,
            planId: freePlan.id,
        });
    }

    async checkWorkspaceLimit(userId: string, requested = 1) {
        const subscription = await this.getUserSubscription(userId);

        if (!subscription) {
            return {
                allowed: false,
                reason: "SUBSCRIPTION_NOT_FOUND" as const,
                limit: 0,
                usage: 0,
                remaining: 0,
            };
        }

        return this.checkLimit({
            subscriptionId: subscription.subscription.id,
            key: ENTITLEMENTS.WORKSPACE_MAX,
            userId,
            requested,
        });
    }
}

export const subscriptionService =
    new SubscriptionsService();