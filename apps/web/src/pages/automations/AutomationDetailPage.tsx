import { useState, useEffect } from "react";
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
    updateAutomation,
    type AutomationExecutionPolicy,
    type AutomationTriggerRunPolicy,
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

    const [actionError, setActionError] = useState<string | null>(null);
    const [priority, setPriority] = useState(0);
    const [executionPolicy, setExecutionPolicy] = useState<AutomationExecutionPolicy>("EXCLUSIVE");
    const [triggerRunPolicy, setTriggerRunPolicy] = useState<AutomationTriggerRunPolicy>("EVERY_EVENT");
    const [cooldownSeconds, setCooldownSeconds] = useState<number | null>(null);

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

    useEffect(() => {
        if (!automation) {
            return;
        }

        setPriority(automation.priority);
        setExecutionPolicy(automation.executionPolicy);
        setTriggerRunPolicy(automation.triggerRunPolicy);
        setCooldownSeconds(automation.cooldownSeconds);
    }, [automation]);

    const activateMutation =
        useMutation({
            mutationFn:
                activateAutomation,
            onMutate: () => {
                setActionError(null);
            },
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
            onError: (error) => {
                setActionError(
                    error instanceof Error
                        ? error.message
                        : "Unable to activate automation.",
                );
            },
        });

    const pauseMutation =
        useMutation({
            mutationFn:
                pauseAutomation,
            onMutate: () => {
                setActionError(null);
            },
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
            onError: (error) => {
                setActionError(
                    error instanceof Error
                        ? error.message
                        : "Unable to pause automation.",
                );
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
            onError: (error) => {
                setActionError(
                    error instanceof Error
                        ? error.message
                        : "Unable to delete automation.",
                );
            },
        });

    const settingsMutation = useMutation({
        mutationFn: () =>
            updateAutomation({
                workspaceId: workspaceId as string,
                automationId: automationId as string,
                payload: {
                    priority,
                    executionPolicy,
                    triggerRunPolicy,
                    cooldownSeconds:
                        triggerRunPolicy === "COOLDOWN"
                            ? cooldownSeconds
                            : null,
                },
            }),
        onMutate: () => {
            setActionError(null);
        },
        onSuccess: () => {
            if (workspaceId && automationId) {
                void queryClient.invalidateQueries({
                    queryKey: queryKeys.automations.detail(
                        workspaceId,
                        automationId,
                    ),
                });

                void queryClient.invalidateQueries({
                    queryKey: queryKeys.automations.all(
                        workspaceId,
                    ),
                });
            }
        },
        onError: (error) => {
            setActionError(
                error instanceof Error
                    ? error.message
                    : "Unable to save automation settings.",
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
            setActionError(null);

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
        <div className="space-y-5 sm:space-y-6">
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

                <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
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

                    {!isActive && (
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
                    )}

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

            {actionError && (
                <div className="rounded-xl border border-danger/20 bg-danger/5 px-4 py-3 text-sm text-danger">
                    {actionError}
                </div>
            )}

            <div className="grid min-w-0 gap-6 lg:grid-cols-3">
                <section className="min-w-0 overflow-hidden rounded-2xl border border-border bg-surface shadow-sm lg:col-span-2">
                    <div className="border-b border-border bg-surface/80 px-4 py-4 sm:px-5">
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

                <aside className="min-w-0 self-start overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
                    <div className="border-b border-border bg-surface/80 px-4 py-4 sm:px-5">
                        <h2 className="text-sm font-semibold text-text">
                            Details
                        </h2>
                    </div>

                    <div className="grid gap-5 p-4 sm:p-5">
                        <DetailItem
                            label="Status"
                            value={automation.status}
                        />

                        <DetailItem
                            label="Platform account"
                            value={
                                automation.platformAccountId ??
                                "Not connected"
                            }
                        />

                        <div>
                            <label
                                htmlFor="automation-priority"
                                className="text-xs font-medium text-text-muted"
                            >
                                Priority
                            </label>

                            <input
                                id="automation-priority"
                                type="number"
                                min={0}
                                value={priority}
                                onChange={(event) =>
                                    setPriority(
                                        Number(event.target.value),
                                    )
                                }
                                className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                            />

                            <p className="mt-1 text-xs text-text-muted">
                                Higher priority automations are considered first.
                            </p>
                        </div>

                        <div>
                            <label
                                htmlFor="automation-execution-policy"
                                className="text-xs font-medium text-text-muted"
                            >
                                Execution policy
                            </label>

                            <select
                                id="automation-execution-policy"
                                value={executionPolicy}
                                onChange={(event) =>
                                    setExecutionPolicy(
                                        event.target.value as AutomationExecutionPolicy,
                                    )
                                }
                                className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                            >
                                <option value="EXCLUSIVE">
                                    Exclusive
                                </option>
                                <option value="ALLOW_MULTIPLE">
                                    Allow multiple
                                </option>
                            </select>

                            <p className="mt-1 text-xs text-text-muted">
                                Controls whether this automation can run alongside competing automations.
                            </p>
                        </div>

                        <div>
                            <label
                                htmlFor="automation-trigger-run-policy"
                                className="text-xs font-medium text-text-muted"
                            >
                                Trigger run policy
                            </label>

                            <select
                                id="automation-trigger-run-policy"
                                value={triggerRunPolicy}
                                onChange={(event) =>
                                    setTriggerRunPolicy(
                                        event.target.value as AutomationTriggerRunPolicy,
                                    )
                                }
                                className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                            >
                                <option value="EVERY_EVENT">
                                    Every event
                                </option>
                                <option value="ONCE_PER_CONTACT">
                                    Once per contact
                                </option>
                                <option value="ONCE_PER_CONVERSATION">
                                    Once per conversation
                                </option>
                                <option value="COOLDOWN">
                                    Cooldown
                                </option>
                            </select>
                        </div>

                        {triggerRunPolicy === "COOLDOWN" && (
                            <div>
                                <label
                                    htmlFor="automation-cooldown"
                                    className="text-xs font-medium text-text-muted"
                                >
                                    Cooldown seconds
                                </label>

                                <input
                                    id="automation-cooldown"
                                    type="number"
                                    min={1}
                                    value={cooldownSeconds ?? ""}
                                    onChange={(event) => {
                                        const value = event.target.value;

                                        setCooldownSeconds(
                                            value === ""
                                                ? null
                                                : Number(value),
                                        );
                                    }}
                                    placeholder="3600"
                                    className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                                />

                                <p className="mt-1 text-xs text-text-muted">
                                    Minimum time between runs for the same contact.
                                </p>
                            </div>
                        )}

                        <Button
                            className="w-full"
                            onClick={() =>
                                settingsMutation.mutate()
                            }
                            loading={settingsMutation.isPending}
                        >
                            Save settings
                        </Button>

                        <div className="border-t border-border pt-5">
                            <DetailItem
                                label="Created"
                                value={new Date(
                                    automation.createdAt,
                                ).toLocaleDateString()}
                            />

                            <div className="mt-5">
                                <DetailItem
                                    label="Last updated"
                                    value={new Date(
                                        automation.updatedAt,
                                    ).toLocaleDateString()}
                                />
                            </div>
                        </div>
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