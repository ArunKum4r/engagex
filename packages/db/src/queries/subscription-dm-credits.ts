import { and, eq, lte, sql } from "drizzle-orm";
import { db } from "../client.js";
import {
  subscriptionCreditLedger,
  subscriptionUsagePeriods,
} from "../schema/index.js";

export const findUsagePeriod = async ({
  subscriptionId,
  periodStart,
}: {
  subscriptionId: string;
  periodStart: Date;
}) => {
  const result = await db
    .select()
    .from(subscriptionUsagePeriods)
    .where(
      and(
        eq(subscriptionUsagePeriods.subscriptionId, subscriptionId),
        eq(subscriptionUsagePeriods.periodStart, periodStart),
      ),
    )
    .limit(1);

  return result[0] ?? null;
};

export const createUsagePeriod = async ({
  subscriptionId,
  periodStart,
  periodEnd,
  includedDms,
}: {
  subscriptionId: string;
  periodStart: Date;
  periodEnd: Date;
  includedDms: number;
}) => {
  const result = await db
    .insert(subscriptionUsagePeriods)
    .values({
      subscriptionId,
      periodStart,
      periodEnd,
      includedDms,
      usedIncludedDms: 0,
    })
    .onConflictDoNothing()
    .returning();

  if (result[0]) {
    return result[0];
  }

  return findUsagePeriod({
    subscriptionId,
    periodStart,
  });
};

export const getAvailableAddonCredits = async (
  subscriptionId: string,
) => {
  const result = await db
    .select({
      id: subscriptionCreditLedger.id,
      amount: subscriptionCreditLedger.amount,
      consumedAmount: subscriptionCreditLedger.consumedAmount,
      remaining: sql<number>`
        ${subscriptionCreditLedger.amount}
        - ${subscriptionCreditLedger.consumedAmount}
      `,
    })
    .from(subscriptionCreditLedger)
    .where(
      and(
        eq(subscriptionCreditLedger.subscriptionId, subscriptionId),
        eq(subscriptionCreditLedger.creditType, "ADDON"),
        lte(subscriptionCreditLedger.startsAt, new Date()),
        sql`(
          ${subscriptionCreditLedger.endsAt} IS NULL
          OR ${subscriptionCreditLedger.endsAt} > NOW()
        )`,
        sql`${subscriptionCreditLedger.amount} > ${subscriptionCreditLedger.consumedAmount}`,
      ),
    )
    .orderBy(subscriptionCreditLedger.createdAt);

  return result.map((credit) => ({
    ...credit,
    remaining: Number(credit.remaining),
  }));
};

export const getTotalAvailableAddonCredits = async (
  subscriptionId: string,
) => {
  const result = await db
    .select({
      total: sql<number>`
        COALESCE(
          SUM(
            ${subscriptionCreditLedger.amount}
            - ${subscriptionCreditLedger.consumedAmount}
          ),
          0
        )
      `,
    })
    .from(subscriptionCreditLedger)
    .where(
      and(
        eq(subscriptionCreditLedger.subscriptionId, subscriptionId),
        eq(subscriptionCreditLedger.creditType, "ADDON"),
        lte(subscriptionCreditLedger.startsAt, new Date()),
        sql`(
          ${subscriptionCreditLedger.endsAt} IS NULL
          OR ${subscriptionCreditLedger.endsAt} > NOW()
        )`,
        sql`${subscriptionCreditLedger.amount} > ${subscriptionCreditLedger.consumedAmount}`,
      ),
    );

  return Number(result[0]?.total ?? 0);
};

export const createAddonCredit = async ({
  subscriptionId,
  addonPurchaseId,
  amount,
  startsAt,
  endsAt,
}: {
  subscriptionId: string;
  addonPurchaseId: string;
  amount: number;
  startsAt: Date;
  endsAt?: Date | null;
}) => {
  const result = await db
    .insert(subscriptionCreditLedger)
    .values({
      subscriptionId,
      creditType: "ADDON",
      amount,
      consumedAmount: 0,
      addonPurchaseId,
      startsAt,
      endsAt: endsAt ?? null,
    })
    .returning();

  return result[0];
};

export const consumeDms = async ({
  usagePeriodId,
  amount,
}: {
  usagePeriodId: string;
  amount: number;
}) => {
  if (amount <= 0) {
    throw new Error("DM amount must be greater than zero");
  }

  return db.transaction(async (tx) => {
    const periodResult = await tx
      .select()
      .from(subscriptionUsagePeriods)
      .where(eq(subscriptionUsagePeriods.id, usagePeriodId))
      .for("update")
      .limit(1);

    const period = periodResult[0];

    if (!period) {
      throw new Error("Usage period not found");
    }

    let remaining = amount;
    let includedConsumed = 0;
    let addonConsumed = 0;

    const includedRemaining =
      period.includedDms - period.usedIncludedDms;

    if (includedRemaining > 0) {
      const amountFromIncluded = Math.min(
        remaining,
        includedRemaining,
      );

      const updatedPeriod = await tx
        .update(subscriptionUsagePeriods)
        .set({
          usedIncludedDms: sql`
            ${subscriptionUsagePeriods.usedIncludedDms}
            + ${amountFromIncluded}
          `,
          updatedAt: new Date(),
        })
        .where(eq(subscriptionUsagePeriods.id, period.id))
        .returning();

      if (!updatedPeriod[0]) {
        throw new Error("Unable to consume included DMs");
      }

      remaining -= amountFromIncluded;
      includedConsumed = amountFromIncluded;
    }

    if (remaining > 0) {
      const addonCredits = await tx
        .select()
        .from(subscriptionCreditLedger)
        .where(
          and(
            eq(
              subscriptionCreditLedger.subscriptionId,
              period.subscriptionId,
            ),
            eq(subscriptionCreditLedger.creditType, "ADDON"),
            lte(
              subscriptionCreditLedger.startsAt,
              new Date(),
            ),
            sql`(
              ${subscriptionCreditLedger.endsAt} IS NULL
              OR ${subscriptionCreditLedger.endsAt} > NOW()
            )`,
            sql`
              ${subscriptionCreditLedger.amount}
              > ${subscriptionCreditLedger.consumedAmount}
            `,
          ),
        )
        .orderBy(subscriptionCreditLedger.createdAt)
        .for("update");

      for (const credit of addonCredits) {
        if (remaining <= 0) {
          break;
        }

        const available =
          credit.amount - credit.consumedAmount;

        const amountFromAddon = Math.min(
          remaining,
          available,
        );

        const updatedCredit = await tx
          .update(subscriptionCreditLedger)
          .set({
            consumedAmount: sql`
              ${subscriptionCreditLedger.consumedAmount}
              + ${amountFromAddon}
            `,
            updatedAt: new Date(),
          })
          .where(eq(subscriptionCreditLedger.id, credit.id))
          .returning();

        if (!updatedCredit[0]) {
          throw new Error("Unable to consume addon DMs");
        }

        remaining -= amountFromAddon;
        addonConsumed += amountFromAddon;
      }
    }

    if (remaining > 0) {
      throw new Error("Insufficient DM credits");
    }

    return {
      consumed: amount,
      includedConsumed,
      addonConsumed,
    };
  });
};