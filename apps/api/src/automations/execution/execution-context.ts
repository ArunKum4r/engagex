export interface AutomationExecutionContext {
    executionId: string;
    automationId: string;
    workspaceId: string;
    contactId: string | null;
    conversationId: string | null;
    input: Record<string, unknown>;
    platformAccountId: string;
    variables: Record<string, unknown>;
    dryRun: boolean;
}