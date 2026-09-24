import { MessageCircle, Search } from "lucide-react";
import { useMemo, useState } from "react";

import type { ConversationSummary } from "../../api/conversations";

const formatConversationTime = (date: string | null) => {
    if (!date) {
        return "";
    }

    const value = new Date(date);
    const now = new Date();

    if (value.toDateString() === now.toDateString()) {
        return value.toLocaleTimeString(undefined, {
            hour: "numeric",
            minute: "2-digit",
        });
    }

    return value.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
    });
};

const getDisplayName = (
    conversation: ConversationSummary,
) => {
    return conversation.contact?.name || "No Name";
};

const ConversationList = ({
    conversations,
    selectedConversationId,
    onSelect,
}: {
    conversations: ConversationSummary[];
    selectedConversationId: string | null;
    onSelect: (
        conversation: ConversationSummary,
    ) => void;
}) => {
    const [search, setSearch] = useState("");

    const filteredConversations = useMemo(() => {
        const value = search.trim().toLowerCase();

        if (!value) {
            return conversations;
        }

        return conversations.filter((conversation) => {
            const name = getDisplayName(
                conversation,
            ).toLowerCase();

            const email =
                conversation.contact?.email?.toLowerCase() ||
                "";

            return (
                name.includes(value) ||
                email.includes(value)
            );
        });
    }, [conversations, search]);

    return (
        <div className="flex min-h-0 w-full flex-col bg-surface">
            {/* Header */}
            <div className="shrink-0 border-b border-border px-4 py-4">
                <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                        <h1 className="text-lg font-semibold tracking-tight text-text">
                            Inbox
                        </h1>

                        <p className="mt-0.5 text-xs text-text-muted">
                            {conversations.length}{" "}
                            {conversations.length === 1
                                ? "conversation"
                                : "conversations"}
                        </p>
                    </div>

                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-accent">
                        <MessageCircle size={18} />
                    </div>
                </div>

                {/* Search */}
                <div className="mt-4 flex h-10 items-center gap-2 rounded-lg border border-border bg-surface-muted/30 px-3 transition-colors focus-within:border-accent focus-within:bg-surface">
                    <Search
                        size={16}
                        className="shrink-0 text-text-muted"
                    />

                    <input
                        value={search}
                        onChange={(event) =>
                            setSearch(event.target.value)
                        }
                        placeholder="Search conversations..."
                        className="min-w-0 flex-1 bg-transparent text-sm text-text outline-none placeholder:text-text-muted"
                    />
                </div>
            </div>

            {/* Conversations */}
            <div className="min-h-0 flex-1 overflow-y-auto">
                {filteredConversations.length === 0 ? (
                    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-surface-muted text-text-muted">
                            <MessageCircle size={20} />
                        </div>

                        <p className="mt-3 text-sm font-medium text-text">
                            No conversations
                        </p>

                        <p className="mt-1 max-w-[220px] text-xs leading-5 text-text-muted">
                            {search
                                ? "No conversations match your search."
                                : "Your conversations will appear here."}
                        </p>
                    </div>
                ) : (
                    <div>
                        {filteredConversations.map(
                            (conversation) => {
                                const name =
                                    getDisplayName(
                                        conversation,
                                    );

                                const isSelected =
                                    conversation.id ===
                                    selectedConversationId;

                                return (
                                    <button
                                        key={
                                            conversation.id
                                        }
                                        type="button"
                                        onClick={() =>
                                            onSelect(
                                                conversation,
                                            )
                                        }
                                        className={[
                                            "group flex w-full gap-3 border-b border-border px-4 py-3.5 text-left transition-colors",
                                            isSelected
                                                ? "bg-accent-soft"
                                                : "hover:bg-surface-muted/50",
                                        ].join(" ")}
                                    >
                                        {/* Avatar */}
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-accent-soft text-sm font-semibold text-accent">
                                            {conversation
                                                .contact
                                                ?.avatarUrl ? (
                                                <img
                                                    src={
                                                        conversation
                                                            .contact
                                                            .avatarUrl
                                                    }
                                                    alt=""
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                name
                                                    .charAt(
                                                        0,
                                                    )
                                                    .toUpperCase()
                                            )}
                                        </div>

                                        {/* Content */}
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-2">
                                                <p
                                                    className={[
                                                        "min-w-0 flex-1 truncate text-sm",
                                                        conversation.unreadCount >
                                                        0
                                                            ? "font-semibold text-text"
                                                            : "font-medium text-text",
                                                    ].join(
                                                        " ",
                                                    )}
                                                >
                                                    {name}
                                                </p>

                                                <span className="shrink-0 text-[11px] text-text-muted">
                                                    {formatConversationTime(
                                                        conversation.lastMessageAt,
                                                    )}
                                                </span>
                                            </div>

                                            <div className="mt-1 flex items-center gap-2">
                                                <p className="min-w-0 flex-1 truncate text-xs text-text-muted">
                                                    Instagram
                                                </p>

                                                {conversation.unreadCount >
                                                    0 && (
                                                    <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-accent px-1.5 text-[10px] font-semibold text-accent-foreground">
                                                        {conversation.unreadCount >
                                                        99
                                                            ? "99+"
                                                            : conversation.unreadCount}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </button>
                                );
                            },
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ConversationList;