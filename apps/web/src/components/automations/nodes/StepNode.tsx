import {
    Zap,
} from "lucide-react";
import { useEffect } from "react";
import {
    Handle,
    Position,
    useUpdateNodeInternals,
    type NodeProps,
} from "@xyflow/react";
import { getStepCapability } from "../capabilities";

interface StepNodeData {
    label: string;
    stepType: string;
    config: Record<string, unknown>;
    platform: string | null;
}

const StepNode = ({
    id,
    data,
    selected,
}: NodeProps) => {
    const nodeData =
        data as unknown as StepNodeData;

    const capability = getStepCapability(
        nodeData.platform,
        nodeData.stepType,
    );

    const Icon =
        capability?.icon ?? Zap;

    const category =
        capability?.category ?? "ACTION";

    const isCondition =
        category === "CONDITION";

    const isRandomizer =
        nodeData.stepType === "RANDOMIZER";

    const randomizerPaths =
        typeof nodeData.config.paths === "number" &&
            nodeData.config.paths >= 2
            ? Math.min(nodeData.config.paths, 5)
            : 2;

    const updateNodeInternals = useUpdateNodeInternals();

    useEffect(() => {
        updateNodeInternals(id);
    }, [
        id,
        randomizerPaths,
        updateNodeInternals,
    ]);

    useEffect(() => {
        if (isRandomizer) {
            updateNodeInternals(nodeData.stepType);
        }
    }, [
        isRandomizer,
        randomizerPaths,
        updateNodeInternals,
        nodeData.stepType,
    ]);

    return (
        <div
            className={[
                "relative w-[min(320px,calc(100vw-2rem))] overflow-visible rounded-2xl border bg-surface shadow-md transition-all duration-200",
                selected
                    ? "border-primary/60 shadow-xl shadow-primary/10 ring-2 ring-primary/20"
                    : "border-border hover:border-primary/30 hover:shadow-lg",
            ].join(" ")}
        >
            <div className="flex items-center gap-3 border-b border-border bg-surface-muted/70 px-4 py-3.5 sm:px-5 sm:py-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-primary/15 bg-primary/10 text-primary shadow-sm">
                    <Icon
                        size={17}
                        strokeWidth={2}
                    />
                </div>

                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-primary">
                            {category}
                        </p>

                        {isCondition && (
                            <span className="h-1.5 w-1.5 rounded-full bg-primary/60" />
                        )}
                    </div>

                    <p className="mt-0.5 truncate text-sm font-semibold capitalize text-text">
                        {capability?.label ??
                            nodeData.stepType}
                    </p>
                </div>
            </div>

            <div className="px-4 py-4 sm:px-5 sm:py-5">
                <p className="min-h-[48px] text-sm leading-6 text-text-secondary">
                    {getDescription(
                        nodeData.stepType,
                        nodeData.config,
                    )}
                </p>
            </div>

            <Handle
                id="target"
                type="target"
                position={Position.Top}
                className="!top-[-6px] !h-3 !w-3 !border-2 !border-surface !bg-primary !shadow-sm"
            />

            {isCondition ? (
                <>
                    <div className="absolute -bottom-[33px] left-[25%] z-10 -translate-x-1/2">
                        <div className="flex items-center gap-1.5">
                            <span className="h-1.5 w-1.5 rounded-full bg-success" />

                            <span className="rounded-full border border-success/20 bg-success/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.12em] text-success">
                                Yes
                            </span>
                        </div>
                    </div>

                    <div className="absolute -bottom-[33px] left-[75%] z-10 -translate-x-1/2">
                        <div className="flex items-center gap-1.5">
                            <span className="rounded-full border border-danger/20 bg-danger/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.12em] text-danger">
                                No
                            </span>

                            <span className="h-1.5 w-1.5 bg-danger" />
                        </div>
                    </div>

                    <Handle
                        id="yes"
                        type="source"
                        position={Position.Bottom}
                        style={{
                            left: "25%",
                        }}
                        className="!bottom-[-6px] !h-3 !w-3 !border-2 !border-surface !bg-success !shadow-sm"
                    />

                    <Handle
                        id="no"
                        type="source"
                        position={Position.Bottom}
                        style={{
                            left: "75%",
                        }}
                        className="!bottom-[-6px] !h-3 !w-3 !border-2 !border-surface !bg-danger !shadow-sm"
                    />
                </>
            ) : isRandomizer ? (
                <>
                    {Array.from({
                        length: randomizerPaths,
                    }).map((_, index) => {
                        const pathNumber =
                            index + 1;

                        const left =
                            randomizerPaths === 1
                                ? 50
                                : (index /
                                    (randomizerPaths - 1)) *
                                100;

                        return (
                            <div
                                key={`randomizer-path-${pathNumber}`}
                                className="absolute -bottom-[33px] z-20 -translate-x-1/2"
                                style={{
                                    left: `${left}%`,
                                }}
                            >
                                <div className="flex flex-col items-center gap-1">
                                    <span className="rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.12em] text-primary">
                                        Path {pathNumber}
                                    </span>
                                </div>

                                <Handle
                                    id={`path-${pathNumber}`}
                                    type="source"
                                    position={Position.Bottom}
                                    className="!bottom-[-19px] !left-1/2 !z-30 !h-3 !w-3 !-translate-x-1/2 !border-2 !border-surface !bg-primary !shadow-sm"
                                />
                            </div>
                        );
                    })}
                </>
            ) : (
                <Handle
                    id="default"
                    type="source"
                            position={Position.Bottom}
                            className="!bottom-[-6px] !h-3 !w-3 !border-2 !border-surface !bg-primary !shadow-sm"
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
        case "KEYWORD_MATCH": {
            const keywords = Array.isArray(
                config.keywords,
            )
                ? config.keywords.filter(
                    (keyword): keyword is string =>
                        typeof keyword ===
                        "string" &&
                        keyword.trim().length > 0,
                )
                : typeof config.keyword ===
                    "string"
                    ? [config.keyword]
                    : [];

            if (keywords.length === 0) {
                return "Check whether the comment matches configured keywords.";
            }

            const match =
                config.match === "ALL"
                    ? "all"
                    : "any";

            return `Continue when the comment matches ${match} of: ${keywords
                .map(
                    (keyword) =>
                        `"${keyword}"`,
                )
                .join(", ")}.`;
        }

        case "FOLLOWER_STATUS":
            return config.condition ===
                "FOLLOWING"
                ? "Check whether the person follows your Instagram account."
                : "Check whether the person does not follow your Instagram account.";

        case "LAST_INTERACTION": {
            const operator =
                String(config.operator ?? "WITHIN").toLowerCase();

            const value =
                config.value !== undefined
                    ? String(config.value)
                    : "";

            const unit =
                String(config.unit ?? "MINUTES").toLowerCase();

            if (!value) {
                return "Check when the person last interacted with your account.";
            }

            if (operator === "BEFORE") {
                return `Check whether the last interaction was more than ${value} ${unit} ago.`;
            }

            if (operator === "AFTER") {
                return `Check whether the last interaction was less than ${value} ${unit} ago.`;
            }

            return `Check whether the last interaction was within ${value} ${unit}.`;
        }

        case "LAST_SEEN": {
            const operator =
                String(config.operator ?? "WITHIN").toLowerCase();

            const value =
                config.value !== undefined
                    ? String(config.value)
                    : "";

            const unit =
                String(config.unit ?? "MINUTES").toLowerCase();

            if (!value) {
                return "Check when the person was last seen.";
            }

            if (operator === "BEFORE") {
                return `Check whether the person was last seen more than ${value} ${unit} ago.`;
            }

            if (operator === "AFTER") {
                return `Check whether the person was last seen less than ${value} ${unit} ago.`;
            }

            return `Check whether the person was last seen within ${value} ${unit}.`;
        }

        case "FOLLOWER_COUNT": {
            const operator =
                String(config.operator ?? "GREATER_THAN");

            const value =
                config.value !== undefined
                    ? String(config.value)
                    : "";

            if (!value) {
                return "Check the person's Instagram follower count.";
            }

            const operatorText: Record<string, string> = {
                GREATER_THAN: "more than",
                GREATER_THAN_OR_EQUAL: "at least",
                LESS_THAN: "less than",
                LESS_THAN_OR_EQUAL: "at most",
                EQUALS: "exactly",
            };

            return `Continue when the person has ${operatorText[operator] ?? "the configured number of"} ${value} followers.`;
        }

        case "USERNAME": {
            const operator =
                String(config.operator ?? "EQUALS");

            const value =
                typeof config.value === "string"
                    ? config.value
                    : "";

            if (!value) {
                return "Check the person's Instagram username.";
            }

            const operatorText: Record<string, string> = {
                EQUALS: "is",
                CONTAINS: "contains",
                STARTS_WITH: "starts with",
            };

            return `Continue when the username ${operatorText[operator] ?? "matches"} "${value}".`;
        }

        case "OPTED_IN":
            return config.value === true
                ? "Continue only if the person has opted in."
                : config.value === false
                    ? "Continue only if the person has not opted in."
                    : "Check whether the person has opted in.";

        case "VERIFIED":
            return config.value === true
                ? "Continue only if the person's Instagram account is verified."
                : config.value === false
                    ? "Continue only if the person's Instagram account is not verified."
                    : "Check whether the person's Instagram account is verified.";

        case "WE_FOLLOW_USER":
            return config.value === true
                ? "Check whether your Instagram account follows this person."
                : config.value === false
                    ? "Check whether your Instagram account does not follow this person."
                    : "Check whether your Instagram account follows this person.";

        case "CONTACT_NAME": {
            const operator =
                String(config.operator ?? "EQUALS");

            const value =
                typeof config.value === "string"
                    ? config.value
                    : "";

            if (!value) {
                return "Check the contact's name.";
            }

            const operatorText: Record<string, string> = {
                EQUALS: "is",
                CONTAINS: "contains",
                STARTS_WITH: "starts with",
            };

            return `Continue when the contact name ${operatorText[operator] ?? "matches"} "${value}".`;
        }

        case "CONTACT_STATUS":
            return config.value === "NEW"
                ? "Continue only for new contacts."
                : config.value === "EXISTING"
                    ? "Continue only for existing contacts."
                    : "Check whether the contact is new or existing.";

        case "CONTACT_TAG": {
            const operator =
                String(config.operator ?? "HAS");

            const value =
                typeof config.value === "string"
                    ? config.value
                    : "";

            if (!value) {
                return "Check whether the contact has a configured tag.";
            }

            return operator === "NOT_HAS"
                ? `Continue when the contact does not have the "${value}" tag.`
                : `Continue when the contact has the "${value}" tag.`;
        }

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
                ? `Wait ${String(config.duration)} ${String(
                    config.unit ??
                    "MINUTES",
                ).toLowerCase()}.`
                : "Wait before continuing the workflow.";

        case "RANDOMIZER": {
            const paths =
                typeof config.paths === "number" &&
                    config.paths >= 2
                    ? Math.min(config.paths, 5)
                    : 2;

            return `Randomly distribute contacts across ${paths} workflow paths.`;
        }

        default:
            return "Configure this workflow step.";
    }
};

export default StepNode;