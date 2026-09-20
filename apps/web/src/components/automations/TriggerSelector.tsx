import { X } from "lucide-react";
import { getPlatformCapabilities } from "./capabilities";

interface TriggerSelectorProps {
    currentType: string | null;
    platform: string | null;
    onSelect: (trigger: {
        type: string;
        config?: Record<string, unknown>;
    }) => void;
    onClose: () => void;
}

const TriggerSelector = ({
    currentType,
    onSelect,
    onClose,
    platform,
}: TriggerSelectorProps) => {
    const capabilities =
        getPlatformCapabilities(platform);

    const triggers =
        capabilities?.triggers ?? [];

    return (
        <div className="absolute left-2 right-2 top-16 z-30 w-auto max-w-[calc(100%-1rem)] rounded-2xl border border-border bg-surface shadow-2xl sm:left-5 sm:right-auto sm:top-20 sm:w-[360px]">
            <div className="flex items-center justify-between border-b border-border bg-surface/95 px-4 py-4 backdrop-blur">
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
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-text-secondary transition-colors hover:bg-surface-muted hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
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
                            key={trigger.type}
                            type="button"
                            onClick={() =>
                                onSelect({
                                    type: trigger.type,
                                    config: {},
                                })
                            }
                            className={[
                                "group flex w-full items-start gap-3 rounded-xl border p-3.5 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
                                selected
                                    ? "border-primary/40 bg-primary/10 shadow-sm shadow-primary/10"
                                    : "border-border bg-surface hover:border-primary/30 hover:bg-surface-muted",
                            ].join(" ")}
                        >
                            <div
                                className={[
                                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-colors",
                                    selected
                                        ? "bg-primary/15 text-primary"
                                        : "border-border bg-surface-muted text-text-secondary group-hover:border-primary/20 group-hover:text-primary",
                                ].join(" ")}
                            >
                                <Icon size={18} />
                            </div>

                            <div className="min-w-0">
                                <p className="text-sm font-semibold text-text">
                                    {trigger.label}
                                </p>

                                <p className="mt-1 text-xs leading-5 text-text-secondary">
                                    {trigger.description}
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