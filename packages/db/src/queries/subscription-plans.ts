import { eq } from "drizzle-orm";
import { db } from "../client.js";
import {
    subscriptionPlans,
    planEntitlements,
    entitlementDefinitions,
} from "../schema/index.js";

export const findAllSubscriptionPlans = async () => {
    return db
        .select()
        .from(subscriptionPlans)
        .orderBy(subscriptionPlans.price);
};

export const findActiveSubscriptionPlans = async () => {
    return db
        .select()
        .from(subscriptionPlans)
        .where(eq(subscriptionPlans.isActive, true))
        .orderBy(subscriptionPlans.price);
};

export const findSubscriptionPlanById = async (
    planId: string,
) => {
    const result = await db
        .select()
        .from(subscriptionPlans)
        .where(eq(subscriptionPlans.id, planId))
        .limit(1);

    return result[0] ?? null;
};

export const findSubscriptionPlanBySlug = async (
    slug: string,
) => {
    const result = await db
        .select()
        .from(subscriptionPlans)
        .where(eq(subscriptionPlans.slug, slug))
        .limit(1);

    return result[0] ?? null;
};

export const findSubscriptionPlanWithEntitlements = async (
    planId: string,
) => {
    return db
        .select({
            plan: subscriptionPlans,
            entitlement: entitlementDefinitions,
            value: planEntitlements,
        })
        .from(planEntitlements)
        .innerJoin(
            subscriptionPlans,
            eq(
                planEntitlements.planId,
                subscriptionPlans.id,
            ),
        )
        .innerJoin(
            entitlementDefinitions,
            eq(
                planEntitlements.entitlementId,
                entitlementDefinitions.id,
            ),
        )
        .where(eq(subscriptionPlans.id, planId));
};

export const createSubscriptionPlan = async (data: {
    name: string;
    slug: string;
    description?: string | null;
    type: string;
    price: number;
    currency?: string;
    billingInterval: string;
    isActive?: boolean;
}) => {
    const result = await db
        .insert(subscriptionPlans)
        .values({
            name: data.name,
            slug: data.slug,
            description: data.description ?? null,
            type: data.type,
            price: data.price,
            currency: data.currency ?? "INR",
            billingInterval: data.billingInterval,
            isActive: data.isActive ?? true,
        })
        .returning();

    return result[0] ?? null;
};

export const updateSubscriptionPlan = async (
    planId: string,
    data: {
        name?: string;
        slug?: string;
        description?: string | null;
        type?: string;
        price?: number;
        currency?: string;
        billingInterval?: string;
        isActive?: boolean;
    },
) => {
    const result = await db
        .update(subscriptionPlans)
        .set({
            ...data,
            updatedAt: new Date(),
        })
        .where(eq(subscriptionPlans.id, planId))
        .returning();

    return result[0] ?? null;
};