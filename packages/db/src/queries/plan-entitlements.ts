import { and, eq } from "drizzle-orm";
import { db } from "../client.js";
import {
    planEntitlements,
    entitlementDefinitions,
} from "../schema/index.js";

export const findPlanEntitlementsByPlanId = async (
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

export const findPlanEntitlement = async (
    planId: string,
    entitlementId: string,
) => {
    const result = await db
        .select()
        .from(planEntitlements)
        .where(
            and(
                eq(
                    planEntitlements.planId,
                    planId,
                ),
                eq(
                    planEntitlements.entitlementId,
                    entitlementId,
                ),
            ),
        )
        .limit(1);

    return result[0] ?? null;
};

export const upsertPlanEntitlement = async (data: {
    planId: string;
    entitlementId: string;
    booleanValue?: boolean | null;
    limitValue?: number | null;
}) => {
    const existing = await findPlanEntitlement(
        data.planId,
        data.entitlementId,
    );

    if (existing) {
        const result = await db
            .update(planEntitlements)
            .set({
                booleanValue:
                    data.booleanValue ?? null,
                limitValue:
                    data.limitValue ?? null,
            })
            .where(
                and(
                    eq(
                        planEntitlements.planId,
                        data.planId,
                    ),
                    eq(
                        planEntitlements.entitlementId,
                        data.entitlementId,
                    ),
                ),
            )
            .returning();

        return result[0] ?? null;
    }

    const result = await db
        .insert(planEntitlements)
        .values({
            planId: data.planId,
            entitlementId: data.entitlementId,
            booleanValue:
                data.booleanValue ?? null,
            limitValue:
                data.limitValue ?? null,
        })
        .returning();

    return result[0] ?? null;
};

export const removePlanEntitlement = async (
    planId: string,
    entitlementId: string,
) => {
    const result = await db
        .delete(planEntitlements)
        .where(
            and(
                eq(
                    planEntitlements.planId,
                    planId,
                ),
                eq(
                    planEntitlements.entitlementId,
                    entitlementId,
                ),
            ),
        )
        .returning();

    return result[0] ?? null;
};