import {
    GitBranch,
    MessageCircle,
    MessageSquare,
    Plus,
    UserCheck,
    Clock,
} from "lucide-react";

interface AddStepMenuProps {
    onAddStep: (type: string) => void;
}

const stepGroups = [
    {
        label: "Conditions",
        items: [
            {
                type: "KEYWORD_MATCH",
                label: "Keyword Match",
                description:
                    "Check whether a comment matches a keyword",
                icon: GitBranch,
            },
            {
                type: "FOLLOWER_STATUS",
                label: "Follower Status",
                description:
                    "Check whether the person follows your account",
                icon: UserCheck,
            },
        ],
    },
    {
        label: "Actions",
        items: [
            {
                type: "SEND_DM",
                label: "Send DM",
                description:
                    "Send a private Instagram message",
                icon: MessageCircle,
            },
            {
                type: "REPLY_COMMENT",
                label: "Reply to Comment",
                description:
                    "Reply publicly to an Instagram comment",
                icon: MessageSquare,
            },
        ],
    },
    {
        label: "Flow",
        items: [
            {
                type: "WAIT",
                label: "Wait",
                description:
                    "Wait before continuing the workflow",
                icon: Clock,
            },
        ],
    },
];

const AddStepMenu = ({
    onAddStep,
}: AddStepMenuProps) => {
    return (
        <div className="absolute left-5 top-20 z-30 max-h-[520px] w-[350px] overflow-y-auto rounded-2xl border border-border bg-surface shadow-2xl">
            <div className="sticky top-0 border-b border-border bg-surface px-4 py-4">
                <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <Plus size={17} />
                    </div>

                    <div>
                        <p className="text-sm font-semibold text-text">
                            Add step
                        </p>

                        <p className="text-xs text-text-secondary">
                            Choose what happens next
                        </p>
                    </div>
                </div>
            </div>

            <div className="space-y-5 p-3">
                {stepGroups.map(
                    (group) => (
                        <div
                            key={
                                group.label
                            }
                        >
                            <p className="mb-2 px-2 text-[10px] font-bold uppercase tracking-[0.14em] text-text-muted">
                                {
                                    group.label
                                }
                            </p>

                            <div className="space-y-1.5">
                                {group.items.map(
                                    (
                                        item,
                                    ) => {
                                        const Icon =
                                            item.icon;

                                        return (
                                            <button
                                                key={
                                                    item.type
                                                }
                                                type="button"
                                                onClick={() =>
                                                    onAddStep(
                                                        item.type,
                                                    )
                                                }
                                                className="flex w-full items-center gap-3 rounded-xl border border-transparent p-3 text-left transition-all hover:border-border hover:bg-surface-muted"
                                            >
                                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border bg-background text-text-secondary">
                                                    <Icon
                                                        size={
                                                            17
                                                        }
                                                    />
                                                </div>

                                                <div className="min-w-0">
                                                    <p className="text-sm font-medium text-text">
                                                        {
                                                            item.label
                                                        }
                                                    </p>

                                                    <p className="mt-0.5 text-xs leading-5 text-text-secondary">
                                                        {
                                                            item.description
                                                        }
                                                    </p>
                                                </div>
                                            </button>
                                        );
                                    },
                                )}
                            </div>
                        </div>
                    ),
                )}
            </div>
        </div>
    );
};

export default AddStepMenu;