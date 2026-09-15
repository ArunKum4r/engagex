import { db } from "../client.js";
import {
  subscriptionPlans,
  entitlementDefinitions,
  planEntitlements,
} from "../schema/index.js";
import { eq, and } from "drizzle-orm";

const plans = [
  {
    name: "Free",
    slug: "free",
    description: "Free plan for getting started with EngageX",
    type: "FREE",
    price: 0,
    currency: "INR",
    billingInterval: "MONTHLY",
  },
  {
    name: "Starter",
    slug: "starter",
    description: "For creators and small businesses",
    type: "STARTER",
    price: 1900,
    currency: "INR",
    billingInterval: "MONTHLY",
  },
  {
    name: "Pro",
    slug: "pro",
    description: "For growing businesses",
    type: "PRO",
    price: 4900,
    currency: "INR",
    billingInterval: "MONTHLY",
  },
  {
    name: "Business",
    slug: "business",
    description: "For businesses with higher usage",
    type: "BUSINESS",
    price: 9900,
    currency: "INR",
    billingInterval: "MONTHLY",
  },
  {
    name: "Enterprise",
    slug: "enterprise",
    description: "Custom plan for enterprise customers",
    type: "ENTERPRISE",
    price: 0,
    currency: "INR",
    billingInterval: "MONTHLY",
  },
] as const;

const entitlementValues: Record<
  string,
  Record<
    string,
    { booleanValue?: boolean; limitValue?: number }
  >
> = {
  free: {
    "workspace.max": { limitValue: 1 },
    "platform.max": { limitValue: 1 },
    "platform.instagram": { booleanValue: true },
    "platform.facebook": { booleanValue: false },
    "platform.whatsapp": { booleanValue: false },
    "automations.max": { limitValue: 3 },
    "leads.max": { limitValue: 100 },
    "workflow.builder": { booleanValue: true },
    "workflow.form": { booleanValue: false },
  },

  starter: {
    "workspace.max": { limitValue: 3 },
    "platform.max": { limitValue: 3 },
    "platform.instagram": { booleanValue: true },
    "platform.facebook": { booleanValue: true },
    "platform.whatsapp": { booleanValue: false },
    "automations.max": { limitValue: 25 },
    "leads.max": { limitValue: 1000 },
    "workflow.builder": { booleanValue: true },
    "workflow.form": { booleanValue: true },
  },

  pro: {
    "workspace.max": { limitValue: 10 },
    "platform.max": { limitValue: 10 },
    "platform.instagram": { booleanValue: true },
    "platform.facebook": { booleanValue: true },
    "platform.whatsapp": { booleanValue: true },
    "automations.max": { limitValue: 100 },
    "leads.max": { limitValue: 10000 },
    "workflow.builder": { booleanValue: true },
    "workflow.form": { booleanValue: true },
  },

  business: {
    "workspace.max": { limitValue: 25 },
    "platform.max": { limitValue: 25 },
    "platform.instagram": { booleanValue: true },
    "platform.facebook": { booleanValue: true },
    "platform.whatsapp": { booleanValue: true },
    "automations.max": { limitValue: 500 },
    "leads.max": { limitValue: 50000 },
    "workflow.builder": { booleanValue: true },
    "workflow.form": { booleanValue: true },
  },

  enterprise: {
    "workspace.max": { limitValue: 999999 },
    "platform.max": { limitValue: 999999 },
    "platform.instagram": { booleanValue: true },
    "platform.facebook": { booleanValue: true },
    "platform.whatsapp": { booleanValue: true },
    "automations.max": { limitValue: 999999 },
    "leads.max": { limitValue: 999999 },
    "workflow.builder": { booleanValue: true },
    "workflow.form": { booleanValue: true },
  },
};

const run = async () => {
  for (const planData of plans) {
    let plan = (
      await db
        .select()
        .from(subscriptionPlans)
        .where(eq(subscriptionPlans.slug, planData.slug))
        .limit(1)
    )[0];

    if (!plan) {
      plan = (
        await db
          .insert(subscriptionPlans)
          .values(planData)
          .returning()
      )[0];
    }

    if (!plan) {
      throw new Error(
        `Failed to create plan: ${planData.slug}`,
      );
    }

    const values = entitlementValues[planData.slug];

    for (const [key, value] of Object.entries(values)) {
      const definition = (
        await db
          .select()
          .from(entitlementDefinitions)
          .where(
            eq(entitlementDefinitions.key, key),
          )
          .limit(1)
      )[0];

      if (!definition) {
        throw new Error(
          `Entitlement definition not found: ${key}`,
        );
      }

      const existing = (
        await db
          .select()
          .from(planEntitlements)
          .where(
            and(
              eq(
                planEntitlements.planId,
                plan.id,
              ),
              eq(
                planEntitlements.entitlementId,
                definition.id,
              ),
            ),
          )
          .limit(1)
      )[0];

      if (!existing) {
        await db.insert(planEntitlements).values({
          planId: plan.id,
          entitlementId: definition.id,
          booleanValue: value.booleanValue ?? null,
          limitValue: value.limitValue ?? null,
        });
      }
    }
  }

  console.log(
    "Subscription plans and entitlements seeded successfully.",
  );
};

run().catch((error) => {
  console.error(error);
  process.exit(1);
});