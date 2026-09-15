import {
    AtSign,
    MessageCircle,
    X,
} from "lucide-react";

interface TriggerSelectorProps {
    currentType: string | null;
    onSelect: (trigger: {
        type: string;
        config?: Record<string, unknown>;
    }) => void;
    onClose: () => void;
}

const triggers = [
    {
        type: "INSTAGRAM_COMMENT",
        label: "Instagram Comment",
        description:
            "Start when someone comments on an Instagram post.",
        icon: MessageCircle,
    },
    {
        type: "INSTAGRAM_STORY_REPLY",
        label: "Story Reply",
        description:
            "Start when someone replies to an Instagram story.",
        icon: MessageCircle,
    },
    {
        type: "INSTAGRAM_DM",
        label: "Instagram DM",
        description:
            "Start when someone sends a message to your account.",
        icon: AtSign,
    },
];

const TriggerSelector = ({
    currentType,
    onSelect,
    onClose,
}: TriggerSelectorProps) => {
    return (
        <div className="absolute left-5 top-20 z-30 w-[360px] rounded-2xl border border-border bg-surface shadow-2xl">
            <div className="flex items-center justify-between border-b border-border px-4 py-4">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                        Trigger
                    </p>

                    <h3 className="mt-1 text-sm font-semibold text-text">
                        When should this automation start?
                    </h3>
                </div>

                <button
                    type="button"
                    onClick={onClose}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-text-secondary transition-colors hover:bg-surface-muted hover:text-text"
                    aria-label="Close trigger selector"
                >
                    <X size={17} />
                </button>
            </div>

            <div className="space-y-2 p-3">
                {triggers.map((trigger) => {
                    const Icon =
                        trigger.icon;

                    const selected =
                        currentType ===
                        trigger.type;

                    return (
                        <button
                            key={
                                trigger.type
                            }
                            type="button"
                            onClick={() =>
                                onSelect({
                                    type:
                                        trigger.type,
                                    config: {},
                                })
                            }
                            className={[
                                "flex w-full items-start gap-3 rounded-xl border p-3 text-left transition-all",
                                selected
                                    ? "border-primary/40 bg-primary/10"
                                    : "border-border hover:border-primary/30 hover:bg-surface-muted",
                            ].join(" ")}
                        >
                            <div
                                className={[
                                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                                    selected
                                        ? "bg-primary/15 text-primary"
                                        : "bg-surface-muted text-text-secondary",
                                ].join(" ")}
                            >
                                <Icon size={18} />
                            </div>

                            <div className="min-w-0">
                                <p className="text-sm font-semibold text-text">
                                    {
                                        trigger.label
                                    }
                                </p>

                                <p className="mt-1 text-xs leading-5 text-text-secondary">
                                    {
                                        trigger.description
                                    }
                                </p>
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default TriggerSelector;