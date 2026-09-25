import apiClient from "./client";

export type ContactAutomationPause = {
    id: string;
    workspaceId: string;
    contactId: string;
    automationId: string | null;
    pausedByUserId: string;
    reason: string | null;
    pausedAt: string;
    resumeAt: string | null;
    createdAt: string;
    updatedAt: string;
};

export type PauseContactAutomationPayload = {
    automationId?: string;
    reason?: string;
    resumeAt?: string;
};

export async function getContactAutomationPauses(params: {
    workspaceId: string;
    contactId: string;
}) {
    const response = await apiClient.get<ContactAutomationPause[]>(
        `/workspaces/${params.workspaceId}/contacts/${params.contactId}/automation-pauses`,
    );

    return response.data;
}

export async function pauseContactAutomations(params: {
    workspaceId: string;
    contactId: string;
    data: PauseContactAutomationPayload;
}) {
    const response = await apiClient.post<ContactAutomationPause>(
        `/workspaces/${params.workspaceId}/contacts/${params.contactId}/automation-pauses`,
        params.data,
    );

    return response.data;
}

export async function resumeContactAutomation(params: {
    workspaceId: string;
    contactId: string;
    automationId?: string;
}) {
    const query = params.automationId
        ? `?automationId=${params.automationId}`
        : "";

    await apiClient.delete(
        `/workspaces/${params.workspaceId}/contacts/${params.contactId}/automation-pauses${query}`,
    );
}