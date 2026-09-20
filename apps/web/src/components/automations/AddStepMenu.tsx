import { Plus } from "lucide-react";
import { getPlatformCapabilities } from "./capabilities/index";

interface AddStepMenuProps {
    platform: string | null;
    onAddStep: (type: string) => void;
}

const AddStepMenu = ({
    platform,
    onAddStep,
}: AddStepMenuProps) => {
    const capabilities =
        getPlatformCapabilities(platform);

    if (!capabilities) {
        return (
            <div className="absolute left-2 right-2 top-16 z-30 rounded-2xl border border-border bg-surface p-5 shadow-2xl sm:left-5 sm:right-auto sm:top-20 sm:w-[360px]">
                <p className="text-sm font-medium text-text">
                    Platform not available
                </p>

                <p className="mt-1 text-xs leading-5 text-text-secondary">
                    Connect a supported platform to add
                    automation steps.
                </p>
            </div>
        );
    }

    const stepGroups = [
        {
            label: "Conditions",
            items: capabilities.conditions,
        },
        {
            label: "Actions",
            items: capabilities.actions,
        },
        {
            label: "Flow",
            items: capabilities.flow,
        },
    ].filter((group) => group.items.length > 0);

    return (
        <div className="absolute left-2 right-2 top-16 z-30 max-h-[min(520px,calc(100%-5rem))] overflow-y-auto rounded-2xl border border-border bg-surface shadow-2xl sm:left-5 sm:right-auto sm:top-20 sm:w-[360px]">
            <div className="sticky top-0 z-10 border-b border-border bg-surface/95 px-4 py-4 backdrop-blur-xl sm:px-5">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-primary/15 bg-primary/10 text-primary shadow-sm">
                        <Plus
                            size={18}
                            strokeWidth={2}
                        />
                    </div>

                    <div className="min-w-0">
                        <p className="text-sm font-semibold text-text">
                            Add step
                        </p>

                        <p className="mt-0.5 text-xs text-text-secondary">
                            Choose what happens next
                        </p>
                    </div>
                </div>
            </div>

            <div className="space-y-6 p-3 sm:p-4">
                {stepGroups.map((group) => (
                    <div key={group.label}>
                        <div className="mb-2 flex items-center gap-2 px-2">
                            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-text-muted">
                                {group.label}
                            </p>

                            <div className="h-px flex-1 bg-border" />
                        </div>

                        <div className="space-y-1">
                            {group.items.map((item) => {
                                const Icon = item.icon;

                                return (
                                    <button
                                        key={item.type}
                                        type="button"
                                        onClick={() =>
                                            onAddStep(
                                                item.type,
                                            )
                                        }
                                        className="group flex w-full items-center gap-3 rounded-xl border border-transparent p-3 text-left transition-all duration-150 hover:border-primary/20 hover:bg-surface-muted/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 active:scale-[0.99]"
                                    >
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border bg-surface-muted text-text-secondary transition-all duration-150 group-hover:border-primary/20 group-hover:bg-primary/10 group-hover:text-primary">
                                            <Icon
                                                size={17}
                                                strokeWidth={2}
                                            />
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-medium text-text">
                                                {item.label}
                                            </p>

                                            <p className="mt-0.5 text-xs leading-5 text-text-secondary">
                                                {
                                                    item.description
                                                }
                                            </p>
                                        </div>

                                        <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-transparent transition-colors group-hover:bg-primary" />
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AddStepMenu;