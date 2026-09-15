import {
    ArrowLeft,
    MessageCircle,
} from "lucide-react";
import {
    useQuery,
} from "@tanstack/react-query";
import {
    Link,
    useParams,
} from "react-router-dom";
import {
    useState,
} from "react";

import {
    getAutomationGraph,
} from "../../api/automation";
import { queryKeys } from "../../lib/query-keys";
import { useWorkspaceStore } from "../../stores/workspace.store";

const AutomationPreviewPage = () => {
    const { automationId } =
        useParams<{
            automationId: string;
        }>();

    const workspace =
        useWorkspaceStore(
            (state) =>
                state.currentWorkspace,
        );

    const workspaceId =
        workspace?.workspace.id;

    const [mode, setMode] =
        useState<
            "workflow" | "mobile"
        >("workflow");

    const {
        data,
        isLoading,
        isError,
    } = useQuery({
        queryKey:
            workspaceId &&
            automationId
                ? [
                      ...queryKeys.automations.detail(
                          workspaceId,
                          automationId,
                      ),
                      "graph",
                  ]
                : [
                      "automation-preview",
                      "none",
                  ],
        queryFn: () =>
            getAutomationGraph(
                workspaceId as string,
                automationId as string,
            ),
        enabled:
            Boolean(workspaceId) &&
            Boolean(automationId),
    });

    if (isLoading) {
        return (
            <div className="rounded-2xl border border-border bg-surface p-8 text-center">
                <p className="text-sm text-text-secondary">
                    Loading preview...
                </p>
            </div>
        );
    }

    if (
        isError ||
        !data ||
        !workspaceId ||
        !automationId
    ) {
        return (
            <div className="rounded-2xl border border-danger/20 bg-danger/5 p-8 text-center">
                <p className="text-sm text-danger">
                    Unable to load automation preview.
                </p>
            </div>
        );
    }

    const trigger =
        data.triggers[0];

    const steps =
        [...data.steps].sort(
            (a, b) =>
                a.position -
                b.position,
        );

    return (
        <div className="space-y-5">
            <Link
                to={`/automations/${automationId}`}
                className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-text"
            >
                <ArrowLeft
                    size={16}
                />
                Back to automation
            </Link>

            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                    <p className="text-xs text-text-secondary">
                        Preview
                    </p>

                    <h1 className="mt-1 text-2xl font-semibold text-text">
                        {
                            data.automation
                                .name
                        }
                    </h1>
                </div>

                <div className="flex rounded-xl border border-border bg-surface p-1">
                    <button
                        type="button"
                        onClick={() =>
                            setMode(
                                "workflow",
                            )
                        }
                        className={[
                            "rounded-lg px-4 py-2 text-sm font-medium",
                            mode ===
                            "workflow"
                                ? "bg-surface-muted text-text shadow-sm"
                                : "text-text-secondary hover:text-text",
                        ].join(
                            " ",
                        )}
                    >
                        Workflow
                    </button>

                    <button
                        type="button"
                        onClick={() =>
                            setMode(
                                "mobile",
                            )
                        }
                        className={[
                            "rounded-lg px-4 py-2 text-sm font-medium",
                            mode ===
                            "mobile"
                                ? "bg-surface-muted text-text shadow-sm"
                                : "text-text-secondary hover:text-text",
                        ].join(
                            " ",
                        )}
                    >
                        Mobile
                    </button>
                </div>
            </div>

            {mode ===
            "workflow" ? (
                <div className="rounded-2xl border border-border bg-surface p-8">
                    <div className="mx-auto flex max-w-[520px] flex-col items-center">
                        {trigger && (
                            <PreviewCard
                                category="Trigger"
                                title={formatType(
                                    trigger.type,
                                )}
                                description="Starts the automation."
                                icon={
                                    MessageCircle
                                }
                                primary
                            />
                        )}

                        {steps.map(
                            (
                                step,
                                index,
                            ) => (
                                <div
                                    key={
                                        step.id
                                    }
                                    className="flex w-full flex-col items-center"
                                >
                                    <div className="h-10 w-px bg-border" />

                                    <PreviewCard
                                        category={
                                            getCategory(
                                                step.type,
                                            )
                                        }
                                        title={formatType(
                                            step.type,
                                        )}
                                        description={getStepDescription(
                                            step.config,
                                            step.type,
                                        )}
                                        icon={
                                            MessageCircle
                                        }
                                    />

                                    {index ===
                                        steps.length -
                                            1 && (
                                        <div className="mt-5 text-xs text-text-muted">
                                            End of workflow
                                        </div>
                                    )}
                                </div>
                            ),
                        )}

                        {!trigger &&
                            steps.length ===
                                0 && (
                                <p className="text-sm text-text-secondary">
                                    This automation does not have a workflow yet.
                                </p>
                            )}
                    </div>
                </div>
            ) : (
                <MobilePreview
                    trigger={
                        trigger?.type ??
                        "Instagram Comment"
                    }
                    steps={
                        steps
                    }
                />
            )}
        </div>
    );
};

