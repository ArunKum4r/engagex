import type { AutomationExecutionContext } from "./execution-context.js";
import type { AutomationStepResult } from "./step-results.js";

export interface AutomationStep {
    id: string;
    type: string;
    config: Record<string, unknown>;
}

export interface AutomationStepExecutor {
    execute(
        step: AutomationStep,
        context: AutomationExecutionContext,
    ): Promise<AutomationStepResult>;
}