export const queryKeys = {
    workspaces: {
        all: ["workspaces"] as const,

        detail: (workspaceId: string) =>
            ["workspaces", workspaceId] as const,

        members: (workspaceId: string) =>
            [
                "workspaces",
                workspaceId,
                "members",
            ] as const,
    },

    integrations: {
        all: (workspaceId: string) =>
            [
                "workspaces",
                workspaceId,
                "integrations",
            ] as const,

        detail: (
            workspaceId: string,
            platformAccountId: string,
        ) =>
            [
                "workspaces",
                workspaceId,
                "integrations",
                platformAccountId,
            ] as const,
    },

    automations: {
        all: (workspaceId: string) =>
            [
                "workspaces",
                workspaceId,
                "automations",
            ] as const,

        detail: (
            workspaceId: string,
            automationId: string,
        ) =>
            [
                "workspaces",
                workspaceId,
                "automations",
                automationId,
            ] as const,
    },
};