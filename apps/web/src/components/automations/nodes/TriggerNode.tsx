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
    isPlaceholder?: boolean;
}

const TriggerNode = ({
    data,
}: NodeProps) => {
    const nodeData =
        data as unknown as TriggerNodeData;

    const isPlaceholder =
        nodeData.isPlaceholder ===
        true;

    const title =
        nodeData.label ??
        "Choose a trigger";

    return (
        <div
            className={[
                "w-[360px] overflow-hidden rounded-2xl border bg-surface shadow-xl",
                isPlaceholder
                    ? "border-dashed border-primary/50"
                    : "border-primary/30",
            ].join(" ")}
        >
            <div className="flex items-center gap-3 border-b border-border bg-primary/10 px-5 py-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
                    <MessageCircle
                        size={19}
                    />
                </div>

                <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-primary">
                        Trigger
                    </p>

                    <p className="mt-0.5 text-xs text-text-secondary">
                        Automation starts here
                    </p>
                </div>
            </div>

            <div className="px-5 py-5">
                {isPlaceholder ? (
                    <>
                        <p className="text-base font-semibold text-text">
                            Choose when this automation starts
                        </p>

                        <p className="mt-1.5 text-sm leading-6 text-text-secondary">
                            Select an Instagram event to begin this workflow.
                        </p>

                        <div className="mt-4 flex items-center gap-2 rounded-xl border border-dashed border-primary/40 bg-primary/5 px-3 py-2.5 text-sm font-medium text-primary">
                            Select trigger
                            <ChevronDown
                                size={16}
                            />
                        </div>
                    </>
                ) : (
                    <>
                        <p className="text-lg font-semibold capitalize text-text">
                            {title
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

                        <p className="mt-1.5 text-sm leading-6 text-text-secondary">
                            This event starts the automation workflow.
                        </p>
                    </>
                )}
            </div>

            <Handle
                id="default"
                type="source"
                position={
                    Position.Bottom
                }
                className="!h-3 !w-3 !border-2 !border-surface !bg-primary"
            />
        </div>
    );
};

export default TriggerNode;