const PreviewCard = ({
    category,
    title,
    description,
    icon: Icon,
    primary = false,
}: {
    category: string;
    title: string;
    description: string;
    icon: typeof MessageCircle;
    primary?: boolean;
}) => (
    <div
        className={[
            "w-full rounded-2xl border p-5",
            primary
                ? "border-primary/30 bg-primary/5"
                : "border-border bg-surface-muted",
        ].join(" ")}
    >
        <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Icon
                    size={18}
                />
            </div>

            <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-primary">
                    {category}
                </p>

                <p className="mt-1 text-sm font-semibold text-text">
                    {title}
                </p>
            </div>
        </div>

        <p className="mt-3 text-sm leading-6 text-text-secondary">
            {description}
        </p>
    </div>
);

const MobilePreview = ({
    trigger,
    steps,
}: {
    trigger: string;
    steps: Array<{
        type: string;
        config: Record<
            string,
            unknown
        >;
    }>;
}) => {
    return (
        <div className="flex min-h-[680px] items-center justify-center rounded-2xl border border-border bg-surface p-8">
            <div className="w-[340px] overflow-hidden rounded-[40px] border-[8px] border-background bg-background shadow-2xl">
                <div className="bg-surface-muted px-5 py-4">
                    <div className="mx-auto mb-4 h-1.5 w-16 rounded-full bg-border" />

                    <p className="text-sm font-semibold text-text">
                        Instagram
                    </p>
                </div>

                <div className="min-h-[560px] space-y-4 bg-background p-4">
                    <div className="flex justify-end">
                        <div className="max-w-[80%] rounded-2xl rounded-br-md bg-primary px-4 py-3 text-sm text-primary-foreground">
                            {formatType(
                                trigger,
                            )}
                        </div>
                    </div>

                    {steps.map(
                        (
                            step,
                            index,
                        ) => {
                            if (
                                step.type ===
                                "WAIT"
                            ) {
                                return (
                                    <div
                                        key={
                                            index
                                        }
                                        className="text-center text-xs text-text-muted"
                                    >
                                        Waiting...
                                    </div>
                                );
                            }

                            if (
                                step.type ===
                                "SEND_DM"
                            ) {
                                return (
                                    <div
                                        key={
                                            index
                                        }
                                        className="flex justify-start"
                                    >
                                        <div className="max-w-[80%] rounded-2xl rounded-bl-md bg-surface-muted px-4 py-3 text-sm text-text">
                                            {String(
                                                step
                                                    .config
                                                    .message ??
                                                    "Message",
                                            )}
                                        </div>
                                    </div>
                                );
                            }

                            if (
                                step.type ===
                                "REPLY_COMMENT"
                            ) {
                                return (
                                    <div
                                        key={
                                            index
                                        }
                                        className="rounded-xl border border-border bg-surface-muted p-3 text-xs text-text-secondary"
                                    >
                                        Public reply:{" "}
                                        {String(
                                            step
                                                .config
                                                .message ??
                                                "Reply",
                                        )}
                                    </div>
                                );
                            }

                            return (
                                <div
                                    key={
                                        index
                                    }
                                    className="rounded-xl border border-border bg-surface-muted p-3 text-xs text-text-secondary"
                                >
                                    {
                                        formatType(
                                            step.type,
                                        )
                                    }
                                </div>
                            );
                        },
                    )}
                </div>
            </div>
        </div>
    );
};

const getCategory = (
    type: string,
) => {
    if (
        type ===
            "KEYWORD_MATCH" ||
        type ===
            "FOLLOWER_STATUS"
    ) {
        return "Condition";
    }

    if (type === "WAIT") {
        return "Flow";
    }

    return "Action";
};

const formatType = (
    value: string,
) =>
    value
        .replaceAll(
            "_",
            " ",
        )
        .toLowerCase()
        .replace(
            /^./,
            (char) =>
                char.toUpperCase(),
        );

const getStepDescription = (
    config: Record<
        string,
        unknown
    >,
    type: string,
) => {
    switch (type) {
        case "KEYWORD_MATCH":
            return config.keyword
                ? `Keyword: ${String(config.keyword)}`
                : "Keyword condition";

        case "FOLLOWER_STATUS":
            return config.condition ===
                "FOLLOWING"
                ? "Person follows the account"
                : "Person does not follow the account";

        case "SEND_DM":
            return config.message
                ? String(
                      config.message,
                  )
                : "Send private message";

        case "REPLY_COMMENT":
            return config.message
                ? String(
                      config.message,
                  )
                : "Reply to comment";

        case "WAIT":
            return config.duration
                ? `Wait ${String(config.duration)} ${String(config.unit ?? "MINUTES").toLowerCase()}`
                : "Wait before continuing";

        default:
            return "Workflow step";
    }
};

export default AutomationPreviewPage;