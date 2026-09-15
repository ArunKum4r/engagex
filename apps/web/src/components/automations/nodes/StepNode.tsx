import {
    GitBranch,
    MessageCircle,
    MessageSquare,
    Clock,
    UserCheck,
    Zap,
} from "lucide-react";
import {
    Handle,
    Position,
    type NodeProps,
} from "@xyflow/react";

interface StepNodeData {
    label: string;
    stepType: string;
    config: Record<string, unknown>;
}

const conditionTypes = new Set([
    "KEYWORD_MATCH",
    "FOLLOWER_STATUS",
]);

const getStepMeta = (
    stepType: string,
) => {
    switch (stepType) {
        case "KEYWORD_MATCH":
            return {
                category: "Condition",
                icon: GitBranch,
            };

        case "FOLLOWER_STATUS":
            return {
                category: "Condition",
                icon: UserCheck,
            };

        case "SEND_DM":
            return {
                category: "Action",
                icon: MessageCircle,
            };

        case "REPLY_COMMENT":
            return {
                category: "Action",
                icon: MessageSquare,
            };

        case "WAIT":
            return {
                category: "Flow",
                icon: Clock,
            };

        default:
            return {
                category: "Action",
                icon: Zap,
            };
    }
};

const StepNode = ({
    data,
}: NodeProps) => {
    const nodeData =
        data as unknown as StepNodeData;

    const meta = getStepMeta(
        nodeData.stepType,
    );

    const Icon = meta.icon;

    const isCondition =
        conditionTypes.has(
            nodeData.stepType,
        );

    return (
        <div className="relative w-[320px] overflow-visible rounded-2xl border border-border bg-surface shadow-xl">
            <div className="flex items-center gap-3 border-b border-border bg-surface-muted px-5 py-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon size={17} />
                </div>

                <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-primary">
                        {meta.category}
                    </p>

                    <p className="mt-0.5 truncate text-sm font-semibold capitalize text-text">
                        {nodeData.stepType
                            .replaceAll(
                                "_",
                                " ",
                            )
                            .toLowerCase()
                            .replace(
                                /^./,
                                (
                                    char,
                                ) =>
                                    char.toUpperCase(),
                            )}
                    </p>
                </div>
            </div>

            <div className="px-5 py-4">
                <p className="text-sm leading-6 text-text-secondary">
                    {getDescription(
                        nodeData.stepType,
                        nodeData.config,
                    )}
                </p>
            </div>

            <Handle
                id="target"
                type="target"
                position={
                    Position.Top
                }
                className="!h-3 !w-3 !border-2 !border-surface !bg-primary"
            />

            {isCondition ? (
                <>
                    <div className="absolute -bottom-8 left-6 text-[10px] font-semibold uppercase tracking-wider text-success">
                        Yes
                    </div>

                    <div className="absolute -bottom-8 right-6 text-[10px] font-semibold uppercase tracking-wider text-danger">
                        No
                    </div>

                    <Handle
                        id="yes"
                        type="source"
                        position={
                            Position.Bottom
                        }
                        style={{
                            left: "25%",
                        }}
                        className="!h-3 !w-3 !border-2 !border-surface !bg-success"
                    />

                    <Handle
                        id="no"
                        type="source"
                        position={
                            Position.Bottom
                        }
                        style={{
                            left: "75%",
                        }}
                        className="!h-3 !w-3 !border-2 !border-surface !bg-danger"
                    />
                </>
            ) : (
                <Handle
                    id="default"
                    type="source"
                    position={
                        Position.Bottom
                    }
                    className="!h-3 !w-3 !border-2 !border-surface !bg-primary"
                />
            )}
        </div>
    );
};

const getDescription = (
    stepType: string,
    config: Record<string, unknown>,
) => {
    switch (stepType) {
        case "KEYWORD_MATCH":
            return typeof config.keyword ===
                "string"
                ? `Continue when the comment matches "${config.keyword}".`
                : "Check whether the comment matches a keyword.";

        case "FOLLOWER_STATUS":
            return config.condition ===
                "FOLLOWING"
                ? "Check whether the person follows your Instagram account."
                : "Check whether the person does not follow your Instagram account.";

        case "SEND_DM":
            return typeof config.message ===
                "string" &&
                config.message
                ? `"${config.message}"`
                : "Send a private Instagram message.";

        case "REPLY_COMMENT":
            return typeof config.message ===
                "string" &&
                config.message
                ? `"${config.message}"`
                : "Reply publicly to the Instagram comment.";

        case "WAIT":
            return config.duration
                ? `Wait ${String(config.duration)} ${String(config.unit ?? "MINUTES").toLowerCase()}.`
                : "Wait before continuing the workflow.";

        default:
            return "Configure this workflow step.";
    }
};

export default StepNode;