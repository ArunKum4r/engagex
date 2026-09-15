import { Pencil, Trash2 } from "lucide-react";
import { useState } from "react";

import { useWorkspaceStore } from "../../stores/workspace.store";
import Button from "../../components/ui/Button";
import WorkspaceFormModal from "../../components/workspaces/WorkspaceFormModal";

const WorkspaceSettingsPage = () => {
    const currentWorkspace = useWorkspaceStore(
        (state) => state.currentWorkspace,
    );

    const [editModalOpen, setEditModalOpen] =
        useState(false);

    if (!currentWorkspace) {
        return (
            <div className="rounded-xl border border-border bg-surface p-8 text-center">
                <p className="text-sm text-text-secondary">
                    Select a workspace to view its
                    settings.
                </p>
            </div>
        );
    }

    const workspace =
        currentWorkspace.workspace;

    return (
        <div className="w-full space-y-8">
            <div>
                <p className="text-sm font-medium text-accent">
                    Settings
                </p>

                <h1 className="mt-1 text-2xl font-semibold tracking-tight text-text">
                    Workspace
                </h1>

                <p className="mt-2 text-sm text-text-secondary">
                    Manage your workspace settings and
                    configuration.
                </p>
            </div>

            <section className="rounded-xl border border-border bg-surface">
                <div className="flex items-center justify-between gap-4 border-b border-border px-5 py-4">
                    <div>
                        <h2 className="text-sm font-semibold text-text">
                            General
                        </h2>

                        <p className="mt-1 text-sm text-text-secondary">
                            Basic information about your
                            workspace.
                        </p>
                    </div>

                    <Button
                        variant="secondary"
                        onClick={() =>
                            setEditModalOpen(true)
                        }
                    >
                        <Pencil size={16} />
                        Edit
                    </Button>
                </div>

                <div className="divide-y divide-border">
                    <div className="flex flex-col gap-1 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                        <span className="text-sm text-text-secondary">
                            Name
                        </span>

                        <span className="text-sm font-medium text-text">
                            {workspace.name}
                        </span>
                    </div>

                    <div className="flex flex-col gap-1 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                        <span className="text-sm text-text-secondary">
                            Slug
                        </span>

                        <span className="font-mono text-sm text-text">
                            {workspace.slug}
                        </span>
                    </div>

                    <div className="flex flex-col gap-1 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                        <span className="text-sm text-text-secondary">
                            Your role
                        </span>

                        <span className="text-sm font-medium text-text">
                            {currentWorkspace.role}
                        </span>
                    </div>
                </div>
            </section>

            <section className="rounded-xl border border-border bg-surface">
                <div className="border-b border-border px-5 py-4">
                    <h2 className="text-sm font-semibold text-text">
                        Plan
                    </h2>

                    <p className="mt-1 text-sm text-text-secondary">
                        Your current workspace plan.
                    </p>
                </div>

                <div className="flex items-center justify-between gap-4 px-5 py-5">
                    <div>
                        <p className="text-base font-semibold text-text">
                            Current plan
                        </p>

                        <p className="mt-1 text-sm text-text-secondary">
                            Plan management will be
                            available here.
                        </p>
                    </div>

                    <Button
                        variant="secondary"
                        disabled
                    >
                        Manage plan
                    </Button>
                </div>
            </section>

            <section className="rounded-xl border border-border bg-surface">
                <div className="border-b border-border px-5 py-4">
                    <h2 className="text-sm font-semibold text-text">
                        Members
                    </h2>

                    <p className="mt-1 text-sm text-text-secondary">
                        Manage people who have access to
                        this workspace.
                    </p>
                </div>

                <div className="flex items-center justify-between gap-4 px-5 py-5">
                    <div>
                        <p className="text-base font-semibold text-text">
                            Workspace members
                        </p>

                        <p className="mt-1 text-sm text-text-secondary">
                            Invite members and manage
                            workspace roles.
                        </p>
                    </div>

                    <Button
                        variant="secondary"
                        disabled
                    >
                        Manage members
                    </Button>
                </div>
            </section>

            {currentWorkspace.role ===
                "OWNER" && (
                <section className="rounded-xl border border-danger/20 bg-danger/5">
                    <div className="border-b border-danger/10 px-5 py-4">
                        <h2 className="text-sm font-semibold text-danger">
                            Danger zone
                        </h2>

                        <p className="mt-1 text-sm text-text-secondary">
                            Destructive actions for this
                            workspace.
                        </p>
                    </div>

                    <div className="flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <p className="text-sm font-semibold text-text">
                                Delete workspace
                            </p>

                            <p className="mt-1 text-sm text-text-secondary">
                                Permanently delete this
                                workspace and its data.
                            </p>
                        </div>

                        <Button
                            variant="danger"
                            disabled
                        >
                            <Trash2 size={16} />
                            Delete workspace
                        </Button>
                    </div>
                </section>
            )}

            <WorkspaceFormModal
                mode="edit"
                open={editModalOpen}
                workspace={{
                    id: workspace.id,
                    name: workspace.name,
                    slug: workspace.slug,
                }}
                onClose={() =>
                    setEditModalOpen(false)
                }
            />
        </div>
    );
};

export default WorkspaceSettingsPage;