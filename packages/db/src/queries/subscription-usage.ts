import { count, eq } from "drizzle-orm";
import { db } from "../client.js";
import {
  workspaces,
  platformAccounts,
  automations,
  leads,
} from "../schema/index.js";

export const countUserWorkspaces = async (userId: string) => {
  const result = await db
    .select({ count: count() })
    .from(workspaces)
    .where(eq(workspaces.ownerId, userId));

  return Number(result[0]?.count ?? 0);
};

export const countWorkspacePlatforms = async (workspaceId: string) => {
  const result = await db
    .select({ count: count() })
    .from(platformAccounts)
    .where(eq(platformAccounts.workspaceId, workspaceId));

  return Number(result[0]?.count ?? 0);
};

export const countWorkspaceAutomations = async (workspaceId: string) => {
  const result = await db
    .select({ count: count() })
    .from(automations)
    .where(eq(automations.workspaceId, workspaceId));

  return Number(result[0]?.count ?? 0);
};

export const countWorkspaceLeads = async (workspaceId: string) => {
  const result = await db
    .select({ count: count() })
    .from(leads)
    .where(eq(leads.workspaceId, workspaceId));

  return Number(result[0]?.count ?? 0);
};

export const getEntitlementUsage = async ({
  key,
  userId,
  workspaceId,
}: {
  key: string;
  userId: string;
  workspaceId?: string;
}) => {
  switch (key) {
    case "workspace.max":
      return countUserWorkspaces(userId);

    case "platform.max":
      if (!workspaceId) {
        return 0;
      }

      return countWorkspacePlatforms(workspaceId);

    case "automations.max":
      if (!workspaceId) {
        return 0;
      }

      return countWorkspaceAutomations(workspaceId);

    case "leads.max":
      if (!workspaceId) {
        return 0;
      }

      return countWorkspaceLeads(workspaceId);

    default:
      return 0;
  }
};