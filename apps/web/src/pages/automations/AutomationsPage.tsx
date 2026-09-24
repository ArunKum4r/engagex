import { Plus, Workflow } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Link } from "react-router-dom";

import { getAutomations } from "../../api/automation";
import Button from "../../components/ui/Button";
import CreateAutomationModal from "../../components/automations/CreateAutomationModal";
import { queryKeys } from "../../lib/query-keys";
import { useWorkspaceStore } from "../../stores/workspace.store";

const AutomationsPage = () => {
    const [createModalOpen, setCreateModalOpen] =
        useState(false);

    const currentWorkspace = useWorkspaceStore(
        (state) => state.currentWorkspace,
    );

    const workspaceId =
        currentWorkspace?.workspace.id;

    const {
        data: automations = [],
        isLoading,
        isError,
    } = useQuery({
        queryKey: workspaceId
            ? queryKeys.automations.all(workspaceId)
            : ["automations", "none"],
        queryFn: () =>
            getAutomations(workspaceId as string),
        enabled: Boolean(workspaceId),
    });

    return (
        <>
            <div className="mx-auto w-full max-w-[1600px] space-y-6">
                {/* Page header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div className="min-w-0">
                        <p className="text-sm font-medium text-accent">
                            Workspace
                        </p>

                        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-text sm:text-3xl">
                            Automations
                        </h1>

                        <p className="mt-2 max-w-xl text-sm leading-6 text-text-secondary">
                            Create and manage your automated
                            workflows.
                        </p>
                    </div>

                    <Button
                        onClick={() =>
                            setCreateModalOpen(true)
                        }
                        className="w-full sm:w-auto"
                    >
                        <Plus size={17} />
                        New automation
                    </Button>
                </div>

                {/* Loading */}
                {isLoading && (
                    <div className="overflow-hidden rounded-xl border border-border bg-surface">
                        <div className="divide-y divide-border">
                            {[1, 2, 3].map((item) => (
                                <div
                                    key={item}
                                    className="flex items-center gap-4 px-4 py-4 sm:px-5"
                                >
                                    <div className="h-10 w-10 shrink-0 animate-pulse rounded-lg bg-surface-muted" />

                                    <div className="min-w-0 flex-1 space-y-2">
                                        <div className="h-4 w-40 animate-pulse rounded bg-surface-muted" />
                                        <div className="h-3 w-56 animate-pulse rounded bg-surface-muted" />
                                    </div>

                                    <div className="h-6 w-16 animate-pulse rounded-full bg-surface-muted" />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Error */}
                {isError && (
                    <div className="rounded-xl border border-danger/20 bg-danger/10 px-5 py-8 text-center">
                        <p className="text-sm font-medium text-danger">
                            Unable to load automations.
                        </p>

                        <p className="mt-1 text-sm text-text-secondary">
                            Please try again.
                        </p>
                    </div>
                )}

                {/* Empty state */}
                {!isLoading &&
                    !isError &&
                    automations.length === 0 && (
                    <div className="rounded-xl border border-dashed border-border bg-surface px-5 py-14 text-center sm:px-8">
                        <div className="mx-auto flex max-w-sm flex-col items-center">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent-soft text-accent">
                                <Workflow
                                    size={22}
                                    strokeWidth={1.8}
                                />
                            </div>

                            <h2 className="mt-4 text-base font-semibold text-text">
                                No automations yet
                            </h2>

                            <p className="mt-2 text-sm leading-6 text-text-secondary">
                                Create your first automation
                                to start building automated
                                workflows.
                            </p>

                            <div className="mt-5">
                                <Button
                                        onClick={() =>
                                            setCreateModalOpen(
                                                true,
                                            )
                                        }
                                    >
                                        <Plus size={17} />
                                        Create automation
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}

                {/* Automation list */}
                {!isLoading &&
                    !isError &&
                    automations.length > 0 && (
                        <div className="overflow-hidden rounded-xl border border-border bg-surface">
                        <div className="border-b border-border bg-surface-muted/40 px-4 py-3 sm:px-5">
                            <div className="flex items-center justify-between gap-4">
                                <div>
                                    <p className="text-sm font-semibold text-text">
                                        Your automations
                                    </p>

                                    <p className="mt-0.5 text-xs text-text-secondary">
                                        {automations.length}{" "}
                                        {automations.length ===
                                            1
                                            ? "automation"
                                            : "automations"}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="divide-y divide-border">
                            {automations.map(
                                    (automation) => {
                                        const isActive =
                                            automation.status ===
                                            "ACTIVE";

                                        const isPaused =
                                            automation.status ===
                                            "PAUSED";

                                        return (
                                            <Link
                                                to={`/automations/${automation.id}`}
                                                key={
                                                    automation.id
                                                }
                                                className="group flex min-w-0 items-center gap-3 px-4 py-4 transition-colors hover:bg-surface-muted sm:gap-4 sm:px-5"
                                            >
                                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border bg-background text-text-secondary transition-colors group-hover:border-accent/30 group-hover:bg-accent-soft group-hover:text-accent">
                                                    <Workflow
                                                        size={18}
                                                        strokeWidth={
                                                            1.8
                                                        }
                                                    />
                                                </div>

                                                <div className="min-w-0 flex-1">
                                                    <h2 className="truncate text-sm font-semibold text-text">
                                                        {
                                                            automation.name
                                                        }
                                                    </h2>

                                                    {automation.description ? (
                                                        <p className="mt-1 truncate text-xs text-text-secondary">
                                                            {
                                                                automation.description
                                                            }
                                                        </p>
                                                    ) : (
                                                        <p className="mt-1 text-xs text-text-muted">
                                                            Automated
                                                            workflow
                                                        </p>
                                                    )}
                                                </div>

                                                <span
                                                    className={[
                                                        "flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide",
                                                        isActive
                                                            ? "bg-success/10 text-success"
                                                            : isPaused
                                                                ? "bg-warning/10 text-warning"
                                                                : "bg-surface-muted text-text-secondary",
                                                    ].join(
                                                        " ",
                                                    )}
                                                >
                                                    <span
                                                        className={[
                                                            "h-1.5 w-1.5 rounded-full",
                                                            isActive
                                                                ? "bg-success"
                                                                : isPaused
                                                                    ? "bg-warning"
                                                                    : "bg-text-muted",
                                                        ].join(
                                                            " ",
                                                        )}
                                                    />

                                                    {
                                                        automation.status
                                                    }
                                                </span>
                                            </Link>
                                        );
                                    },
                                )}
                            </div>
                        </div>
                    )}
            </div>

            <CreateAutomationModal
                open={createModalOpen}
                onClose={() =>
                    setCreateModalOpen(false)
                }
            />
        </>
    );
};

export default AutomationsPage;