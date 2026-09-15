import { desc, eq } from "drizzle-orm";
import { db } from "../client.js";
import { addonEntitlements, entitlementDefinitions, planEntitlements, subscriptionAddons, subscriptionAddonsPurchased, subscriptionEntitlementOverrides, subscriptionPlans, subscriptions, users, workspaces } from "../schema/index.js";
import {
  getAvailableAddonCredits,
  findUsagePeriod,
} from "./subscription-dm-credits.js";

export const findAllPlatformUsers = async () => {
  return db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      avatarUrl: users.avatarUrl,
      status: users.status,
      role: users.role,
      emailVerifiedAt: users.emailVerifiedAt,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
    })
    .from(users)
    .orderBy(desc(users.createdAt));
};

export const findPlatformUserById = async (userId: string) => {
  const result = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      avatarUrl: users.avatarUrl,
      status: users.status,
      role: users.role,
      emailVerifiedAt: users.emailVerifiedAt,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  return result[0] ?? null;
};

export const findPlatformUserWorkspaces = async (
  userId: string,
) => {
  return db
    .select({
      id: workspaces.id,
      name: workspaces.name,
      slug: workspaces.slug,
      createdAt: workspaces.createdAt,
      updatedAt: workspaces.updatedAt,
    })
    .from(workspaces)
    .where(eq(workspaces.ownerId, userId))
    .orderBy(desc(workspaces.createdAt));
};

export const updatePlatformUserStatus = async (
  userId: string,
  status: string,
) => {
  const result = await db
    .update(users)
    .set({
      status,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId))
    .returning();

  return result[0] ?? null;
};

export const findPlatformUserSubscription = async (
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
    .where(eq(subscriptions.userId, userId))
    .orderBy(desc(subscriptions.createdAt))
    .limit(1);

  return result[0] ?? null;
};

export const findPlatformUserPlanEntitlements = async (
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
    .where(eq(planEntitlements.planId, planId));
};

export const findPlatformUserPurchasedAddons = async (
  subscriptionId: string,
) => {
  return db
    .select({
      purchase: subscriptionAddonsPurchased,
      addon: subscriptionAddons,
    })
    .from(subscriptionAddonsPurchased)
    .innerJoin(
      subscriptionAddons,
      eq(
        subscriptionAddonsPurchased.addonId,
        subscriptionAddons.id,
      ),
    )
    .where(
      eq(
        subscriptionAddonsPurchased.subscriptionId,
        subscriptionId,
      ),
    );
};

export const findPlatformUserAddonEntitlements = async (
  addonId: string,
) => {
  return db
    .select({
      entitlement: entitlementDefinitions,
      value: addonEntitlements,
    })
    .from(addonEntitlements)
    .innerJoin(
      entitlementDefinitions,
      eq(
        addonEntitlements.entitlementId,
        entitlementDefinitions.id,
      ),
    )
    .where(eq(addonEntitlements.addonId, addonId));
};

export const findPlatformUserSubscriptionOverrides = async (
  subscriptionId: string,
) => {
  return db
    .select({
      override: subscriptionEntitlementOverrides,
      entitlement: entitlementDefinitions,
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

export const getPlatformUserDmUsage = async (
  subscriptionId: string,
  periodStart: Date,
) => {
  const period = await findUsagePeriod({
    subscriptionId,
    periodStart,
  });

  const addonCredits =
    await getAvailableAddonCredits(subscriptionId);

  const includedDms = period?.includedDms ?? 0;
  const usedIncludedDms =
    period?.usedIncludedDms ?? 0;

  return {
    period: period
      ? {
          id: period.id,
          periodStart: period.periodStart,
          periodEnd: period.periodEnd,
        }
      : null,

    included: {
      limit: includedDms,
      used: usedIncludedDms,
      remaining: Math.max(
        0,
        includedDms - usedIncludedDms,
      ),
    },

    addons: {
      totalRemaining: addonCredits.reduce(
        (total, credit) =>
          total + Number(credit.remaining),
        0,
      ),
      credits: addonCredits,
    },
  };
};