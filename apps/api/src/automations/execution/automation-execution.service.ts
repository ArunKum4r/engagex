import {
    Injectable,
    NotFoundException,
} from "@nestjs/common";

import {
    createAutomationExecution,
    createAutomationExecutionStep,
    findAutomationExecutionSteps,
    findAutomationWithGraph,
    updateAutomationExecution,
    updateAutomationExecutionStep,
} from "@engagex/db";

import type { AutomationExecutionContext } from "./execution-context.js";
import type { AutomationStep } from "./step-executor.js";

import { AutomationStepExecutorService } from "./automation-step-executor.service.js";

@Injectable()
export class AutomationExecutionService {
    constructor(
        private readonly stepExecutor: AutomationStepExecutorService,
    ) {}

    async execute(automationId: string, input: Record<string, unknown> = {}, dryRun = true) {
        const automation = await findAutomationWithGraph(automationId);
        if (!automation) {
            throw new NotFoundException("Automation not found");
        }

        const trigger = automation.triggers[0] ?? null;

        if (!trigger?.entryStepId) {
            throw new NotFoundException(
                "Automation does not have an entry step",
            );
        }

        const execution = await createAutomationExecution({
            automationId,
            status: "RUNNING",
            input,
        });

        if (!execution) {
            throw new Error("Failed to create automation execution");
        }

        const context: AutomationExecutionContext = {
            executionId: execution.id,
            automationId,
            input,
            variables: {},
            dryRun,
            workspaceId: automation.workspaceId,
            platformAccountId: automation.platformAccountId,

        };

        await updateAutomationExecution(execution.id, {
            startedAt: new Date(),
        });

        try {
            await this.executeFromStep(
                trigger.entryStepId,
                automation.steps,
                automation.edges,
                context,
            );

            const steps = await findAutomationExecutionSteps(
                execution.id,
            );

            const failedStep = steps.find(
                (step) => step.status === "FAILED",
            );

            if (failedStep) {
                await updateAutomationExecution(execution.id, {
                    status: "FAILED",
                    output: {
                        failedStepId: failedStep.stepId,
                    },
                    errorMessage:
                        failedStep.errorMessage ??
                        "Automation step failed",
                    completedAt: new Date(),
                });

                return await this.getExecutionResult(execution.id);
            }

            await updateAutomationExecution(execution.id, {
                status: "COMPLETED",
                output: {
                    dryRun,
                },
                completedAt: new Date(),
            });

            return await this.getExecutionResult(execution.id);
        } catch (error) {
            const errorMessage =
                error instanceof Error
                    ? error.message
                    : "Automation execution failed";

            await updateAutomationExecution(execution.id, {
                status: "FAILED",
                errorMessage,
                completedAt: new Date(),
            });

            return await this.getExecutionResult(execution.id);
        }
    }

    private async executeFromStep(
        stepId: string,
        steps: Array<{
            id: string;
            type: string;
            config: unknown;
        }>,
        edges: Array<{
            fromStepId: string;
            toStepId: string;
            branch: string | null;
        }>,
        context: AutomationExecutionContext,
    ): Promise<void> {
        const step = steps.find((item) => item.id === stepId);
        if (!step) {
            throw new Error(`Automation step not found: ${stepId}`);
        }

        const executionStep = await createAutomationExecutionStep({
            executionId: context.executionId,
            stepId: step.id,
            status: "RUNNING",
            input: context.input,
        });

        if (!executionStep) {
            throw new Error(
                `Failed to create execution step: ${step.id}`,
            );
        }

        await updateAutomationExecutionStep(executionStep.id, {
            startedAt: new Date(),
        });

        const config =
            step.config &&
            typeof step.config === "object" &&
            !Array.isArray(step.config)
                ? (step.config as Record<string, unknown>)
                : {};

        const automationStep: AutomationStep = {
            id: step.id,
            type: step.type,
            config,
        };

        const result = await this.stepExecutor.execute(
            automationStep,
            context,
        );

        if (result.type === "FAILED") {
            await updateAutomationExecutionStep(executionStep.id, {
                status: "FAILED",
                output: result.output ?? null,
                errorMessage: result.errorMessage,
                completedAt: new Date(),
            });

            return;
        }

        await updateAutomationExecutionStep(executionStep.id, {
            status:
                result.type === "WAIT"
                    ? "PENDING"
                    : "COMPLETED",
            output: result.output ?? null,
            completedAt:
                result.type === "WAIT"
                    ? null
                    : new Date(),
        });

        if (
            result.type === "WAIT" ||
            result.type === "COMPLETE"
        ) {
            return;
        }

        const outgoingEdges = edges.filter(
            (edge) => edge.fromStepId === step.id,
        );

        let nextEdge;

        if (result.type === "BRANCH") {
            nextEdge = outgoingEdges.find(
                (edge) => edge.branch === result.branch,
            );
        } else {
            nextEdge =
                outgoingEdges.find(
                    (edge) => !edge.branch,
                ) ??
                outgoingEdges[0];
        }

        if (!nextEdge) {
            return;
        }

        await this.executeFromStep(
            nextEdge.toStepId,
            steps,
            edges,
            context,
        );
    }

    private async getExecutionResult(executionId: string) {
        const executionSteps =
            await findAutomationExecutionSteps(
                executionId,
            );

        return {
            executionId,
            steps: executionSteps,
        };
    }
}