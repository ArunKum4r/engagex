import {
    findActiveUserSubscription,
    findActiveWorkspaceSubscription,
} from "@engagex/db";

export type SubscriptionContext = {
    subscription: {
        id: string;
        planId: string;
        scope: "USER" | "WORKSPACE";
    };
    plan: {
        id: string;
        name: string;
        slug: string;
        type: string;
    };
};

export const resolveSubscription = async ({
    userId,
    workspaceId,
}: {
    userId: string;
    workspaceId?: string;
}): Promise<SubscriptionContext | null> => {
    /*
     * Workspace subscription takes precedence when one exists.
     *
     * This is important for Enterprise:
     *
     * USER subscription
     *        +
     * WORKSPACE subscription
     *        ↓
     * WORKSPACE subscription governs
     *
     * Normal users don't have a workspace subscription,
     * so their USER subscription is used.
     */

    if (workspaceId) {
        const workspaceSubscription =
            await findActiveWorkspaceSubscription(
                workspaceId,
            );

        if (workspaceSubscription) {
            return {
                subscription: {
                    id: workspaceSubscription.subscription.id,
                    planId:
                        workspaceSubscription.subscription.planId,
                    scope: "WORKSPACE",
                },
                plan: {
                    id: workspaceSubscription.plan.id,
                    name: workspaceSubscription.plan.name,
                    slug: workspaceSubscription.plan.slug,
                    type: workspaceSubscription.plan.type,
                },
            };
        }
    }

    const userSubscription =
        await findActiveUserSubscription(userId);

    if (!userSubscription) {
        return null;
    }

    return {
        subscription: {
            id: userSubscription.subscription.id,
            planId:
                userSubscription.subscription.planId,
            scope: "USER",
        },
        plan: {
            id: userSubscription.plan.id,
            name: userSubscription.plan.name,
            slug: userSubscription.plan.slug,
            type: userSubscription.plan.type,
        },
    };
};