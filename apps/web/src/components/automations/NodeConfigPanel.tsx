import { useEffect, useState } from "react";
import type { Node } from "@xyflow/react";
import { X } from "lucide-react";
import {
    getInstagramMedia,
    type InstagramMedia,
} from "../../api/integrations";
import {
    getPlatformCapabilities,
    getStepCapability,
} from "./capabilities";

interface NodeConfigPanelProps {
    node: Node;
    workspaceId: string;
    platformAccountId: string | null;
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
    workspaceId,
    platformAccountId,
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

    const fallbackTriggerConfigType =
        triggerType === "INSTAGRAM_COMMENT"
            ? "COMMENT"
            : triggerType === "INSTAGRAM_DM"
                ? "MESSAGE_KEYWORDS"
                : triggerType === "INSTAGRAM_STORY_REPLY"
                    ? "STORY_REPLY"
                    : undefined;

    const triggerConfigType =
        triggerCapability?.configType ??
        fallbackTriggerConfigType;

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

    const [instagramMedia, setInstagramMedia] = useState<InstagramMedia[]>([]);
    const [loadingInstagramMedia, setLoadingInstagramMedia] = useState(false);
    const [instagramMediaError, setInstagramMediaError] = useState<string | null>(null);

    useEffect(() => {
        if (
            !isTrigger ||
            triggerType !== "INSTAGRAM_COMMENT" ||
            !workspaceId ||
            !platformAccountId
        ) {
            setInstagramMedia([]);
            return;
        }

        let cancelled = false;

        const loadInstagramMedia = async () => {
            try {
                setLoadingInstagramMedia(true);
                setInstagramMediaError(null);

                const media = await getInstagramMedia(
                    workspaceId,
                    platformAccountId,
                );

                if (!cancelled) {
                    setInstagramMedia(media);
                }
            } catch (error) {
                console.error(
                    "Failed to load Instagram media",
                    error,
                );

                if (!cancelled) {
                    setInstagramMediaError(
                        "Failed to load Instagram posts and reels.",
                    );
                }
            } finally {
                if (!cancelled) {
                    setLoadingInstagramMedia(false);
                }
            }
        };

        void loadInstagramMedia();

        return () => {
            cancelled = true;
        };
    }, [
        isTrigger,
        triggerType,
        workspaceId,
        platformAccountId,
    ]);

