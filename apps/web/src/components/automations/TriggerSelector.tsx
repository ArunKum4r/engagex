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
        <>
            <div
                className="fixed inset-0 z-[90] bg-black/50 sm:hidden"
                onClick={onClose}
                aria-hidden="true"
            />

            <div
                className="fixed inset-x-0 bottom-0 z-[100] flex max-h-[88dvh] w-full flex-col overflow-hidden rounded-t-2xl border border-border bg-surface shadow-2xl sm:absolute sm:bottom-auto sm:left-5 sm:right-auto sm:top-20 sm:max-h-[calc(100%-5rem)] sm:w-[360px] sm:rounded-2xl"
                onPointerDownCapture={(event) => event.stopPropagation()}
                onWheelCapture={(event) => event.stopPropagation()}
            >
                <div className="flex shrink-0 items-center justify-between border-b border-border bg-surface/95 px-4 py-4 backdrop-blur">
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

                <div
                    className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-3 [touch-action:pan-y]"
                    onWheel={(event) => event.stopPropagation()}
                    onWheelCapture={(event) => event.stopPropagation()}
                    onPointerDownCapture={(event) => event.stopPropagation()}
                >
                    <div className="space-y-2">
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
            </div>
        </>
    );
};

export default TriggerSelector;