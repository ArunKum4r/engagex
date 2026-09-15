import { X } from "lucide-react";
import type { Node } from "@xyflow/react";

interface NodeConfigPanelProps {
    node: Node;
    onClose: () => void;
    onChange: (
        nodeId: string,
        data: Record<string, unknown>,
    ) => void;
}

const NodeConfigPanel = ({
    node,
    onClose,
    onChange,
}: NodeConfigPanelProps) => {
    const stepType =
        typeof node.data.stepType === "string"
            ? node.data.stepType
            : "";

    const config =
        typeof node.data.config === "object" &&
        node.data.config !== null
            ? (node.data.config as Record<string, unknown>)
            : {};

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

    const renderContent = () => {
        switch (stepType) {
            case "KEYWORD_MATCH":
                return (
                    <>
                        <div>
                            <label className="mb-2 block text-sm font-medium text-foreground">
                                Keyword
                            </label>

                            <input
                                type="text"
                                value={
                                    typeof config.keyword ===
                                    "string"
                                        ? config.keyword
                                        : ""
                                }
                                onChange={(event) =>
                                    updateConfig(
                                        "keyword",
                                        event.target.value,
                                    )
                                }
                                placeholder="e.g. GUIDE"
                                className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none transition focus:border-primary"
                            />

                            <p className="mt-1.5 text-xs text-muted-foreground">
                                The workflow continues when the
                                comment matches this keyword.
                            </p>
                        </div>
                    </>
                );

            case "SEND_DM":
                return (
                    <div>
                        <label className="mb-2 block text-sm font-medium text-foreground">
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
                            className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none transition focus:border-primary"
                        />

                        <p className="mt-1.5 text-xs text-muted-foreground">
                            This message will be sent as a
                            private Instagram DM.
                        </p>
                    </div>
                );

            case "REPLY_COMMENT":
                return (
                    <div>
                        <label className="mb-2 block text-sm font-medium text-foreground">
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
                            className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none transition focus:border-primary"
                        />

                        <p className="mt-1.5 text-xs text-muted-foreground">
                            This reply will be posted publicly
                            on the comment.
                        </p>
                    </div>
                );

            case "FOLLOWER_STATUS":
                return (
                    <div>
                        <label className="mb-2 block text-sm font-medium text-foreground">
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
                            className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none transition focus:border-primary"
                        >
                            <option value="FOLLOWING">
                                Following
                            </option>

                            <option value="NOT_FOLLOWING">
                                Not following
                            </option>
                        </select>

                        <p className="mt-1.5 text-xs text-muted-foreground">
                            Checks the person's relationship with
                            your Instagram account.
                        </p>
                    </div>
                );

            case "WAIT":
                return (
                    <div>
                        <label className="mb-2 block text-sm font-medium text-foreground">
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
                                className="min-w-0 flex-1 rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none transition focus:border-primary"
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
                                className="w-32 rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none transition focus:border-primary"
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

                        <p className="mt-1.5 text-xs text-muted-foreground">
                            The workflow will resume after this
                            duration.
                        </p>
                    </div>
                );

            default:
                return (
                    <div className="rounded-lg border border-border bg-muted/30 p-4">
                        <p className="text-sm text-muted-foreground">
                            This step does not have any
                            configuration options yet.
                        </p>
                    </div>
                );
        }
    };

    return (
        <aside className="absolute right-0 top-0 z-20 flex h-full w-[340px] flex-col border-l border-border bg-surface shadow-2xl">
            <div className="flex items-center justify-between border-b border-border px-4 py-4">
                <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-primary">
                        Step
                    </p>

                    <h3 className="mt-1 text-base font-semibold text-foreground">
                        {stepType.replaceAll("_", " ")}
                    </h3>
                </div>

                <button
                    type="button"
                    onClick={onClose}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    aria-label="Close configuration"
                >
                    <X size={18} />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
                {renderContent()}
            </div>
        </aside>
    );
};

export default NodeConfigPanel;