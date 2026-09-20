export interface AutomationExecutionContext {
    executionId: string;
    automationId: string;
    workspaceId: string;
    input: Record<string, unknown>;
    platformAccountId: string;
    variables: Record<string, unknown>;

    dryRun: boolean;
}