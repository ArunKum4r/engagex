import {
    ArrowLeft,
    Eye,
    Pause,
    Pencil,
    Play,
    Trash2,
} from "lucide-react";
import {
    useMutation,
    useQuery,
    useQueryClient,
} from "@tanstack/react-query";
import {
    Link,
    useNavigate,
    useParams,
} from "react-router-dom";

import {
    activateAutomation,
    deleteAutomation,
    getAutomation,
    pauseAutomation,
} from "../../api/automation";
import { queryKeys } from "../../lib/query-keys";
import { useWorkspaceStore } from "../../stores/workspace.store";
import Button from "../../components/ui/Button";
import AutomationBuilder from "../../components/automations/AutomationBuilder";

const AutomationDetailsPage = () => {
    const { automationId } =
        useParams();

    const navigate = useNavigate();
    const queryClient =
        useQueryClient();

    const currentWorkspace =
        useWorkspaceStore(
            (state) =>
                state.currentWorkspace,
        );

    const workspaceId =
        currentWorkspace?.workspace.id;

    const {
        data: automation,
        isLoading,
        isError,
    } = useQuery({
        queryKey:
            workspaceId && automationId
                ? queryKeys.automations.detail(
                      workspaceId,
                      automationId,
                  )
                : [
                      "automations",
                      "none",
                  ],
        queryFn: () =>
            getAutomation({
                workspaceId:
                    workspaceId as string,
                automationId:
                    automationId as string,
            }),
        enabled:
            Boolean(workspaceId) &&
            Boolean(automationId),
    });

    const activateMutation =
        useMutation({
            mutationFn:
                activateAutomation,
            onSuccess: () => {
                if (
                    workspaceId &&
                    automationId
                ) {
                    void queryClient.invalidateQueries(
                        {
                            queryKey:
                                queryKeys.automations.detail(
                                    workspaceId,
                                    automationId,
                                ),
                        },
                    );

                    void queryClient.invalidateQueries(
                        {
                            queryKey:
                                queryKeys.automations.all(
                                    workspaceId,
                                ),
                        },
                    );
                }
            },
        });

    const pauseMutation =
        useMutation({
            mutationFn:
                pauseAutomation,
            onSuccess: () => {
                if (
                    workspaceId &&
                    automationId
                ) {
                    void queryClient.invalidateQueries(
                        {
                            queryKey:
                                queryKeys.automations.detail(
                                    workspaceId,
                                    automationId,
                                ),
                        },
                    );
                }
            },
        });

    const deleteMutation =
        useMutation({
            mutationFn:
                deleteAutomation,
            onSuccess: () => {
                if (workspaceId) {
                    void queryClient.invalidateQueries(
                        {
                            queryKey:
                                queryKeys.automations.all(
                                    workspaceId,
                                ),
                        },
                    );
                }

                navigate(
                    "/automations",
                );
            },
        });

    const handleActivate =
        () => {
            if (
                !workspaceId ||
                !automationId
            ) {
                return;
            }

            activateMutation.mutate({
                workspaceId,
                automationId,
            });
        };

    const handlePause = () => {
        if (
            !workspaceId ||
            !automationId
        ) {
            return;
        }

        pauseMutation.mutate({
            workspaceId,
            automationId,
        });
    };

    const handleDelete =
        () => {
            if (
                !workspaceId ||
                !automationId
            ) {
                return;
            }

            const confirmed =
                window.confirm(
                    "Are you sure you want to delete this automation?",
                );

            if (!confirmed) {
                return;
            }

            deleteMutation.mutate({
                workspaceId,
                automationId,
            });
        };

    if (isLoading) {
        return (
            <div className="rounded-2xl border border-border bg-surface p-8 text-center">
                <p className="text-sm text-text-secondary">
                    Loading automation...
                </p>
            </div>
        );
    }

    if (
        isError ||
        !automation ||
        !workspaceId ||
        !automationId
    ) {
        return (
            <div className="space-y-4">
                <Link
                    to="/automations"
                    className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-text"
                >
                    <ArrowLeft
                        size={16}
                    />
                    Back to automations
                </Link>

                <div className="rounded-2xl border border-danger/20 bg-danger/5 p-8 text-center">
                    <p className="text-sm text-danger">
                        Unable to load this automation.
                    </p>
                </div>
            </div>
        );
    }

    const isActive =
        automation.status ===
        "ACTIVE";

    const isPaused =
        automation.status ===
        "PAUSED";

    return (
        <div className="space-y-6">
            <Link
                to="/automations"
                className="inline-flex items-center gap-2 text-sm text-text-secondary transition-colors hover:text-text"
            >
                <ArrowLeft
                    size={16}
                />
                Back to automations
            </Link>

            <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
                <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-3">
                        <h1 className="text-2xl font-semibold tracking-tight text-text">
                            {
                                automation.name
                            }
                        </h1>

                        <span
                            className={[
                                "rounded-full px-2.5 py-1 text-xs font-medium",
                                isActive
                                    ? "bg-success/10 text-success"
                                    : isPaused
                                      ? "bg-warning/10 text-warning"
                                      : "bg-surface-muted text-text-secondary",
                            ].join(
                                " ",
                            )}
                        >
                            {
                                automation.status
                            }
                        </span>
                    </div>

                    {automation.description && (
                        <p className="mt-2 max-w-2xl text-sm leading-6 text-text-secondary">
                            {
                                automation.description
                            }
                        </p>
                    )}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    {isActive ? (
                        <Button
                            variant="secondary"
                            onClick={
                                handlePause
                            }
                            loading={
                                pauseMutation.isPending
                            }
                        >
                            <Pause
                                size={16}
                            />
                            Pause
                        </Button>
                    ) : (
                        <Button
                            onClick={
                                handleActivate
                            }
                            loading={
                                activateMutation.isPending
                            }
                        >
                            <Play
                                size={16}
                            />
                            Activate
                        </Button>
                    )}

                    <Button
                        variant="secondary"
                        onClick={() =>
                            navigate(
                                `/automations/${automationId}/preview`,
                            )
                        }
                    >
                        <Eye
                            size={16}
                        />
                        Preview
                    </Button>

                    <Button
                        variant="secondary"
                        onClick={() =>
                            navigate(
                                `/automations/${automationId}/edit`,
                            )
                        }
                    >
                        <Pencil
                            size={16}
                        />
                        Edit
                    </Button>

                    <Button
                        variant="danger"
                        onClick={
                            handleDelete
                        }
                        loading={
                            deleteMutation.isPending
                        }
                    >
                        <Trash2
                            size={16}
                        />
                        Delete
                    </Button>
                </div>
            </div>

            <div className="grid min-w-0 gap-6 lg:grid-cols-3">
                <section className="min-w-0 overflow-hidden rounded-2xl border border-border bg-surface lg:col-span-2">
                    <div className="border-b border-border px-5 py-4">
                        <h2 className="text-sm font-semibold text-text">
                            Workflow
                        </h2>

                        <p className="mt-1 text-sm text-text-secondary">
                            View the automation workflow.
                        </p>
                    </div>

                    <AutomationBuilder
                        workspaceId={
                            workspaceId
                        }
                        automationId={
                            automationId
                        }
                        editable={false}
                    />
                </section>

                <aside className="min-w-0 self-start overflow-hidden rounded-2xl border border-border bg-surface">
                    <div className="border-b border-border px-5 py-4">
                        <h2 className="text-sm font-semibold text-text">
                            Details
                        </h2>
                    </div>

                    <div className="space-y-5 p-5">
                        <DetailItem
                            label="Status"
                            value={
                                automation.status
                            }
                        />

                        <DetailItem
                            label="Platform account"
                            value={
                                automation.platformAccountId ??
                                "Not connected"
                            }
                        />

                        <DetailItem
                            label="Created"
                            value={new Date(
                                automation.createdAt,
                            ).toLocaleDateString()}
                        />

                        <DetailItem
                            label="Last updated"
                            value={new Date(
                                automation.updatedAt,
                            ).toLocaleDateString()}
                        />
                    </div>
                </aside>
            </div>
        </div>
    );
};

const DetailItem = ({
    label,
    value,
}: {
    label: string;
    value: string;
}) => (
    <div>
        <p className="text-xs text-text-muted">
            {label}
        </p>

        <p className="mt-1 break-words text-sm font-medium text-text">
            {value}
        </p>
    </div>
);

export default AutomationDetailsPage;