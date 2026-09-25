import apiClient from "./client";

export interface PlatformAccount {
    id: string;
    workspaceId: string;
    platform: string;
    platformId: string | null;
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

export interface InstagramMedia {
    id: string;
    type: "POST" | "REEL";
    title: string | null;
    thumbnail: string | null;
    permalink: string | null;
    publishedAt: string | null;
}

interface InstagramMediaApiItem {
    id: string;
    caption?: string | null;
    media_type?: string | null;
    media_product_type?: string | null;
    thumbnail_url?: string | null;
    media_url?: string | null;
    permalink?: string | null;
    timestamp?: string | null;
}

interface InstagramMediaApiResponse {
    data?: InstagramMediaApiItem[];
}

export const getInstagramMedia = async (
    workspaceId: string,
    platformAccountId: string,
): Promise<InstagramMedia[]> => {
    const response =
        await apiClient.get<InstagramMediaApiResponse>(
            `/workspaces/${workspaceId}/integrations/instagram/${platformAccountId}/media`,
        );

    return (response.data.data ?? []).map((media) => ({
        id: media.id,
        type:
            media.media_product_type === "REELS"
                ? "REEL"
                : "POST",
        title: media.caption ?? null,
        thumbnail:
            media.thumbnail_url ??
            media.media_url ??
            null,
        permalink: media.permalink ?? null,
        publishedAt: media.timestamp ?? null,
    }));
};