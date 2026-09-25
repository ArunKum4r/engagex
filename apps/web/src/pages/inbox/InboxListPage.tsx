import {
    MessageCircle,
    Search,
} from "lucide-react";
import {
    useEffect,
    useState,
} from "react";
import { useNavigate } from "react-router-dom";

import {
    getConversations,
    type ConversationSummary,
} from "../../api/conversations";
import { useWorkspaceStore } from "../../stores/workspace.store";

const Inbox = () => {
    const navigate = useNavigate();

    const workspaceId =
        useWorkspaceStore(
            (state) =>
                state.currentWorkspace?.workspace?.id,
        );

    const [conversations, setConversations] =
        useState<ConversationSummary[]>([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState<string | null>(null);

    const [search, setSearch] =
        useState("");

    useEffect(() => {
        if (!workspaceId) {
            setLoading(false);
            return;
        }

        const loadConversations = async () => {
            try {
                setLoading(true);
                setError(null);

                const response =
                    await getConversations({
                        workspaceId,
                    });

                setConversations(
                    response.items,
                );
            } catch (err) {
                setError(
                    err instanceof Error
                        ? err.message
                        : "Failed to load conversations",
                );
            } finally {
                setLoading(false);
            }
        };

        loadConversations();
    }, [workspaceId]);

    const filteredConversations =
        conversations.filter(
            (conversation) => {
                const name =
                    conversation.contact?.name ??
                    "";

                return name
                    .toLowerCase()
                    .includes(
                        search
                            .trim()
                            .toLowerCase(),
                    );
            },
        );

    return (
        <div className="flex h-full min-h-0 flex-col">
            <div className="shrink-0 border-b border-border pb-5">
                <h1 className="text-xl font-semibold tracking-tight text-text">
                    Inbox
                </h1>

                <p className="mt-1 text-sm text-text-muted">
                    Manage your conversations
                </p>
            </div>

            <div className="min-h-0 flex-1 overflow-hidden pt-5">
                <div className="flex h-full min-h-0 overflow-hidden rounded-lg border border-border bg-surface">
                    <div className="flex w-full min-w-0 flex-col">
                        <div className="shrink-0 border-b border-border p-4">
                            <div className="relative">
                                <Search
                                    size={16}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
                                />

                                <input
                                    value={search}
                                    onChange={(event) =>
                                        setSearch(
                                            event.target.value,
                                        )
                                    }
                                    placeholder="Search conversations..."
                                    className="h-9 w-full rounded-md border border-border bg-surface-muted/40 pl-9 pr-3 text-sm text-text outline-none placeholder:text-text-muted focus:border-accent"
                                />
                            </div>
                        </div>

                        <div className="min-h-0 flex-1 overflow-y-auto">
                            {loading ? (
                                <div className="flex h-full items-center justify-center">
                                    <p className="text-sm text-text-muted">
                                        Loading conversations...
                                    </p>
                                </div>
                            ) : error ? (
                                <div className="flex h-full items-center justify-center px-6 text-center">
                                    <p className="text-sm text-red-500">
                                        {error}
                                    </p>
                                </div>
                            ) : filteredConversations.length ===
                              0 ? (
                                <div className="flex h-full flex-col items-center justify-center px-6 text-center">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-muted">
                                        <MessageCircle
                                            size={22}
                                            className="text-text-muted"
                                        />
                                    </div>

                                    <p className="mt-4 text-sm font-medium text-text">
                                        No conversations
                                    </p>

                                    <p className="mt-1 text-sm text-text-muted">
                                        Conversations will appear here.
                                    </p>
                                </div>
                            ) : (
                                <div>
                                    {filteredConversations.map(
                                        (conversation) => {
                                            const contact =
                                                conversation.contact;

                                            const name =
                                                contact?.name ??
                                                "No Name";

                                            return (
                                                <button
                                                    key={
                                                        conversation.id
                                                    }
                                                    type="button"
                                                    onClick={() =>
                                                        navigate(
                                                            `/contacts/${conversation.contactId}`,
                                                        )
                                                    }
                                                    className="flex w-full items-center gap-3 border-b border-border p-4 text-left transition-colors hover:bg-surface-muted/40"
                                                >
                                                    {contact?.avatarUrl ? (
                                                        <img
                                                            src={
                                                                contact.avatarUrl
                                                            }
                                                            alt=""
                                                            className="h-10 w-10 shrink-0 rounded-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-soft text-sm font-semibold text-accent">
                                                            {name
                                                                .charAt(
                                                                    0,
                                                                )
                                                                .toUpperCase()}
                                                        </div>
                                                    )}

                                                    <div className="min-w-0 flex-1">
                                                        <div className="flex items-center justify-between gap-3">
                                                            <p className="truncate text-sm font-medium text-text">
                                                                {name}
                                                            </p>

                                                            {conversation.lastMessageAt && (
                                                                <span className="shrink-0 text-[11px] text-text-muted">
                                                                    {new Date(
                                                                        conversation.lastMessageAt,
                                                                    ).toLocaleTimeString(
                                                                        undefined,
                                                                        {
                                                                            hour: "numeric",
                                                                            minute: "2-digit",
                                                                        },
                                                                    )}
                                                                </span>
                                                            )}
                                                        </div>

                                                        <div className="mt-1 flex items-center justify-between gap-3">
                                                            <p className="truncate text-xs text-text-muted">
                                                                Instagram
                                                            </p>

                                                            {conversation.unreadCount >
                                                                0 && (
                                                                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1.5 text-[10px] font-semibold text-accent-foreground">
                                                                    {
                                                                        conversation.unreadCount
                                                                    }
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
                </div>
            </div>
        </div>
    );
};

export default Inbox;