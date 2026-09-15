import { Plus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getAutomations } from "../../api/automation";
import { queryKeys } from "../../lib/query-keys";
import { useWorkspaceStore } from "../../stores/workspace.store";
import Button from "../../components/ui/Button";
import { useState } from "react";
import CreateAutomationModal from "../../components/automations/CreateAutomationModal";
import { Link } from "react-router-dom";

const AutomationsPage = () => {
    const [ createModalOpen, setCreateModalOpen ] = useState(false);
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
        <div className="space-y-6">
            <div className="flex items-center justify-between gap-4">
                <div>
                    <p className="text-sm font-medium text-accent">
                        Workspace
                    </p>

                    <h1 className="mt-1 text-2xl font-semibold tracking-tight text-text">
                        Automations
                    </h1>

                    <p className="mt-2 text-sm text-text-secondary">
                        Create and manage your automated
                        workflows.
                    </p>
                </div>

                <Button
                    onClick={() => setCreateModalOpen(true)}
                >
                    <Plus size={17} />
                    New automation
                </Button>
            </div>

            {isLoading && (
                <div className="rounded-xl border border-border bg-surface p-8 text-center">
                    <p className="text-sm text-text-secondary">
                        Loading automations...
                    </p>
                </div>
            )}

            {isError && (
                <div className="rounded-xl border border-danger/20 bg-danger/10 p-8 text-center">
                    <p className="text-sm text-danger">
                        Unable to load automations.
                    </p>
                </div>
            )}

            {!isLoading &&
                !isError &&
                automations.length === 0 && (
                    <div className="rounded-xl border border-dashed border-border bg-surface p-12 text-center">
                        <div className="mx-auto max-w-sm">
                            <h2 className="text-base font-semibold text-text">
                                No automations yet
                            </h2>

                            <p className="mt-2 text-sm leading-6 text-text-secondary">
                                Create your first automation
                                to start building automated
                                workflows.
                            </p>

                            <div className="mt-5">
                                <Button
                                    onClick={() => setCreateModalOpen(true)}
                                >
                                    <Plus size={17} />
                                    Create automation
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

            {!isLoading &&
                !isError &&
                automations.length > 0 && (
                    <div className="overflow-hidden rounded-xl border border-border bg-surface">
                        <div className="divide-y divide-border">
                            {automations.map(
                                (automation) => (
                                    <Link
                                        to={`/automations/${automation.id}`}
                                        key={ automation.id }
                                        className="flex items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-surface-muted"
                                    >
                                        <div className="min-w-0">
                                            <h2 className="truncate text-sm font-medium text-text">
                                                {
                                                    automation.name
                                                }
                                            </h2>

                                            {automation.description && (
                                                <p className="mt-1 truncate text-xs text-text-secondary">
                                                    {
                                                        automation.description
                                                    }
                                                </p>
                                            )}
                                        </div>

                                        <span
                                            className={[
                                                "shrink-0 rounded-full px-2.5 py-1 text-xs font-medium",
                                                automation.status ===
                                                "ACTIVE"
                                                    ? "bg-success/10 text-success"
                                                    : automation.status ===
                                                        "PAUSED"
                                                      ? "bg-warning/10 text-warning"
                                                      : "bg-surface-muted text-text-secondary",
                                            ].join(" ")}
                                        >
                                            {
                                                automation.status
                                            }
                                        </span>
                                    </Link>
                                ),
                            )}
                        </div>
                    </div>
                )}
                <CreateAutomationModal
                    open={createModalOpen}
                    onClose={() =>
                        setCreateModalOpen(false)
                    }
                />
        </div>
    );
};

export default AutomationsPage;