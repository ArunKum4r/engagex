import apiClient from "./client";

export type MessageType =
    | "TEXT"
    | "IMAGE"
    | "VIDEO"
    | "AUDIO"
    | "FILE";

export interface SendConversationMessagePayload {
    type?: MessageType;
    content: string;
}

export interface ConversationMessage {
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

export const sendConversationMessage = async ({
    workspaceId,
    conversationId,
    payload,
}: {
    workspaceId: string;
    conversationId: string;
    payload: SendConversationMessagePayload;
}): Promise<ConversationMessage> => {
    const response =
        await apiClient.post<ConversationMessage>(
            `/workspaces/${workspaceId}/conversations/${conversationId}/messages`,
            {
                type: payload.type ?? "TEXT",
                content: payload.content,
            },
        );

    return response.data;
};

export interface ConversationContact {
    id: string;
    workspaceId: string;
    name: string | null;
    email: string | null;
    phone: string | null;
    avatarUrl: string | null;
    notes: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface ConversationSummary {
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
    contact: ConversationContact | null;
}

export interface ConversationsPagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface ConversationsResponse {
    items: ConversationSummary[];
    pagination: ConversationsPagination;
}

export const getConversations = async ({
    workspaceId,
    page = 1,
    limit = 20,
    status,
}: {
    workspaceId: string;
    page?: number;
    limit?: number;
    status?: string;
}): Promise<ConversationsResponse> => {
    const response =
        await apiClient.get<ConversationsResponse>(
            `/workspaces/${workspaceId}/conversations`,
            {
                params: {
                    page,
                    limit,
                    ...(status
                        ? { status }
                        : {}),
                },
            },
        );

    return response.data;
};

export interface ConversationDetails
    extends ConversationSummary {
    messages: ConversationMessage[];
}

export const getConversation = async ({
    workspaceId,
    conversationId,
}: {
    workspaceId: string;
    conversationId: string;
}): Promise<ConversationDetails> => {
    const response =
        await apiClient.get<ConversationDetails>(
            `/workspaces/${workspaceId}/conversations/${conversationId}`,
        );

    return response.data;
};

export type ConversationReminder = {
    id: string;
    conversationId: string;
    createdByUserId: string;
    title: string;
    description: string | null;
    remindAt: string;
    status:
        | "PENDING"
        | "COMPLETED"
        | "CANCELLED";
    completedAt: string | null;
    createdAt: string;
    updatedAt: string;
};

export type CreateConversationReminderPayload = {
    title: string;
    description?: string;
    remindAt: string;
};

export async function getConversationReminders(
    params: {
        workspaceId: string;
        conversationId: string;
    },
) {
    const response =
        await apiClient.get<ConversationReminder[]>(
            `/workspaces/${params.workspaceId}/conversations/${params.conversationId}/reminders`,
        );

    return response.data;
}

export async function createConversationReminder(
    params: {
        workspaceId: string;
        conversationId: string;
        data: CreateConversationReminderPayload;
    },
) {
    const response =
        await apiClient.post<ConversationReminder>(
            `/workspaces/${params.workspaceId}/conversations/${params.conversationId}/reminders`,
            params.data,
        );

    return response.data;
}

export async function completeConversationReminder(
    params: {
        workspaceId: string;
        conversationId: string;
        reminderId: string;
    },
) {
    const response =
        await apiClient.patch<ConversationReminder>(
            `/workspaces/${params.workspaceId}/conversations/${params.conversationId}/reminders/${params.reminderId}/complete`,
        );

    return response.data;
}

export async function cancelConversationReminder(
    params: {
        workspaceId: string;
        conversationId: string;
        reminderId: string;
    },
) {
    const response =
        await apiClient.patch<ConversationReminder>(
            `/workspaces/${params.workspaceId}/conversations/${params.conversationId}/reminders/${params.reminderId}/cancel`,
        );

    return response.data;
}

export async function deleteConversationReminder(
    params: {
        workspaceId: string;
        conversationId: string;
        reminderId: string;
    },
) {
    await apiClient.delete(
        `/workspaces/${params.workspaceId}/conversations/${params.conversationId}/reminders/${params.reminderId}`,
    );
}