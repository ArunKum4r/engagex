import apiClient from "./client";

export interface Workspace {
    id: string;
    name: string;
    slug: string;
    createdAt: string;
    updatedAt: string;
}

export interface WorkspaceWithRole {
    workspace: Workspace;
    role: string;
}

export interface CreateWorkspacePayload {
    name: string;
    slug: string;
}

export interface UpdateWorkspacePayload {
    name?: string;
}

export interface WorkspaceMember {
    membership: {
        id: string;
        workspaceId: string;
        userId: string;
        role: string;
        createdAt: string;
        updatedAt: string;
    };
    user: {
        id: string;
        email: string;
        name: string;
        avatarUrl: string | null;
        status: string;
    };
}

export const getWorkspaces = async () => {
    const response =
        await apiClient.get<WorkspaceWithRole[]>(
            "/workspaces",
        );

    return response.data;
};


export const getWorkspace = async (
    workspaceId: string,
) => {
    const response =
        await apiClient.get<WorkspaceWithRole>(
            `/workspaces/${workspaceId}`,
        );

    return response.data;
};

export const createWorkspace = async (
    payload: CreateWorkspacePayload,
) => {
    const response =
        await apiClient.post<Workspace>(
            "/workspaces",
            payload,
        );

    return response.data;
};

export const updateWorkspace = async ({
    workspaceId,
    payload,
}: {
    workspaceId: string;
    payload: UpdateWorkspacePayload;
}) => {
    const response =
        await apiClient.patch<Workspace>(
            `/workspaces/${workspaceId}`,
            payload,
        );

    return response.data;
};

export const deleteWorkspace = async (
    workspaceId: string,
) => {
    const response =
        await apiClient.delete<Workspace>(
            `/workspaces/${workspaceId}`,
        );

    return response.data;
};

export const getWorkspaceMembers = async (
    workspaceId: string,
) => {
    const response =
        await apiClient.get<WorkspaceMember[]>(
            `/workspaces/${workspaceId}/members`,
        );

    return response.data;
};

export interface AddWorkspaceMemberPayload {
    userId: string;
    role: string;
}

export interface UpdateWorkspaceMemberRolePayload {
    role: string;
}

export const addWorkspaceMember = async ({
    workspaceId,
    payload,
}: {
    workspaceId: string;
    payload: AddWorkspaceMemberPayload;
}) => {
    const response =
        await apiClient.post(
            `/workspaces/${workspaceId}/members`,
            payload,
        );

    return response.data;
};

export const updateWorkspaceMemberRole = async ({
    workspaceId,
    userId,
    payload,
}: {
    workspaceId: string;
    userId: string;
    payload: UpdateWorkspaceMemberRolePayload;
}) => {
    const response =
        await apiClient.patch(
            `/workspaces/${workspaceId}/members/${userId}`,
            payload,
        );

    return response.data;
};

export const removeWorkspaceMember = async ({
    workspaceId,
    userId,
}: {
    workspaceId: string;
    userId: string;
}) => {
    const response =
        await apiClient.delete(
            `/workspaces/${workspaceId}/members/${userId}`,
        );

    return response.data;
};

export interface CreateWorkspaceInvitationPayload {
    email: string;
    role: "MEMBER" | "ADMIN";
}

export interface WorkspaceInvitation {
    id: string;
    email: string;
    role: "MEMBER" | "ADMIN";
    expiresAt: string;
    token: string;
}

export const createWorkspaceInvitation =
    async ({
        workspaceId,
        payload,
    }: {
        workspaceId: string;
        payload: CreateWorkspaceInvitationPayload;
    }) => {
        const response =
            await apiClient.post<WorkspaceInvitation>(
                `/workspaces/${workspaceId}/invitations`,
                payload,
            );

        return response.data;
};

export interface AcceptWorkspaceInvitationPayload {
    token: string;
}

export interface AcceptWorkspaceInvitationResponse {
    message: string;
    workspaceId: string;
    member: WorkspaceMember;
}

export const acceptWorkspaceInvitation = async (
    payload: AcceptWorkspaceInvitationPayload,
) => {
    const response = await apiClient.post<AcceptWorkspaceInvitationResponse>(
        "/workspaces/invitations/accept",
        payload,
    );

    return response.data;
};