import type { ContactMessage } from "../../api/contact";

const formatMessageTime = (date: string) => {
    return new Date(date).toLocaleString(undefined, {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
    });
};

const MessageBubble = ({
    message,
    contactId,
}: {
    message: ContactMessage;
    contactId: string;
}) => {
    const isInbound =
        message.direction === "INBOUND" ||
        message.senderContactId === contactId;

    return (
        <div
            className={[
                "flex",
                isInbound
                    ? "justify-start"
                    : "justify-end",
            ].join(" ")}
        >
            <div
                className={[
                    "max-w-[75%] rounded-2xl px-4 py-2.5",
                    isInbound
                        ? "rounded-bl-md bg-surface-muted text-text"
                        : "rounded-br-md bg-accent text-accent-foreground",
                ].join(" ")}
            >
                {message.content && (
                    <p className="whitespace-pre-wrap text-sm leading-5">
                        {message.content}
                    </p>
                )}

                <p
                    className={[
                        "mt-1 text-[11px]",
                        isInbound
                            ? "text-text-muted"
                            : "text-accent-foreground/70",
                    ].join(" ")}
                >
                    {formatMessageTime(message.createdAt)}
                </p>
            </div>
        </div>
    );
};

export default MessageBubble;