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
} from "../schema/index.js";

export async function getEffectiveEntitlements(
    userId: string,
) {
    const subscription = await db
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

    const activeSubscription = subscription[0];

    if (!activeSubscription) {
        return [];
    }

    const planValues = await db
        .select({
            definition: entitlementDefinitions,
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
            eq(
                planEntitlements.planId,
                activeSubscription.plan.id,
            ),
        );

    const addonValues = await db
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
                activeSubscription.subscription.id,
            ),
        );

    const overrides = await db
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
                activeSubscription.subscription.id,
            ),
        );

    const entitlements = new Map<
        string,
        {
            key: string;
            name: string;
            type: string;
            booleanValue: boolean | null;
            limitValue: number | null;
        }
    >();

    // 1. Plan values
    for (const row of planValues) {
        entitlements.set(row.definition.key, {
            key: row.definition.key,
            name: row.definition.name,
            type: row.definition.type,
            booleanValue: row.value.booleanValue,
            limitValue: row.value.limitValue,
        });
    }

    // 2. Add-ons
    for (const row of addonValues) {
        const existing = entitlements.get(
            row.definition.key,
        );

        const quantity = row.purchase.quantity;

        if (!existing) {
            entitlements.set(row.definition.key, {
                key: row.definition.key,
                name: row.definition.name,
                type: row.definition.type,
                booleanValue:
                    row.entitlement.booleanValue,
                limitValue:
                    row.entitlement.limitValue !== null
                        ? row.entitlement.limitValue *
                          quantity
                        : null,
            });

            continue;
        }

        if (
            row.entitlement.limitValue !== null
        ) {
            existing.limitValue =
                (existing.limitValue ?? 0) +
                row.entitlement.limitValue *
                    quantity;
        }

        if (
            row.entitlement.booleanValue === true
        ) {
            existing.booleanValue = true;
        }
    }

    // 3. Enterprise / subscription overrides
    for (const row of overrides) {
        entitlements.set(row.definition.key, {
            key: row.definition.key,
            name: row.definition.name,
            type: row.definition.type,
            booleanValue:
                row.override.booleanValue,
            limitValue:
                row.override.limitValue,
        });
    }

    return Array.from(entitlements.values());
}