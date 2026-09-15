import { and, eq } from "drizzle-orm";
import { db } from "../client.js";
import {
    subscriptions,
    subscriptionPlans,
    planEntitlements,
    entitlementDefinitions,
    subscriptionAddonsPurchased,
    addonEntitlements,
    subscriptionEntitlementOverrides,
    workspaces
} from "../schema/index.js";

export const findActiveUserSubscription = async (
    userId: string,
) => {
    const result = await db
        .select({
            subscription: subscriptions,
            plan: subscriptionPlans,
        })
        .from(subscriptions)
        .innerJoin(
            subscriptionPlans,
            eq(
                subscriptions.planId,
                subscriptionPlans.id,
            ),
        )
        .where(
            and(
                eq(subscriptions.userId, userId),
                eq(subscriptions.status, "ACTIVE"),
            ),
        )
        .limit(1);

    return result[0] ?? null;
};

export const findPlanEntitlements = async (
    planId: string,
) => {
    return db
        .select({
            entitlement: entitlementDefinitions,
            value: planEntitlements,
        })
        .from(planEntitlements)
        .innerJoin(
            entitlementDefinitions,
            eq(
                planEntitlements.entitlementId,
                entitlementDefinitions.id,
            ),
        )
        .where(
            eq(planEntitlements.planId, planId),
        );
};

export const findPurchasedAddons = async (
    subscriptionId: string,
) => {
    return db
        .select({
            purchase: subscriptionAddonsPurchased,
            entitlement: addonEntitlements,
            definition: entitlementDefinitions,
        })
        .from(subscriptionAddonsPurchased)
        .innerJoin(
            addonEntitlements,
            eq(
                subscriptionAddonsPurchased.addonId,
                addonEntitlements.addonId,
            ),
        )
        .innerJoin(
            entitlementDefinitions,
            eq(
                addonEntitlements.entitlementId,
                entitlementDefinitions.id,
            ),
        )
        .where(
            eq(
                subscriptionAddonsPurchased.subscriptionId,
                subscriptionId,
            ),
        );
};

export const findSubscriptionOverrides = async (
    subscriptionId: string,
) => {
    return db
        .select({
            override: subscriptionEntitlementOverrides,
            definition: entitlementDefinitions,
        })
        .from(subscriptionEntitlementOverrides)
        .innerJoin(
            entitlementDefinitions,
            eq(
                subscriptionEntitlementOverrides.entitlementId,
                entitlementDefinitions.id,
            ),
        )
        .where(
            eq(
                subscriptionEntitlementOverrides.subscriptionId,
                subscriptionId,
            ),
        );
};

export const findSubscriptionById = async (
    subscriptionId: string,
) => {
    const result = await db
        .select({
            subscription: subscriptions,
            plan: subscriptionPlans,
        })
        .from(subscriptions)
        .innerJoin(
            subscriptionPlans,
            eq(
                subscriptions.planId,
                subscriptionPlans.id,
            ),
        )
        .where(
            eq(
                subscriptions.id,
                subscriptionId,
            ),
        )
        .limit(1);

    return result[0] ?? null;
};

export const findWorkspaceOwnerId = async (
  workspaceId: string,
) => {
  const result = await db
    .select({
      ownerId: workspaces.ownerId,
    })
    .from(workspaces)
    .where(eq(workspaces.id, workspaceId))
    .limit(1);

  return result[0]?.ownerId ?? null;
};

export const findPlanBySlug = async (slug: string) => {
  const result = await db
    .select()
    .from(subscriptionPlans)
    .where(eq(subscriptionPlans.slug, slug))
    .limit(1);

  return result[0] ?? null;
};

export const createUserSubscription = async ({
  userId,
  planId,
}: {
  userId: string;
  planId: string;
}) => {
  const result = await db
    .insert(subscriptions)
    .values({
      userId,
      planId,
      status: "ACTIVE",
    })
    .returning();

  return result[0] ?? null;
};