    const renderTriggerContent = () => {
        if (!triggerConfigType) {
            return (
                <div className="rounded-xl border border-border bg-surface-muted p-4">
                    <p className="text-sm text-text-secondary">
                        This trigger does not have any
                        configuration options yet.
                    </p>
                </div>
            );
        }

        console.log("Node capability debug:", {
            nodeData: node.data,
            platform,
            triggerType,
            platformCapabilities,
            triggerCapability,
            triggerConfigType,
        });

        switch (triggerConfigType) {
            case "MESSAGE_KEYWORDS": {
                const keywords = Array.isArray(config.keywords)
                    ? config.keywords.filter(
                        (keyword): keyword is string =>
                            typeof keyword === "string",
                    )
                    : [];

                const displayKeywords = keywords.length > 0 ? keywords : [""];

                const match =
                    config.match === "ALL"
                        ? "ALL"
                        : "ANY";

                const updateKeywords = (
                    nextKeywords: string[],
                ) => {
                    onChange(node.id, {
                        ...node.data,
                        config: {
                            ...config,
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
                                {displayKeywords.map(
                                    (keyword, index) => (
                                        <div
                                            key={index}
                                            className="flex gap-2"
                                        >
                                            <input
                                                type="text"
                                                value={keyword}
                                                onChange={(event) => {
                                                    const nextKeywords = [
                                                        ...keywords,
                                                    ];

                                                    nextKeywords[index] =
                                                        event.target.value;

                                                    updateKeywords(
                                                        nextKeywords,
                                                    );
                                                }}
                                                placeholder="e.g. GUIDE"
                                                className={inputClassName}
                                            />

                                            {keywords.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        updateKeywords(
                                                            keywords.filter(
                                                                (_, keywordIndex) =>
                                                                    keywordIndex !==
                                                                    index,
                                                            ),
                                                        )
                                                    }
                                                    className="rounded-lg border border-border px-3 text-sm text-text-secondary hover:border-danger/30 hover:bg-danger/5 hover:text-danger"
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
                                Start this automation only when the
                                message matches the configured keywords.
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
            case "COMMENT": {
                const target =
                    config.target === "SPECIFIC"
                        ? "SPECIFIC"
                        : "ALL";

                const keywords = Array.isArray(config.keywords)
                    ? config.keywords.filter(
                        (keyword): keyword is string =>
                            typeof keyword === "string",
                    )
                    : [];

                const displayKeywords =
                    keywords.length > 0 ? keywords : [""];

                const match =
                    config.match === "ALL"
                        ? "ALL"
                        : "ANY";

                const selectedMediaId =
                    typeof config.contentId === "string"
                        ? config.contentId
                        : "";

                const selectedMedia =
                    instagramMedia.find(
                        (media) => media.id === selectedMediaId,
                    ) ?? null;

                const updateKeywords = (
                    nextKeywords: string[],
                ) => {
                    onChange(node.id, {
                        ...node.data,
                        config: {
                            ...config,
                            keywords: nextKeywords,
                        },
                    });
                };

                return (
                    <div className="space-y-5">
                        <div>
                            <label className="mb-2 block text-sm font-medium text-text">
                                Content target
                            </label>

                            <select
                                value={target}
                                onChange={(event) => {
                                    const nextTarget =
                                        event.target.value;

                                    if (nextTarget === "SPECIFIC") {
                                        updateConfig(
                                            "target",
                                            "SPECIFIC",
                                        );
                                        return;
                                    }

                                    onChange(node.id, {
                                        ...node.data,
                                        config: {
                                            ...config,
                                            target: "ALL",
                                            contentId: undefined,
                                            contentType: undefined,
                                            contentTitle: undefined,
                                            contentThumbnail: undefined,
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
                                Choose which Instagram content should
                                activate this trigger.
                            </p>
                        </div>

                        {target === "SPECIFIC" && (
                            <div>
                                <label className="mb-2 block text-sm font-medium text-text">
                                    Post or reel
                                </label>

                                <select
                                    value={selectedMediaId}
                                    onChange={(event) => {
                                        const mediaId =
                                            event.target.value;

                                        const media =
                                            instagramMedia.find(
                                                (item) =>
                                                    item.id === mediaId,
                                            );

                                        if (!media) {
                                            onChange(node.id, {
                                                ...node.data,
                                                config: {
                                                    ...config,
                                                    contentId: undefined,
                                                    contentType: undefined,
                                                    contentTitle: undefined,
                                                    contentThumbnail: undefined,
                                                },
                                            });

                                            return;
                                        }

                                        onChange(node.id, {
                                            ...node.data,
                                            config: {
                                                ...config,
                                                target: "SPECIFIC",
                                                contentId: media.id,
                                                contentType: media.type,
                                                contentTitle: media.title,
                                                contentThumbnail:
                                                    media.thumbnail,
                                            },
                                        });
                                    }}
                                    className={selectClassName}
                                    disabled={
                                        loadingInstagramMedia ||
                                        !platformAccountId
                                    }
                                >
                                    <option value="">
                                        {loadingInstagramMedia
                                            ? "Loading posts and reels..."
                                            : "Select a post or reel"}
                                    </option>

                                    {instagramMedia.map((media) => (
                                        <option
                                            key={media.id}
                                            value={media.id}
                                        >
                                            {media.type === "REEL"
                                                ? "Reel"
                                                : "Post"}{" "}
                                            —{" "}
                                            {media.title ||
                                                "Untitled content"}
                                        </option>
                                    ))}
                                </select>

                                {selectedMedia && (
                                    <div className="mt-3 rounded-lg border border-border bg-surface-muted p-3">
                                        <p className="text-sm font-medium text-text">
                                            {selectedMedia.type === "REEL"
                                                ? "Reel"
                                                : "Post"}
                                        </p>

                                        {selectedMedia.title && (
                                            <p className="mt-1 text-xs text-text-secondary">
                                                {selectedMedia.title}
                                            </p>
                                        )}
                                    </div>
                                )}

                                {instagramMediaError && (
                                    <p className="mt-1.5 text-xs text-danger">
                                        {instagramMediaError}
                                    </p>
                                )}

                                {!loadingInstagramMedia &&
                                    !instagramMediaError &&
                                    instagramMedia.length === 0 && (
                                    <p className="mt-1.5 text-xs text-text-secondary">
                                        No Instagram posts or reels were
                                        found.
                                    </p>
                                    )}
                            </div>
                        )}

                        <div>
                            <label className="mb-2 block text-sm font-medium text-text">
                                Keywords
                            </label>

                            <div className="space-y-2">
                                {displayKeywords.map(
                                    (keyword, index) => (
                                        <div
                                            key={index}
                                            className="flex gap-2"
                                        >
                                            <input
                                                type="text"
                                                value={keyword}
                                                onChange={(event) => {
                                                    const nextKeywords =
                                                        [...keywords];

                                                    nextKeywords[index] =
                                                        event.target.value;

                                                    updateKeywords(
                                                        nextKeywords,
                                                    );
                                                }}
                                                placeholder="e.g. price"
                                                className={`min-w-0 flex-1 ${inputClassName}`}
                                            />

                                            {keywords.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        updateKeywords(
                                                            keywords.filter(
                                                                (
                                                                    _,
                                                                    keywordIndex,
                                                                ) =>
                                                                    keywordIndex !==
                                                                    index,
                                                            ),
                                                        )
                                                    }
                                                    className="rounded-lg border border-border px-3 text-sm text-text-secondary hover:border-danger/30 hover:bg-danger/5 hover:text-danger"
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
                                Start this automation when a comment
                                matches the configured keywords.
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
            case "STORY_REPLY":
                return (
                    <div className="space-y-4">
                        <div>
                            <label className="mb-2 block text-sm font-medium text-text">
                                Story
                            </label>

                            <select
                                value="ALL"
                                disabled
                                className={selectClassName}
                            >
                                <option value="ALL">
                                    Any story
                                </option>
                            </select>

                            <p className="mt-1.5 text-xs text-text-secondary">
                                Start this automation when someone replies to any
                                Instagram story.
                            </p>
                        </div>
                    </div>
                );

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
        console.log(label)
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
        <>
            <div
                className="fixed inset-0 z-[90] bg-black/50 sm:hidden"
                onClick={onClose}
                aria-hidden="true"
            />

            <aside className="fixed inset-x-0 bottom-0 z-[100] flex max-h-[88dvh] w-full flex-col overflow-hidden rounded-t-2xl border border-border bg-surface shadow-2xl sm:absolute sm:inset-y-0 sm:bottom-auto sm:left-auto sm:right-0 sm:max-h-none sm:w-[340px] sm:rounded-none sm:rounded-l-2xl sm:border-y-0 sm:border-r-0 sm:border-l">
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

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 [touch-action:pan-y] sm:p-5">
                {renderContent()}
            </div>
        </aside>
        </>
    );
};

export default NodeConfigPanel;