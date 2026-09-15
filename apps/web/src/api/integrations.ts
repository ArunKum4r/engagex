import apiClient from "./client";

export interface PlatformAccount {
    id: string;
    workspaceId: string;
    platform: string;
    externalAccountId: string;
    name: string | null;
    username: string | null;
    status: string;
    metadata: Record<string, unknown>;
    createdAt: string;
    updatedAt: string;
}

export const getPlatformAccounts = async (
    workspaceId: string,
) => {
    const response =
        await apiClient.get<PlatformAccount[]>(
            `/workspaces/${workspaceId}/integrations`,
        );

    return response.data;
};

export const getPlatformAccount = async (
    workspaceId: string,
    accountId: string,
) => {
    const response =
        await apiClient.get<PlatformAccount>(
            `/workspaces/${workspaceId}/integrations/${accountId}`,
        );

    return response.data;
};