import {
    countUserWorkspaces,
    countWorkspacePlatforms,
    countWorkspaceAutomations,
    countWorkspaceLeads,
} from "@engagex/db";

import { ENTITLEMENTS } from "@engagex/db";

export const getEntitlementUsage = async ({
    key,
    userId,
    workspaceId,
}: {
    key: string;
    userId: string;
    workspaceId?: string;
}): Promise<number> => {
    switch (key) {
        case ENTITLEMENTS.WORKSPACE_MAX:
            return countUserWorkspaces(userId);

        case ENTITLEMENTS.PLATFORM_MAX:
            if (!workspaceId) {
                return 0;
            }

            return countWorkspacePlatforms(
                workspaceId,
            );

        case ENTITLEMENTS.AUTOMATIONS_MAX:
            if (!workspaceId) {
                return 0;
            }

            return countWorkspaceAutomations(
                workspaceId,
            );

        case ENTITLEMENTS.LEADS_MAX:
            if (!workspaceId) {
                return 0;
            }

            return countWorkspaceLeads(
                workspaceId,
            );

        default:
            return 0;
    }
};