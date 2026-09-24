import apiClient from "./client";

export interface ContactIdentity {
    id: string;
    workspaceId: string;
    contactId: string;
    platformAccountId: string;
    externalId: string;
    username: string | null;
    displayName: string | null;
    metadata: {
        followerCount?: number;
        isVerifiedUser?: boolean;
        isBusinessFollowUser?: boolean;
        isUserFollowBusiness?: boolean;
        [key: string]: unknown;
    };
    createdAt: string;
    updatedAt: string;
}

export interface ContactMessage {
    id: string;
    conversationId: string;
    senderContactId: string | null;
    senderUserId: string | null;
    direction: string;
    type: string;
    content: string | null;
    externalMessageId: string | null;
    source: string;
    metadata: Record<string, unknown>;
    createdAt: string;
}

export interface ContactConversation {
    id: string;
    workspaceId: string;
    contactId: string;
    platformAccountId: string;
    externalConversationId: string | null;
    status: string;
    lastMessageAt: string | null;
    assignedToUserId: string | null;
    unreadCount: number;
    closedAt: string | null;
    createdAt: string;
    updatedAt: string;
    messages: ContactMessage[];
}

export interface Contact {
    id: string;
    workspaceId: string;
    name: string | null;
    email: string | null;
    phone: string | null;
    avatarUrl: string | null;
    notes: string | null;
    createdAt: string;
    updatedAt: string;
    identities: ContactIdentity[];
    conversations?: ContactConversation[];
}

export interface ContactsPagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface ContactsResponse {
    items: Contact[];
    pagination: ContactsPagination;
}

export interface CreateContactPayload {
    name?: string;
    email?: string;
    phone?: string;
    avatarUrl?: string;
    notes?: string;
}

export interface UpdateContactPayload {
    name?: string | null;
    email?: string | null;
    phone?: string | null;
    avatarUrl?: string | null;
    notes?: string | null;
}

export const getContacts = async ({
    workspaceId,
    page = 1,
    limit = 20,
    search,
}: {
    workspaceId: string;
    page?: number;
    limit?: number;
    search?: string;
}): Promise<ContactsResponse> => {
    const response =
        await apiClient.get<ContactsResponse>(
            `/workspaces/${workspaceId}/contacts`,
            {
                params: {
                    page,
                    limit,
                    ...(search?.trim()
                        ? {
                            search: search.trim(),
                        }
                        : {}),
                },
            },
        );

    return response.data;
};

export const getContact = async ({
    workspaceId,
    contactId,
}: {
    workspaceId: string;
    contactId: string;
}): Promise<Contact> => {
    const response =
        await apiClient.get<Contact>(
            `/workspaces/${workspaceId}/contacts/${contactId}`,
        );

    return response.data;
};

export const createContact = async ({
    workspaceId,
    payload,
}: {
    workspaceId: string;
    payload: CreateContactPayload;
}): Promise<Contact> => {
    const response =
        await apiClient.post<Contact>(
            `/workspaces/${workspaceId}/contacts`,
            payload,
        );

    return response.data;
};

export const updateContact = async ({
    workspaceId,
    contactId,
    payload,
}: {
    workspaceId: string;
    contactId: string;
    payload: UpdateContactPayload;
}): Promise<Contact> => {
    const response =
        await apiClient.patch<Contact>(
            `/workspaces/${workspaceId}/contacts/${contactId}`,
            payload,
        );

    return response.data;
};

export const deleteContact = async ({
    workspaceId,
    contactId,
}: {
    workspaceId: string;
    contactId: string;
}) => {
    const response =
        await apiClient.delete(
            `/workspaces/${workspaceId}/contacts/${contactId}`,
        );

    return response.data;
};