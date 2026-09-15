import { create } from "zustand";

import type { WorkspaceWithRole } from "../api/workspace";

interface WorkspaceState {
    currentWorkspace: WorkspaceWithRole | null;

    setCurrentWorkspace: (
        workspace: WorkspaceWithRole | null,
    ) => void;

    clearWorkspace: () => void;
}

export const useWorkspaceStore =
    create<WorkspaceState>((set) => ({
        currentWorkspace: null,

        setCurrentWorkspace: (workspace) =>
            set({
                currentWorkspace: workspace,
            }),

        clearWorkspace: () =>
            set({
                currentWorkspace: null,
            }),
    }));