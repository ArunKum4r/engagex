import {
    Bell,
    CalendarClock,
    Check,
    MessageCircle,
    MoreHorizontal,
    Plus,
    X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

import {
    sendConversationMessage,
} from "../../api/conversations";

import type {
    ContactConversation,
    ContactMessage,
} from "../../api/contact";

import {
    cancelConversationReminder,
    completeConversationReminder,
    createConversationReminder,
    getConversationReminders,
    type ConversationReminder,
} from "../../api/conversations";

import MessageBubble from "./MessageBubble";

const ConversationPanel = ({
    conversation,
    contactId,
    contactName,
    onBack,
    showBackButton = false,
}: {
    conversation: ContactConversation;
    contactId: string;
    contactName?: string;
    onBack?: () => void;
    showBackButton?: boolean;
}) => {
    const [message, setMessage] = useState("");
    const [sending, setSending] = useState(false);
    const [sendError, setSendError] =
        useState<string | null>(null);

    const [messages, setMessages] =
        useState<ContactMessage[]>(
            conversation.messages,
        );

    const [reminders, setReminders] =
        useState<ConversationReminder[]>([]);

    const [reminderPanelOpen, setReminderPanelOpen] =
        useState(false);

    const [reminderForm, setReminderForm] =
        useState({
            title: "",
            description: "",
            remindAt: "",
        });

    const [reminderLoading, setReminderLoading] =
        useState(false);

    const [reminderError, setReminderError] =
        useState<string | null>(null);

    const messagesEndRef =
        useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        setMessages(conversation.messages);
    }, [conversation.messages]);

    useEffect(() => {
        const loadReminders = async () => {
            try {
                const data =
                    await getConversationReminders({
                        workspaceId:
                            conversation.workspaceId,
                        conversationId:
                            conversation.id,
                    });

                setReminders(data);
            } catch (err) {
                setReminderError(
                    err instanceof Error
                        ? err.message
                        : "Failed to load reminders",
                );
            }
        };

        loadReminders();

        setReminderPanelOpen(false);

        setReminderForm({
            title: "",
            description: "",
            remindAt: "",
        });

        setReminderError(null);
    }, [
        conversation.id,
        conversation.workspaceId,
    ]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({
            behavior: "smooth",
        });
    }, [messages]);

    const handleSend = async () => {
        const value = message.trim();

        if (!value || sending) {
            return;
        }

        setSending(true);
        setSendError(null);

        try {
            const sentMessage =
                await sendConversationMessage({
                    workspaceId:
                        conversation.workspaceId,
                    conversationId:
                        conversation.id,
                    payload: {
                        type: "TEXT",
                        content: value,
                    },
                });

            setMessages((current) => [
                ...current,
                sentMessage,
            ]);

            setMessage("");
        } catch (err) {
            setSendError(
                err instanceof Error
                    ? err.message
                    : "Failed to send message",
            );
        } finally {
            setSending(false);
        }
    };

    const handleKeyDown = (
        event: React.KeyboardEvent<HTMLTextAreaElement>,
    ) => {
        if (
            event.key === "Enter" &&
            !event.shiftKey
        ) {
            event.preventDefault();
            handleSend();
        }
    };

    const handleCreateReminder = async () => {
        if (
            !reminderForm.title.trim() ||
            !reminderForm.remindAt ||
            reminderLoading
        ) {
            return;
        }

        setReminderLoading(true);
        setReminderError(null);

        try {
            const reminder =
                await createConversationReminder({
                    workspaceId:
                        conversation.workspaceId,
                    conversationId:
                        conversation.id,
                    data: {
                        title:
                            reminderForm.title.trim(),
                        description:
                            reminderForm.description.trim() ||
                            undefined,
                        remindAt: new Date(
                            reminderForm.remindAt,
                        ).toISOString(),
                    },
                });

            setReminders((current) =>
                [...current, reminder].sort(
                    (a, b) =>
                        new Date(
                            a.remindAt,
                        ).getTime() -
                        new Date(
                            b.remindAt,
                        ).getTime(),
                ),
            );

            setReminderForm({
                title: "",
                description: "",
                remindAt: "",
            });
        } catch (err) {
            setReminderError(
                err instanceof Error
                    ? err.message
                    : "Failed to create reminder",
            );
        } finally {
            setReminderLoading(false);
        }
    };

    const handleCompleteReminder = async (
        reminderId: string,
    ) => {
        try {
            const updated =
                await completeConversationReminder({
                    workspaceId:
                        conversation.workspaceId,
                    conversationId:
                        conversation.id,
                    reminderId,
                });

            setReminders((current) =>
                current.map((reminder) =>
                    reminder.id === reminderId
                        ? updated
                        : reminder,
                ),
            );
        } catch (err) {
            setReminderError(
                err instanceof Error
                    ? err.message
                    : "Failed to complete reminder",
            );
        }
    };

    const handleCancelReminder = async (
        reminderId: string,
    ) => {
        try {
            const updated =
                await cancelConversationReminder({
                    workspaceId:
                        conversation.workspaceId,
                    conversationId:
                        conversation.id,
                    reminderId,
                });

            setReminders((current) =>
                current.map((reminder) =>
                    reminder.id === reminderId
                        ? updated
                        : reminder,
                ),
            );
        } catch (err) {
            setReminderError(
                err instanceof Error
                    ? err.message
                    : "Failed to cancel reminder",
            );
        }
    };

    const pendingReminders =
        reminders.filter(
            (reminder) =>
                reminder.status === "PENDING",
        );

    const formatReminderTime = (
        value: string,
    ) => {
        return new Intl.DateTimeFormat(
            undefined,
            {
                day: "numeric",
                month: "short",
                hour: "numeric",
                minute: "2-digit",
            },
        ).format(new Date(value));
    };

    return (
        <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
            {/* Conversation header */}
            <div className="flex shrink-0 items-center justify-between border-b border-border bg-surface px-3 py-3 sm:px-5 sm:py-3.5">
                <div className="flex min-w-0 items-center gap-2.5">
                    {showBackButton && (
                        <button
                            type="button"
                            onClick={onBack}
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-text-secondary transition-colors hover:bg-surface-muted hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30"
                            aria-label="Back to conversations"
                        >
                            <span className="text-lg leading-none">
                                ←
                            </span>
                        </button>
                    )}

                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent-soft">
                        <MessageCircle
                            size={18}
                            className="text-accent"
                        />
                    </div>

                    <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-text">
                            {contactName ||
                                "Conversation"}
                        </p>

                        <div className="mt-0.5 flex min-w-0 items-center gap-1.5">
                            <span className="text-xs text-text-muted">
                                Instagram
                            </span>

                            <span className="h-1 w-1 shrink-0 rounded-full bg-text-muted" />

                            <span className="text-xs capitalize text-text-muted">
                                {conversation.status.toLowerCase()}
                            </span>

                            {conversation.unreadCount >
                                0 && (
                                <>
                                    <span className="h-1 w-1 shrink-0 rounded-full bg-text-muted" />

                                    <span className="text-xs text-accent">
                                        {
                                            conversation.unreadCount
                                        }{" "}
                                        unread
                                    </span>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex shrink-0 items-center gap-1">
                    {/* Reminder */}
                    <button
                        type="button"
                        onClick={() =>
                            setReminderPanelOpen(
                                (current) =>
                                    !current,
                            )
                        }
                        className={[
                            "relative flex h-8 w-8 items-center justify-center rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30",
                            reminderPanelOpen
                                ? "bg-accent-soft text-accent"
                                : "text-text-muted hover:bg-surface-muted hover:text-text",
                        ].join(" ")}
                        title="Reminders"
                        aria-label="Reminders"
                    >
                        <Bell size={17} />

                        {pendingReminders.length >
                            0 && (
                            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[9px] font-semibold text-accent-foreground">
                                {
                                    pendingReminders.length
                                }
                            </span>
                        )}
                    </button>

                    {/* More */}
                    <button
                        type="button"
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-surface-muted hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30"
                        aria-label="More conversation actions"
                    >
                        <MoreHorizontal
                            size={18}
                        />
                    </button>
                </div>
            </div>

            {/* Reminder panel */}
            {reminderPanelOpen && (
                <div className="absolute right-2 top-12 z-30 w-[min(380px,calc(100vw-1rem))] overflow-hidden rounded-xl border border-border bg-surface shadow-xl">
                    <div className="flex items-center justify-between border-b border-border px-4 py-3">
                        <div>
                            <p className="text-sm font-semibold text-text">
                                Reminders
                            </p>

                            <p className="text-xs text-text-muted">
                                Follow up with this contact
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={() =>
                                setReminderPanelOpen(
                                    false,
                                )
                            }
                            className="flex h-7 w-7 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-surface-muted hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30"
                            aria-label="Close reminders"
                        >
                            <X size={16} />
                        </button>
                    </div>

                    <div className="max-h-[420px] overflow-y-auto">
                        {pendingReminders.length >
                            0 && (
                            <div className="border-b border-border p-3">
                                <div className="space-y-2">
                                    {pendingReminders.map(
                                        (reminder) => (
                                            <div
                                                key={
                                                    reminder.id
                                                }
                                                className="rounded-lg border border-border bg-surface-muted/30 p-3"
                                            >
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="min-w-0">
                                                        <p className="truncate text-sm font-medium text-text">
                                                            {
                                                                reminder.title
                                                            }
                                                        </p>

                                                        {reminder.description && (
                                                            <p className="mt-1 text-xs leading-5 text-text-muted">
                                                                {
                                                                    reminder.description
                                                                }
                                                            </p>
                                                        )}

                                                        <div className="mt-2 flex items-center gap-1.5 text-xs text-text-muted">
                                                            <CalendarClock
                                                                size={
                                                                    13
                                                                }
                                                            />

                                                            <span>
                                                                {formatReminderTime(
                                                                    reminder.remindAt,
                                                                )}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <div className="flex shrink-0 items-center gap-1">
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                handleCompleteReminder(
                                                                    reminder.id,
                                                                )
                                                            }
                                                            className="flex h-7 w-7 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-accent-soft hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30"
                                                            title="Complete"
                                                            aria-label="Complete reminder"
                                                        >
                                                            <Check
                                                                size={
                                                                    15
                                                                }
                                                            />
                                                        </button>

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                handleCancelReminder(
                                                                    reminder.id,
                                                                )
                                                            }
                                                            className="flex h-7 w-7 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-red-500/10 hover:text-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/30"
                                                            title="Cancel"
                                                            aria-label="Cancel reminder"
                                                        >
                                                            <X
                                                                size={
                                                                    15
                                                                }
                                                            />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ),
                                    )}
                                </div>
                            </div>
                        )}

                        <div className="p-3">
                            <div className="mb-3 flex items-center gap-2">
                                <Plus
                                    size={15}
                                    className="text-accent"
                                />

                                <p className="text-sm font-medium text-text">
                                    Add reminder
                                </p>
                            </div>

                            <div className="space-y-2">
                                <input
                                    type="text"
                                    value={
                                        reminderForm.title
                                    }
                                    onChange={(event) =>
                                        setReminderForm(
                                            (current) => ({
                                                ...current,
                                                title: event
                                                    .target
                                                    .value,
                                            }),
                                        )
                                    }
                                    placeholder="Reminder title"
                                    className="h-9 w-full rounded-lg border border-border bg-surface-muted/30 px-3 text-sm text-text outline-none transition-colors placeholder:text-text-muted focus:border-accent focus:bg-surface"
                                />

                                <input
                                    type="datetime-local"
                                    value={
                                        reminderForm.remindAt
                                    }
                                    onChange={(event) =>
                                        setReminderForm(
                                            (current) => ({
                                                ...current,
                                                remindAt:
                                                    event
                                                        .target
                                                        .value,
                                            }),
                                        )
                                    }
                                    className="h-9 w-full rounded-lg border border-border bg-surface-muted/30 px-3 text-sm text-text outline-none transition-colors focus:border-accent focus:bg-surface"
                                />

                                <textarea
                                    value={
                                        reminderForm.description
                                    }
                                    onChange={(event) =>
                                        setReminderForm(
                                            (current) => ({
                                                ...current,
                                                description:
                                                    event
                                                        .target
                                                        .value,
                                            }),
                                        )
                                    }
                                    rows={2}
                                    placeholder="Description (optional)"
                                    className="w-full resize-none rounded-lg border border-border bg-surface-muted/30 px-3 py-2 text-sm text-text outline-none transition-colors placeholder:text-text-muted focus:border-accent focus:bg-surface"
                                />

                                {reminderError && (
                                    <p className="text-xs text-red-500">
                                        {reminderError}
                                    </p>
                                )}

                                <button
                                    type="button"
                                    onClick={
                                        handleCreateReminder
                                    }
                                    disabled={
                                        reminderLoading ||
                                        !reminderForm.title.trim() ||
                                        !reminderForm.remindAt
                                    }
                                    className="flex h-9 w-full items-center justify-center gap-2 rounded-lg bg-accent px-3 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30 disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    <Plus size={15} />

                                    {reminderLoading
                                        ? "Adding..."
                                        : "Add reminder"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Messages */}
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-4 sm:px-5 sm:py-5">
                {messages.length === 0 ? (
                    <div className="flex h-full items-center justify-center">
                        <p className="text-sm text-text-muted">
                            No messages yet
                        </p>
                    </div>
                ) : (
                    <div className="mx-auto flex w-full max-w-5xl flex-col gap-2.5">
                        {messages.map((message) => (
                            <MessageBubble
                                key={message.id}
                                message={message}
                                contactId={contactId}
                            />
                        ))}

                        <div ref={messagesEndRef} />
                    </div>
                )}
            </div>

            {/* Send error */}
            {sendError && (
                <p className="mb-2 px-4 text-xs text-red-500 sm:px-5">
                    {sendError}
                </p>
            )}

            {/* Composer */}
            <div className="shrink-0 border-t border-border bg-surface px-3 py-3 sm:px-5 sm:py-4">
                <div className="flex items-end gap-2 rounded-xl border border-border bg-surface-muted/30 p-1.5 transition-colors focus-within:border-accent focus-within:bg-surface">
                    <textarea
                        value={message}
                        onChange={(event) =>
                            setMessage(
                                event.target.value,
                            )
                        }
                        onKeyDown={handleKeyDown}
                        rows={1}
                        placeholder="Write a message..."
                        className="max-h-32 min-h-10 min-w-0 flex-1 resize-none bg-transparent px-2.5 py-2 text-sm text-text outline-none placeholder:text-text-muted"
                    />

                    <button
                        type="button"
                        onClick={handleSend}
                        disabled={
                            !message.trim() ||
                            sending
                        }
                        className="h-10 shrink-0 rounded-lg bg-accent px-4 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        {sending
                            ? "Sending..."
                            : "Send"}
                    </button>
                </div>

                <p className="mt-2 hidden px-1 text-[11px] text-text-muted sm:block">
                    Press Enter to send · Shift + Enter
                    for a new line
                </p>
            </div>
        </div>
    );
};

export default ConversationPanel;