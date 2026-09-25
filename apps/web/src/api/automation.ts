import apiClient from "./client";

export type AutomationExecutionPolicy =
    | "EXCLUSIVE"
    | "ALLOW_MULTIPLE";

export type AutomationTriggerRunPolicy =
    | "EVERY_EVENT"
    | "ONCE_PER_CONTACT"
    | "ONCE_PER_CONVERSATION"
    | "COOLDOWN";

export interface Automation {
    id: string;
    name: string;
    description: string | null;
    status: "DRAFT" | "ACTIVE" | "PAUSED";
    platformAccountId: string | null;
    workspaceId: string;
    createdByUserId: string;

    priority: number;
    executionPolicy: AutomationExecutionPolicy;
    triggerRunPolicy: AutomationTriggerRunPolicy;
    cooldownSeconds: number | null;

    createdAt: string;
    updatedAt: string;
}

export interface AutomationGraphTrigger {
    id: string;
    automationId: string;
    entryStepId: string | null;
    type: string;
    config: Record<string, unknown>;
    createdAt: string;
    updatedAt: string;
}

export interface AutomationGraphStep {
    id: string;
    automationId: string;
    type: string;
    position: number;
    canvasPosition: {
        x: number;
        y: number;
    };
    config: Record<string, unknown>;
    createdAt: string;
    updatedAt: string;
}

export interface AutomationGraphEdge {
    id: string;
    automationId: string;
    fromStepId: string;
    toStepId: string;
    branch: string | null;
    createdAt: string;
}

export interface AutomationGraph {
    automation: Automation;
    triggers: AutomationGraphTrigger[];
    steps: AutomationGraphStep[];
    edges: AutomationGraphEdge[];
}

export const getAutomations = async (
    workspaceId: string,
) => {
    const response =
        await apiClient.get<Automation[]>(
            `/workspaces/${workspaceId}/automations`,
        );

    return response.data;
};

export interface CreateAutomationPayload {
    workspaceId: string;
    name: string;
    description?: string;
    platformAccountId?: string;
}

export const createAutomation = async ({
    workspaceId,
    name,
    description,
    platformAccountId,
}: CreateAutomationPayload) => {
    const response =
        await apiClient.post<Automation>(
            `/workspaces/${workspaceId}/automations`,
            {
                name,
                description,
                platformAccountId,
            },
        );

    return response.data;
};

export interface UpdateAutomationPayload {
    name?: string;
    description?: string;
    platformAccountId?: string;

    priority?: number;
    executionPolicy?: AutomationExecutionPolicy;
    triggerRunPolicy?: AutomationTriggerRunPolicy;
    cooldownSeconds?: number | null;
}

export const getAutomation = async ({
    workspaceId,
    automationId,
}: {
    workspaceId: string;
    automationId: string;
}) => {
    const response =
        await apiClient.get<Automation>(
            `/workspaces/${workspaceId}/automations/${automationId}`,
        );

    return response.data;
};

export const updateAutomation = async ({
    workspaceId,
    automationId,
    payload,
}: {
    workspaceId: string;
    automationId: string;
    payload: UpdateAutomationPayload;
}) => {
    const response =
        await apiClient.patch<Automation>(
            `/workspaces/${workspaceId}/automations/${automationId}`,
            payload,
        );

    return response.data;
};

export const deleteAutomation = async ({
    workspaceId,
    automationId,
}: {
    workspaceId: string;
    automationId: string;
}) => {
    const response =
        await apiClient.delete(
            `/workspaces/${workspaceId}/automations/${automationId}`,
        );

    return response.data;
};

export const activateAutomation = async ({
    workspaceId,
    automationId,
}: {
    workspaceId: string;
    automationId: string;
}) => {
    const response =
        await apiClient.post<Automation>(
            `/workspaces/${workspaceId}/automations/${automationId}/activate`,
        );

    return response.data;
};

export const pauseAutomation = async ({
    workspaceId,
    automationId,
}: {
    workspaceId: string;
    automationId: string;
}) => {
    const response =
        await apiClient.post<Automation>(
            `/workspaces/${workspaceId}/automations/${automationId}/pause`,
        );

    return response.data;
};

export const getAutomationGraph = async (
    workspaceId: string,
    automationId: string,
): Promise<AutomationGraph> => {
    const response = await apiClient.get<AutomationGraph>(
        `/workspaces/${workspaceId}/automations/${automationId}/graph`,
    );

    return response.data;
};

export interface SaveAutomationGraphPayload {
    trigger: {
        type: string;
        entryStepId?: string | null;
        config?: Record<string, unknown>;
    } | null;

    steps: Array<{
        id?: string;
        type: string;
        position?: number;
        config?: Record<string, unknown>;
        canvasPosition?: {
            x: number;
            y: number;
        };
    }>;

    edges: Array<{
        fromStepId: string;
        toStepId: string;
        branch?: string | null;
    }>;
}

export const saveAutomationGraph = async (
    workspaceId: string,
    automationId: string,
    payload: SaveAutomationGraphPayload,
): Promise<AutomationGraph> => {
    const response = await apiClient.put<AutomationGraph>(
        `/workspaces/${workspaceId}/automations/${automationId}/graph`,
        payload,
    );

    return response.data;
};