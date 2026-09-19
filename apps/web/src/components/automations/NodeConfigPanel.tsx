import { X } from "lucide-react";
import type { Node } from "@xyflow/react";
import {
    getPlatformCapabilities,
    getStepCapability,
} from "./capabilities";

interface NodeConfigPanelProps {
    node: Node;
    onClose: () => void;
    onChange: (
        nodeId: string,
        data: Record<string, unknown>,
    ) => void;
}

const inputClassName =
    "w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-text outline-none transition placeholder:text-text-muted hover:border-primary/30 focus:border-primary focus:ring-2 focus:ring-primary/10";

const selectClassName = inputClassName;

const NodeConfigPanel = ({
    node,
    onClose,
    onChange,
}: NodeConfigPanelProps) => {
    const isTrigger = node.type === "trigger";

    const stepType =
        typeof node.data.stepType === "string"
            ? node.data.stepType
            : "";

    const triggerType =
        typeof node.data.triggerType === "string"
            ? node.data.triggerType
            : "";

    const config =
        typeof node.data.config === "object" &&
        node.data.config !== null
            ? (node.data.config as Record<string, unknown>)
            : {};

    const platform =
        typeof node.data.platform === "string"
            ? node.data.platform
            : null;

    const stepCapability = getStepCapability(
        platform,
        stepType,
    );

    const platformCapabilities =
        getPlatformCapabilities(platform);

    const triggerCapability =
        platformCapabilities?.triggers.find(
            (capability) =>
                capability.type === triggerType,
        );

    const capability = isTrigger
        ? triggerCapability
        : stepCapability;

    const updateConfig = (
        key: string,
        value: unknown,
    ) => {
        onChange(node.id, {
            ...node.data,
            config: {
                ...config,
                [key]: value,
            },
        });
    };

    const renderTriggerContent = () => {
        if (!triggerCapability?.configType) {
            return (
                <div className="rounded-xl border border-border bg-surface-muted p-4">
                    <p className="text-sm text-text-secondary">
                        This trigger does not have any
                        configuration options yet.
                    </p>
                </div>
            );
        }

        switch (triggerCapability.configType) {
            case "CONTENT_TARGET": {
                const target =
                    config.target === "SPECIFIC"
                        ? "SPECIFIC"
                        : "ALL";

                const contentId =
                    typeof config.contentId === "string"
                        ? config.contentId
                        : "";

                return (
                    <div className="space-y-4">
                        <div>
                            <label className="mb-2 block text-sm font-medium text-text">
                                Content target
                            </label>

                            <select
                                value={target}
                                onChange={(event) => {
                                    const nextTarget =
                                        event.target.value;

                                    if (
                                        nextTarget ===
                                        "SPECIFIC"
                                    ) {
                                        onChange(node.id, {
                                            ...node.data,
                                            config: {
                                                ...config,
                                                target: "SPECIFIC",
                                            },
                                        });

                                        return;
                                    }

                                    onChange(node.id, {
                                        ...node.data,
                                        config: {
                                            ...config,
                                            target: "ALL",
                                            contentId: undefined,
                                        },
                                    });
                                }}
                                className={selectClassName}
                            >
                                <option value="ALL">
                                    All posts and reels
                                </option>

                                <option value="SPECIFIC">
                                    Specific post or reel
                                </option>
                            </select>

                            <p className="mt-1.5 text-xs text-text-secondary">
                                Choose which Instagram content
                                should activate this trigger.
                            </p>
                        </div>

                        {target === "SPECIFIC" && (
                            <div>
                                <label className="mb-2 block text-sm font-medium text-text">
                                    Post or reel ID
                                </label>

                                <input
                                    type="text"
                                    value={contentId}
                                    onChange={(event) =>
                                        updateConfig(
                                            "contentId",
                                            event.target.value,
                                        )
                                    }
                                    placeholder="Enter Instagram post or reel ID"
                                    className={inputClassName}
                                />

                                <p className="mt-1.5 text-xs text-text-secondary">
                                    Enter the Instagram content ID
                                    that should activate this
                                    automation.
                                </p>
                            </div>
                        )}
                    </div>
                );
            }

            default:
                return (
                    <div className="rounded-xl border border-border bg-surface-muted p-4">
                        <p className="text-sm text-text-secondary">
                            This trigger does not have any
                            configuration options yet.
                        </p>
                    </div>
                );
        }
    };

    const renderComparisonCondition = ({
        label,
        defaultOperator = "EQUALS",
        operators,
        valueType = "text",
        placeholder,
        description,
    }: {
        label: string;
        defaultOperator?: string;
        operators: {
            value: string;
            label: string;
        }[];
        valueType?: "text" | "number";
        placeholder?: string;
        description?: string;
    }) => {
        const operator =
            typeof config.operator === "string"
                ? config.operator
                : defaultOperator;

        const value =
            typeof config.value === "string" ||
                typeof config.value === "number"
                ? config.value
                : "";

        return (
            <div className="space-y-4">
                <div>
                    <label className="mb-2 block text-sm font-medium text-text">
                        {label}
                    </label>

                    <select
                        value={operator}
                        onChange={(event) =>
                            updateConfig(
                                "operator",
                                event.target.value,
                            )
                        }
                        className={selectClassName}
                    >
                        {operators.map((item) => (
                            <option
                                key={item.value}
                                value={item.value}
                            >
                                {item.label}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="mb-2 block text-sm font-medium text-text">
                        Value
                    </label>

                    <input
                        type={valueType}
                        value={value}
                        onChange={(event) =>
                            updateConfig(
                                "value",
                                valueType === "number"
                                    ? Number(
                                        event.target.value,
                                    )
                                    : event.target.value,
                            )
                        }
                        placeholder={placeholder}
                        className={inputClassName}
                    />

                    {description && (
                        <p className="mt-1.5 text-xs text-text-secondary">
                            {description}
                        </p>
                    )}
                </div>
            </div>
        );
    };

    const renderBooleanCondition = ({
        label,
        description,
    }: {
        label: string;
        description: string;
    }) => {
        const value =
            config.value === true ||
            config.value === "true";

        return (
            <div className="space-y-4">
                <div>
                    <label className="mb-2 block text-sm font-medium text-text">
                        {label}
                    </label>

                    <select
                        value={value ? "TRUE" : "FALSE"}
                        onChange={(event) =>
                            updateConfig(
                                "value",
                                event.target.value === "TRUE",
                            )
                        }
                        className={selectClassName}
                    >
                        <option value="TRUE">Yes</option>
                        <option value="FALSE">No</option>
                    </select>

                    <p className="mt-1.5 text-xs text-text-secondary">
                        {description}
                    </p>
                </div>
            </div>
        );
    };

    const renderTimeCondition = ({
        label,
        description,
    }: {
        label: string;
        description: string;
    }) => {
        const operator =
            typeof config.operator === "string"
                ? config.operator
                : "WITHIN";

        const value =
            typeof config.value === "number"
                ? config.value
                : "";

        const unit =
            typeof config.unit === "string"
                ? config.unit
                : "DAYS";
        console.log(label)
        return (
            <div className="space-y-4">
                <div>
                    <label className="mb-2 block text-sm font-medium text-text">
                        Time condition
                    </label>

                    <select
                        value={operator}
                        onChange={(event) =>
                            updateConfig(
                                "operator",
                                event.target.value,
                            )
                        }
                        className={selectClassName}
                    >
                        <option value="WITHIN">
                            Within
                        </option>

                        <option value="BEFORE">
                            Before
                        </option>

                        <option value="AFTER">
                            After
                        </option>
                    </select>
                </div>

                <div className="flex gap-2">
                    <input
                        type="number"
                        min={1}
                        value={value}
                        onChange={(event) =>
                            updateConfig(
                                "value",
                                Number(
                                    event.target.value,
                                ),
                            )
                        }
                        placeholder="7"
                        className="min-w-0 flex-1 rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-text outline-none transition placeholder:text-text-muted hover:border-primary/30 focus:border-primary focus:ring-2 focus:ring-primary/10"
                    />

                    <select
                        value={unit}
                        onChange={(event) =>
                            updateConfig(
                                "unit",
                                event.target.value,
                            )
                        }
                        className="w-32 rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-text outline-none transition hover:border-primary/30 focus:border-primary focus:ring-2 focus:ring-primary/10"
                    >
                        <option value="MINUTES">
                            Minutes
                        </option>

                        <option value="HOURS">
                            Hours
                        </option>

                        <option value="DAYS">
                            Days
                        </option>
                    </select>
                </div>

                <p className="text-xs text-text-secondary">
                    {description}
                </p>
            </div>
        );
    };

    const renderContent = () => {
        if (isTrigger) {
            return renderTriggerContent();
        }

        switch (stepType) {
            case "KEYWORD_MATCH": {
                const keywords = Array.isArray(
                    config.keywords,
                )
                    ? config.keywords.filter(
                        (
                            keyword,
                        ): keyword is string =>
                            typeof keyword ===
                            "string",
                    )
                    : typeof config.keyword === "string"
                        ? [config.keyword]
                        : [""];

                const match =
                    config.match === "ALL"
                        ? "ALL"
                        : "ANY";

                const updateKeywords = (
                    nextKeywords: string[],
                ) => {
                    const {
                        keyword: _legacyKeyword,
                        ...restConfig
                    } = config;

                    onChange(node.id, {
                        ...node.data,
                        config: {
                            ...restConfig,
                            keywords: nextKeywords,
                        },
                    });
                };

                return (
                    <div className="space-y-4">
                        <div>
                            <label className="mb-2 block text-sm font-medium text-text">
                                Keywords
                            </label>

                            <div className="space-y-2">
                                {keywords.map(
                                    (
                                        keyword,
                                        index,
                                    ) => (
                                        <div
                                            key={index}
                                            className="flex gap-2"
                                        >
                                            <input
                                                type="text"
                                                value={
                                                    keyword
                                                }
                                                onChange={(
                                                    event,
                                                ) => {
                                                    const nextKeywords =
                                                        [
                                                            ...keywords,
                                                        ];

                                                    nextKeywords[
                                                        index
                                                    ] =
                                                        event.target.value;

                                                    updateKeywords(
                                                        nextKeywords,
                                                    );
                                                }}
                                                placeholder="e.g. GUIDE"
                                                className={`min-w-0 flex-1 ${inputClassName}`}
                                            />

                                            {keywords.length >
                                                1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            updateKeywords(
                                                                keywords.filter(
                                                                    (
                                                                        _,
                                                                        keywordIndex,
                                                                    ) =>
                                                                        keywordIndex !==
                                                                        index,
                                                                ),
                                                            );
                                                        }}
                                                        className="rounded-lg border border-border px-3 text-sm text-text-secondary transition hover:border-danger/30 hover:bg-danger/5 hover:text-danger"
                                                    >
                                                        Remove
                                                    </button>
                                                )}
                                        </div>
                                    ),
                                )}
                            </div>

                            <button
                                type="button"
                                onClick={() =>
                                    updateKeywords([
                                        ...keywords,
                                        "",
                                    ])
                                }
                                className="mt-2 text-sm font-medium text-primary hover:text-primary/80"
                            >
                                + Add keyword
                            </button>

                            <p className="mt-1.5 text-xs text-text-secondary">
                                Continue when the comment matches
                                one or more configured keywords.
                            </p>
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-text">
                                Match
                            </label>

                            <select
                                value={match}
                                onChange={(event) =>
                                    updateConfig(
                                        "match",
                                        event.target.value,
                                    )
                                }
                                className={selectClassName}
                            >
                                <option value="ANY">
                                    Any keyword
                                </option>

                                <option value="ALL">
                                    All keywords
                                </option>
                            </select>
                        </div>
                    </div>
                );
            }

            case "FOLLOWER_STATUS":
                return (
                    <div>
                        <label className="mb-2 block text-sm font-medium text-text">
                            Follower condition
                        </label>

                        <select
                            value={
                                typeof config.condition ===
                                "string"
                                    ? config.condition
                                    : "NOT_FOLLOWING"
                            }
                            onChange={(event) =>
                                updateConfig(
                                    "condition",
                                    event.target.value,
                                )
                            }
                            className={selectClassName}
                        >
                            <option value="FOLLOWING">
                                Following
                            </option>

                            <option value="NOT_FOLLOWING">
                                Not following
                            </option>
                        </select>

                        <p className="mt-1.5 text-xs text-text-secondary">
                            Checks the person's relationship with
                            your Instagram account.
                        </p>
                    </div>
                );

            case "LAST_INTERACTION":
                return renderTimeCondition({
                    label: "Last interaction",
                    description:
                        "Check when the person last interacted with your Instagram account.",
                });

            case "LAST_SEEN":
                return renderTimeCondition({
                    label: "Last seen",
                    description:
                        "Check when the person was last seen.",
                });

            case "FOLLOWER_COUNT":
                return renderComparisonCondition({
                    label: "Follower count",
                    defaultOperator: "GREATER_THAN",
                    operators: [
                        {
                            value: "GREATER_THAN",
                            label: "Greater than",
                        },
                        {
                            value: "GREATER_THAN_OR_EQUAL",
                            label: "Greater than or equal",
                        },
                        {
                            value: "LESS_THAN",
                            label: "Less than",
                        },
                        {
                            value: "LESS_THAN_OR_EQUAL",
                            label: "Less than or equal",
                        },
                        {
                            value: "EQUALS",
                            label: "Equals",
                        },
                    ],
                    valueType: "number",
                    placeholder: "1000",
                    description:
                        "Compare the person's Instagram follower count.",
                });

            case "USERNAME":
                return renderComparisonCondition({
                    label: "Username",
                    operators: [
                        {
                            value: "EQUALS",
                            label: "Equals",
                        },
                        {
                            value: "CONTAINS",
                            label: "Contains",
                        },
                        {
                            value: "STARTS_WITH",
                            label: "Starts with",
                        },
                    ],
                    placeholder: "@username",
                    description:
                        "Compare the person's Instagram username.",
                });

            case "OPTED_IN":
                return renderBooleanCondition({
                    label: "Opted in",
                    description:
                        "Check whether this contact has opted in to your automation.",
                });

            case "VERIFIED":
                return renderBooleanCondition({
                    label: "Verified",
                    description:
                        "Check whether the person's Instagram account is verified.",
                });

            case "WE_FOLLOW_USER":
                return renderBooleanCondition({
                    label: "We follow them",
                    description:
                        "Check whether your Instagram account follows this person.",
                });

            case "CONTACT_NAME":
                return renderComparisonCondition({
                    label: "Contact name",
                    operators: [
                        {
                            value: "EQUALS",
                            label: "Equals",
                        },
                        {
                            value: "CONTAINS",
                            label: "Contains",
                        },
                        {
                            value: "STARTS_WITH",
                            label: "Starts with",
                        },
                    ],
                    placeholder: "John",
                    description:
                        "Compare the saved contact name in EngageX.",
                });

            case "CONTACT_STATUS":
                return (
                    <div>
                        <label className="mb-2 block text-sm font-medium text-text">
                            Contact status
                        </label>

                        <select
                            value={
                                typeof config.value ===
                                    "string"
                                    ? config.value
                                    : "NEW"
                            }
                            onChange={(event) =>
                                updateConfig(
                                    "value",
                                    event.target.value,
                                )
                            }
                            className={selectClassName}
                        >
                            <option value="NEW">
                                New contact
                            </option>

                            <option value="EXISTING">
                                Existing contact
                            </option>
                        </select>

                        <p className="mt-1.5 text-xs text-text-secondary">
                            Check whether this person is a new or
                            existing EngageX contact.
                        </p>
                    </div>
                );

            case "CONTACT_TAG":
                return (
                    <div>
                        <label className="mb-2 block text-sm font-medium text-text">
                            Tag
                        </label>

                        <select
                            value={
                                typeof config.operator ===
                                    "string"
                                    ? config.operator
                                    : "HAS"
                            }
                            onChange={(event) =>
                                updateConfig(
                                    "operator",
                                    event.target.value,
                                )
                            }
                            className={selectClassName}
                        >
                            <option value="HAS">
                                Has tag
                            </option>

                            <option value="NOT_HAS">
                                Does not have tag
                            </option>
                        </select>

                        <input
                            type="text"
                            value={
                                typeof config.value ===
                                    "string"
                                    ? config.value
                                    : ""
                            }
                            onChange={(event) =>
                                updateConfig(
                                    "value",
                                    event.target.value,
                                )
                            }
                            placeholder="e.g. VIP"
                            className={`mt-3 ${inputClassName}`}
                        />

                        <p className="mt-1.5 text-xs text-text-secondary">
                            Check whether the contact has a specific
                            EngageX tag.
                        </p>
                    </div>
                );

            case "SEND_DM":
                return (
                    <div>
                        <label className="mb-2 block text-sm font-medium text-text">
                            Message
                        </label>

                        <textarea
                            value={
                                typeof config.message ===
                                    "string"
                                    ? config.message
                                    : ""
                            }
                            onChange={(event) =>
                                updateConfig(
                                    "message",
                                    event.target.value,
                                )
                            }
                            placeholder="Enter the message to send..."
                            rows={5}
                            className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-text outline-none transition placeholder:text-text-muted hover:border-primary/30 focus:border-primary focus:ring-2 focus:ring-primary/10"
                        />

                        <p className="mt-1.5 text-xs text-text-secondary">
                            This message will be sent as a
                            private Instagram DM.
                        </p>
                    </div>
                );

            case "REPLY_COMMENT":
                return (
                    <div>
                        <label className="mb-2 block text-sm font-medium text-text">
                            Reply
                        </label>

                        <textarea
                            value={
                                typeof config.message ===
                                    "string"
                                    ? config.message
                                    : ""
                            }
                            onChange={(event) =>
                                updateConfig(
                                    "message",
                                    event.target.value,
                                )
                            }
                            placeholder="Enter your comment reply..."
                            rows={4}
                            className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-text outline-none transition placeholder:text-text-muted hover:border-primary/30 focus:border-primary focus:ring-2 focus:ring-primary/10"
                        />

                        <p className="mt-1.5 text-xs text-text-secondary">
                            This reply will be posted publicly
                            on the comment.
                        </p>
                    </div>
                );

            case "WAIT":
                return (
                    <div>
                        <label className="mb-2 block text-sm font-medium text-text">
                            Wait duration
                        </label>

                        <div className="flex gap-2">
                            <input
                                type="number"
                                min={1}
                                value={
                                    typeof config.duration ===
                                    "number"
                                        ? config.duration
                                        : ""
                                }
                                onChange={(event) =>
                                    updateConfig(
                                        "duration",
                                        Number(
                                            event.target.value,
                                        ),
                                    )
                                }
                                placeholder="1"
                                className="min-w-0 flex-1 rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-text outline-none transition placeholder:text-text-muted hover:border-primary/30 focus:border-primary focus:ring-2 focus:ring-primary/10"
                            />

                            <select
                                value={
                                    typeof config.unit ===
                                    "string"
                                        ? config.unit
                                        : "MINUTES"
                                }
                                onChange={(event) =>
                                    updateConfig(
                                        "unit",
                                        event.target.value,
                                    )
                                }
                                className="w-32 rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-text outline-none transition hover:border-primary/30 focus:border-primary focus:ring-2 focus:ring-primary/10"
                            >
                                <option value="MINUTES">
                                    Minutes
                                </option>

                                <option value="HOURS">
                                    Hours
                                </option>

                                <option value="DAYS">
                                    Days
                                </option>
                            </select>
                        </div>

                        <p className="mt-1.5 text-xs text-text-secondary">
                            The workflow will resume after this
                            duration.
                        </p>
                    </div>
                );
            case "RANDOMIZER": {
                const paths =
                    typeof config.paths === "number"
                        ? config.paths
                        : 2;

                return (
                    <div>
                        <label className="mb-2 block text-sm font-medium text-text">
                            Number of paths
                        </label>

                        <input
                            type="number"
                            min={2}
                            max={4}
                            value={paths}
                            onChange={(event) => {
                                const value = event.target.value;

                                if (value === "") {
                                    onChange(node.id, {
                                        ...node.data,
                                        config: {
                                            ...config,
                                            paths: undefined,
                                        },
                                    });

                                    return;
                                }

                                onChange(node.id, {
                                    ...node.data,
                                    config: {
                                        ...config,
                                        paths: Number(value),
                                    },
                                });
                            }}
                            onBlur={() => {
                                const value = Number(config.paths);

                                const normalized =
                                    Number.isFinite(value)
                                        ? Math.min(4, Math.max(2, value))
                                        : 2;

                                updateConfig("paths", normalized);
                            }}
                            className={inputClassName}
                        />

                        <p className="mt-1.5 text-xs text-text-secondary">
                            Randomly distribute contacts across{" "}
                            {paths >= 2 && paths <= 4 ? paths : 2} workflow paths.
                        </p>
                    </div>
                );
            }

            default:
                return (
                    <div className="rounded-xl border border-border bg-surface-muted p-4">
                        <p className="text-sm text-text-secondary">
                            This step does not have any
                            configuration options yet.
                        </p>
                    </div>
                );
        }
    };

    return (
        <aside className="absolute inset-x-2 bottom-2 top-2 z-20 flex flex-col rounded-2xl border border-border bg-surface shadow-2xl sm:inset-y-0 sm:left-auto sm:right-0 sm:w-[340px] sm:rounded-none sm:rounded-l-2xl sm:border-y-0 sm:border-r-0 sm:border-l">
            <div className="flex items-center justify-between border-b border-border bg-surface/95 px-4 py-4 backdrop-blur">
                <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-primary">
                        {isTrigger ? "Trigger" : "Step"}
                    </p>

                    <h3 className="mt-1 text-base font-semibold text-text">
                        {capability?.label ??
                            (isTrigger
                                ? triggerType.replaceAll(
                                    "_",
                                    " ",
                                )
                                : stepType.replaceAll(
                                    "_",
                                    " ",
                                ))}
                    </h3>
                </div>

                <button
                    type="button"
                    onClick={onClose}
                    className="flex h-9 w-9 items-center justify-center rounded-lg text-text-secondary transition-colors hover:bg-surface-muted hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                    aria-label="Close configuration"
                >
                    <X size={18} />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-5">
                {renderContent()}
            </div>
        </aside>
    );
};

export default NodeConfigPanel;