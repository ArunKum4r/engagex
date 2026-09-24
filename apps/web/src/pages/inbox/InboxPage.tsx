import { MessageCircle } from "lucide-react";
import { useEffect, useState } from "react";

import {
    getConversations,
    type ConversationDetails,
    type ConversationSummary,
    getConversation
} from "../../api/conversations";
import ConversationList from "./ConversationList";
import ConversationPanel from "../../components/inbox/ConversationPanel";
import { useWorkspaceStore } from "../../stores/workspace.store";

const Inbox = () => {
    const workspaceId = useWorkspaceStore(
        (state) => state.currentWorkspace?.workspace?.id,
    );

    const [conversations, setConversations] =
        useState<ConversationSummary[]>([]);

    const [selectedConversationId, setSelectedConversationId] =
        useState<string | null>(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(
        null,
    );
    const [selectedConversation, setSelectedConversation] =useState<ConversationDetails | null>(null);
    const [conversationLoading, setConversationLoading] = useState(false);

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
                        page: 1,
                        limit: 50,
                    });

                setConversations(response.items);

                setSelectedConversationId(
                    (current) =>
                        current ??
                        response.items[0]?.id ??
                        null,
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

    useEffect(() => {
        if (
            !workspaceId ||
            !selectedConversationId
        ) {
            setSelectedConversation(null);
            return;
        }

        const loadConversation = async () => {
            try {
                setConversationLoading(true);

                const data = await getConversation({
                    workspaceId,
                    conversationId:
                        selectedConversationId,
                });

                setSelectedConversation(data);
            } catch (err) {
                console.error(
                    "Failed to load conversation",
                    err,
                );

                setSelectedConversation(null);
            } finally {
                setConversationLoading(false);
            }
        };

        loadConversation();
    }, [
        workspaceId,
        selectedConversationId,
    ]);

    const selectedContact =
        selectedConversation?.contact;

    const displayName =
        selectedContact?.name || "No Name";

    if (loading) {
        return (
            <div className="flex min-h-96 items-center justify-center">
                <p className="text-sm text-text-muted">
                    Loading inbox...
                </p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex min-h-96 flex-col items-center justify-center text-center">
                <p className="text-sm font-medium text-red-500">
                    {error}
                </p>
            </div>
        );
    }

    return (
        <div className="flex h-full min-h-0 w-full overflow-hidden rounded-lg border border-border bg-surface">
            <div
                className={[
                    "min-h-0 overflow-hidden",
                    selectedConversation
                        ? "hidden lg:flex"
                        : "flex",
                    "w-full lg:w-[340px] lg:shrink-0",
                ].join(" ")}
            >
                <ConversationList
                    conversations={conversations}
                    selectedConversationId={
                        selectedConversationId
                    }
                    onSelect={(conversation) =>
                        setSelectedConversationId(
                            conversation.id,
                        )
                    }
                />
            </div>

            <div
                className={[
                    "min-h-0 min-w-0 flex-1 overflow-hidden",
                    selectedConversation
                        ? "flex"
                        : "hidden lg:flex",
                ].join(" ")}
            >
                {selectedConversation ? (
                    conversationLoading ? (
                        <div className="flex flex-1 items-center justify-center">
                            <p className="text-sm text-text-muted">
                                Loading conversation...
                            </p>
                        </div>
                    ) : (
                        <ConversationPanel
                            conversation={selectedConversation}
                            contactId={
                                selectedConversation.contactId
                            }
                            contactName={
                                displayName ||
                                selectedConversation.contact?.name ||
                                "No Name"
                            }
                            showBackButton
                            onBack={() =>
                                setSelectedConversationId(null)
                            }
                        />
                    )
                ) : (
                    <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-muted">
                            <MessageCircle
                                size={22}
                                className="text-text-muted"
                            />
                        </div>

                        <h2 className="mt-4 text-sm font-semibold text-text">
                            Select a conversation
                        </h2>

                        <p className="mt-1 max-w-sm text-sm text-text-muted">
                            Choose a conversation from your
                            inbox to view the messages.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Inbox;