import {
    ChevronDown,
    MessageCircle,
} from "lucide-react";
import {
    Handle,
    Position,
    type NodeProps,
} from "@xyflow/react";

interface TriggerNodeData {
    label?: string;
    triggerType?: string | null;
    platform?: string | null;
    config?: Record<string, unknown>;
    isPlaceholder?: boolean;
}

const getTriggerSummary = (
    triggerType: string | null | undefined,
    config: Record<string, unknown>,
) => {
    if (triggerType === "INSTAGRAM_COMMENT") {
        const target = config.target === "SPECIFIC"
            ? "Specific post or reel"
            : "All posts and reels";
        const keywords = Array.isArray(config.keywords)
            ? config.keywords.filter(
                (keyword): keyword is string =>
                    typeof keyword === "string" && keyword.trim().length > 0,
            )
            : [];

        const keywordSummary = keywords.length > 0
            ? `Keywords: ${keywords.join(", ")}`
            : "Any comment";

        return `${target} · ${keywordSummary}`;
    }

    if (triggerType === "INSTAGRAM_DM") {
        const keywords = Array.isArray(config.keywords)
            ? config.keywords.filter(
                (keyword): keyword is string =>
                    typeof keyword === "string" && keyword.trim().length > 0,
            )
            : [];

        return keywords.length > 0
            ? `Keywords: ${keywords.join(", ")}`
            : "Any direct message";
    }

    if (triggerType === "INSTAGRAM_STORY_REPLY") {
        return "Any Instagram story reply";
    }

    return "Trigger configuration";
};

const TriggerNode = ({
    data,
    selected,
}: NodeProps) => {
    const nodeData =
        data as unknown as TriggerNodeData;

    const isPlaceholder =
        nodeData.isPlaceholder === true;

    const title =
        nodeData.label ?? "Choose a trigger";
    const selectedContentTitle =
        typeof nodeData.config?.contentTitle === "string"
            ? nodeData.config.contentTitle
            : "";

    const selectedContentThumbnail =
        typeof nodeData.config?.contentThumbnail === "string"
            ? nodeData.config.contentThumbnail
            : "";

    const isSpecificComment =
        nodeData.triggerType === "INSTAGRAM_COMMENT" &&
        nodeData.config?.target === "SPECIFIC" &&
        typeof nodeData.config?.contentId === "string" &&
        nodeData.config.contentId.length > 0;


    return (
        <div
            className={[
                "relative w-[min(360px,calc(100vw-2rem))] overflow-visible rounded-2xl border bg-surface shadow-md transition-all duration-200",
                isPlaceholder
                    ? "border-dashed border-primary/40 shadow-primary/5"
                    : "border-primary/25",
                selected
                    ? "ring-2 ring-primary/20 shadow-xl shadow-primary/10"
                    : "hover:border-primary/40 hover:shadow-lg",
            ].join(" ")}
        >
            <div className="flex items-center gap-3 border-b border-border bg-gradient-to-r from-primary/10 via-primary/5 to-transparent px-4 py-3.5 sm:px-5 sm:py-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-primary/15 bg-primary/10 text-primary shadow-sm">
                    <MessageCircle
                        size={18}
                        strokeWidth={2}
                    />
                </div>

                <div className="min-w-0">
                    <div className="flex items-center gap-2">
                        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-primary">
                            Trigger
                        </p>

                        {!isPlaceholder && (
                            <span className="h-1.5 w-1.5 rounded-full bg-success" />
                        )}
                    </div>

                    <p className="mt-0.5 text-xs text-text-secondary">
                        Automation starts here
                    </p>
                </div>
            </div>

            <div className="px-4 py-5 sm:px-5 sm:py-6">
                {isPlaceholder ? (
                    <>
                        <div className="mb-4">
                            <p className="text-[15px] font-semibold text-text">
                                Choose when this automation starts
                            </p>

                            <p className="mt-1.5 max-w-[290px] text-sm leading-6 text-text-secondary">
                                Select an Instagram event to begin this workflow.
                            </p>
                        </div>

                        <div className="flex items-center justify-between gap-3 rounded-xl border border-dashed border-primary/35 bg-primary/5 px-3.5 py-3 text-sm font-semibold text-primary transition-colors hover:border-primary/50 hover:bg-primary/10">
                            <span>Select trigger</span>

                            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
                                <ChevronDown size={15} />
                            </div>
                        </div>
                    </>
                ) : (
                    <>
                            <p className="text-base font-semibold capitalize text-text sm:text-lg">
                            {title
                                    .replaceAll("_", " ")
                                .toLowerCase()
                                .replace(
                                    /^./,
                                    (char) =>
                                        char.toUpperCase(),
                                )}
                        </p>

                        <p className="mt-1.5 text-sm leading-6 text-text-secondary">
                            {getTriggerSummary(
                                nodeData.triggerType,
                                nodeData.config ?? {},
                            )}
                        </p>

                        {isSpecificComment && (
                            <div className="mt-3 flex items-center gap-2.5 rounded-xl border border-border bg-surface-muted/60 p-2">
                                {selectedContentThumbnail ? (
                                    <img
                                        src={selectedContentThumbnail}
                                        alt=""
                                        className="h-10 w-10 shrink-0 rounded-lg object-cover"
                                    />
                                ) : (
                                    <div className="h-10 w-10 shrink-0 rounded-lg bg-surface" />
                                )}

                                <div className="min-w-0">
                                    <p className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">
                                        Selected content
                                    </p>

                                    <p className="mt-0.5 truncate text-xs font-medium text-text">
                                        {selectedContentTitle || "Selected post or reel"}
                                    </p>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            <Handle
                id="default"
                type="source"
                position={Position.Bottom}
                className="!bottom-[-6px] !h-3 !w-3 !border-2 !border-surface !bg-primary !shadow-sm"
            />
        </div>
    );
};

export default TriggerNode;