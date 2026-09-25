export type MessageType =
    | "TEXT"
    | "IMAGE"
    | "VIDEO"
    | "AUDIO"
    | "FILE";

export interface SendMessageInput {
    workspaceId: string;
    conversationId: string;
    userId: string;
    type: MessageType;
    content: string;
}

export interface SendMessageResult {
    externalMessageId: string | null;
    metadata?: Record<string, unknown>;
}

export interface MessagingAdapterInput {
    accessToken: string;
    accountExternalId: string;
    recipientExternalId: string;
    type: MessageType;
    content: string;
}

export interface MessagingAdapter {
    readonly platform: string;

    sendMessage(
        input: MessagingAdapterInput,
    ): Promise<SendMessageResult>;
}