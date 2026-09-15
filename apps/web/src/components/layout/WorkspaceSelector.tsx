import { useEffect, useState } from "react";
import { Check, ChevronDown, Pencil, Plus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getWorkspaces } from "../../api/workspace";
import { queryKeys } from "../../lib/query-keys";
import { useWorkspaceStore } from "../../stores/workspace.store";
import WorkspaceFormModal from "../workspaces/WorkspaceFormModal";

const WorkspaceSelector = () => {
    const [open, setOpen] = useState(false);
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);

    const currentWorkspace = useWorkspaceStore(
        (state) => state.currentWorkspace,
    );

    const setCurrentWorkspace = useWorkspaceStore(
        (state) => state.setCurrentWorkspace,
    );

    const {
        data: workspaces = [],
        isLoading,
        isError,
    } = useQuery({
        queryKey: queryKeys.workspaces.all,
        queryFn: getWorkspaces,
    });

    useEffect(() => {
        if (
            !currentWorkspace &&
            workspaces.length > 0
        ) {
            setCurrentWorkspace(workspaces[0]);
        }
    }, [
        currentWorkspace,
        workspaces,
        setCurrentWorkspace,
    ]);

    const handleSelect = (
        workspace: (typeof workspaces)[number],
    ) => {
        setCurrentWorkspace(workspace);
        setOpen(false);
    };

    const workspaceName =
        currentWorkspace?.workspace.name ??
        "No workspace";

    const workspaceInitial =
        workspaceName.charAt(0).toUpperCase();

    return (
        <div className="relative px-3 py-3">
            <button
                type="button"
                onClick={() =>
                    setOpen((value) => !value)
                }
                disabled={isLoading || isError}
                className="flex w-full items-center gap-3 rounded-lg border border-border bg-surface-muted px-3 py-2.5 text-left transition-colors hover:bg-background disabled:cursor-not-allowed disabled:opacity-60"
            >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-accent-soft text-xs font-semibold text-accent">
                    {isLoading ? "..." : workspaceInitial}
                </div>

                <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-text">
                        {isLoading
                            ? "Loading..."
                            : workspaceName}
                    </p>

                    {currentWorkspace && (
                        <p className="truncate text-xs text-text-muted">
                            {currentWorkspace.role}
                        </p>
                    )}
                </div>

                <ChevronDown
                    size={16}
                    className={[
                        "shrink-0 text-text-muted transition-transform",
                        open ? "rotate-180" : "",
                    ].join(" ")}
                />
            </button>

            {open && (
                <>
                    <div className="absolute left-3 right-3 top-full z-50 mt-2 overflow-hidden rounded-lg border border-border bg-surface shadow-lg">
                        <div className="max-h-64 overflow-y-auto p-1.5">
                            {workspaces.map((item) => {
                                const isSelected =
                                    currentWorkspace
                                        ?.workspace.id ===
                                    item.workspace.id;

                                return (
                                    <button
                                        key={
                                            item.workspace.id
                                        }
                                        type="button"
                                        onClick={() =>
                                            handleSelect(
                                                item,
                                            )
                                        }
                                        className="flex w-full items-center gap-3 rounded-md px-2.5 py-2 text-left transition-colors hover:bg-surface-muted"
                                    >
                                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-accent-soft text-xs font-semibold text-accent">
                                            {item.workspace.name
                                                .charAt(0)
                                                .toUpperCase()}
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-medium text-text">
                                                {
                                                    item
                                                        .workspace
                                                        .name
                                                }
                                            </p>

                                            <p className="text-xs text-text-muted">
                                                {item.role}
                                            </p>
                                        </div>

                                        {isSelected && (
                                            <Check
                                                size={16}
                                                className="shrink-0 text-accent"
                                            />
                                        )}
                                    </button>
                                );
                            })}

                            {!isLoading &&
                                workspaces.length ===
                                    0 && (
                                    <div className="px-3 py-6 text-center">
                                        <p className="text-sm font-medium text-text">
                                            No workspaces
                                        </p>

                                        <p className="mt-1 text-xs text-text-muted">
                                            Create your first
                                            workspace to get
                                            started.
                                        </p>
                                    </div>
                                )}
                        </div>

                        <div className="border-t border-border p-1.5">
                            {currentWorkspace && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setOpen(false);
                                        setEditModalOpen(true);
                                    }}
                                    className="flex w-full items-center gap-3 rounded-md px-2.5 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-surface-muted hover:text-text"
                                >
                                    <Pencil
                                        size={16}
                                        className="shrink-0"
                                    />

                                    <span className="truncate">
                                        Edit workspace
                                    </span>
                                </button>
                            )}

                            <button
                                type="button"
                                onClick={() => {
                                    setOpen(false);
                                    setCreateModalOpen(true);
                                }}
                                className="flex w-full items-center gap-3 rounded-md px-2.5 py-2 text-sm font-medium text-accent transition-colors hover:bg-accent/10"
                            >
                                <Plus
                                    size={17}
                                    className="shrink-0"
                                />

                                <span className="truncate">
                                    Create workspace
                                </span>
                            </button>
                        </div>
                    </div>
                </>
            )}
            <WorkspaceFormModal
                            mode="create"
                            open={createModalOpen}
                            onClose={() =>
                                setCreateModalOpen(false)
                            }
                        />

            <WorkspaceFormModal
                mode="edit"
                open={editModalOpen}
                workspace={
                    currentWorkspace
                        ? {
                            id: currentWorkspace.workspace.id,
                            name: currentWorkspace.workspace.name,
                            slug: currentWorkspace.workspace.slug,
                        }
                        : undefined
                }
                onClose={() =>
                    setEditModalOpen(false)
                }
            />
        </div>
    );
};

export default WorkspaceSelector;