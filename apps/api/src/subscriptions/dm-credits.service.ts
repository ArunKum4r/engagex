import { Injectable, ForbiddenException } from "@nestjs/common";
import {
    createUsagePeriod,
    findUsagePeriod,
    consumeDms,
    getTotalAvailableAddonCredits,
    ENTITLEMENTS,
} from "@engagex/db";
import { SubscriptionsService } from "./subscriptions.service.js";

@Injectable()
export class DmCreditsService {
    constructor(
        private readonly subscriptionsService: SubscriptionsService,
    ) {}

    private getCurrentPeriod() {
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

        const periodEnd = new Date(
            Date.UTC(
                now.getUTCFullYear(),
                now.getUTCMonth() + 1,
                1,
                0,
                0,
                0,
                0,
            ),
        );

        return {
            periodStart,
            periodEnd,
        };
    }

    async getOrCreateCurrentPeriod(
        subscriptionId: string,
    ) {
        const { periodStart, periodEnd } =
            this.getCurrentPeriod();

        const existing = await findUsagePeriod({
            subscriptionId,
            periodStart,
        });

        if (existing) {
            return existing;
        }

        const monthlyDms =
            await this.subscriptionsService.getLimit(
                subscriptionId,
                ENTITLEMENTS.DM_MONTHLY,
            );

        return createUsagePeriod({
            subscriptionId,
            periodStart,
            periodEnd,
            includedDms: monthlyDms,
        });
    }

    async getBalance(subscriptionId: string) {
        const period =
            await this.getOrCreateCurrentPeriod(
                subscriptionId,
            );

        if (!period) {
            throw new ForbiddenException(
                "Unable to initialize DM usage period",
            );
        }

        const monthlyRemaining =
            Math.max(
                0,
                period.includedDms -
                    period.usedIncludedDms,
            );

        const addonBalance =
            await getTotalAvailableAddonCredits(
                subscriptionId,
            );

        return {
            monthlyLimit: period.includedDms,
            monthlyUsed: period.usedIncludedDms,
            monthlyRemaining,
            addonBalance,
            totalRemaining:
                monthlyRemaining +
                addonBalance,
            periodStart: period.periodStart,
            periodEnd: period.periodEnd,
        };
    }

    async consumeDms({
        subscriptionId,
        amount = 1,
    }: {
        subscriptionId: string;
        amount?: number;
    }) {
        if (amount <= 0) {
            throw new ForbiddenException(
                "DM amount must be greater than zero",
            );
        }

        const period =
            await this.getOrCreateCurrentPeriod(
                subscriptionId,
            );

        if (!period) {
            throw new ForbiddenException(
                "Unable to initialize DM usage period",
            );
        }

        const balance =
            await this.getBalance(subscriptionId);

        if (balance.totalRemaining < amount) {
            throw new ForbiddenException(
                "Insufficient DM credits",
            );
        }

        const result = await consumeDms({
            usagePeriodId: period.id,
            amount,
        });

        return {
            ...result,
            remaining:
                balance.totalRemaining -
                amount,
        };
    }
}