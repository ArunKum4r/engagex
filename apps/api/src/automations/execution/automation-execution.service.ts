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
    findActiveAutomationTriggers,
    findActiveContactAutomationPauses
} from "@engagex/db";

import type { AutomationExecutionContext } from "./execution-context.js";
import type { AutomationStep } from "./step-executor.js";

import { AutomationStepExecutorService } from "./automation-step-executor.service.js";

@Injectable()
export class AutomationExecutionService {
    constructor(
        private readonly stepExecutor: AutomationStepExecutorService,
    ) {}

    async execute(automationId: string, input: Record<string, unknown> = {}, dryRun = true, platformAccountId?: string) {
        const graph = await findAutomationWithGraph(automationId);
        if (!graph) {
            throw new NotFoundException("Automation not found");
        }
        
        const automation = graph.automation;
        console.log("Automation execution context source:", {
            automationId,
            workspaceId: automation?.workspaceId,
            platformAccountId: automation?.platformAccountId,
        });

        const trigger = graph.triggers[0] ?? null;

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
            platformAccountId: platformAccountId ?? automation.platformAccountId,

        };

        await updateAutomationExecution(execution.id, {
            startedAt: new Date(),
        });

        try {
            await this.executeFromStep(
                trigger.entryStepId,
                graph.steps,
                graph.edges,
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
    
    async executeFromTrigger(
        platformAccountId: string,
        input: Record<string, unknown> = {},
        dryRun = false,
        eventType?: string
    ) {
        const activeTriggers = await findActiveAutomationTriggers(platformAccountId);

        const contactId =
            typeof input.contactId === "string"
                ? input.contactId
                : null;

        let pauseAll = false;
        const pausedAutomationIds = new Set<string>();

        if (contactId) {
            const pauses = await findActiveContactAutomationPauses(contactId);

            pauseAll = pauses.some((pause) => pause.automationId === null);

            for (const pause of pauses) {
                if (pause.automationId) {
                    pausedAutomationIds.add(
                        pause.automationId,
                    );
                }
            }
        }

        const results: Array<{
            automationId: string;
            result: {
                executionId: string;
                steps: unknown[];
            };
        }> = [];

        for (const item of activeTriggers) {
            if (eventType && item.trigger.type !== eventType) {
                continue;
            }

            if (contactId && (pauseAll || pausedAutomationIds.has(item.automation.id))) {
                console.log(
                    "Automation paused for contact:",
                    {
                        automationId: item.automation.id,
                        contactId,
                        pauseAll,
                    },
                );

                continue;
            }

            const matched = this.matchesTrigger(item.trigger.type, item.trigger.config, input);

            console.log("Automation trigger check:", {
                automationId: item.automation.id,
                triggerType: item.trigger.type,
                triggerConfig: item.trigger.config,
                message: input.message,
                matched,
            });

            if (!matched) {
                continue;
            }

            console.log("Starting automation execution:", {
                automationId: item.automation.id,
            });

            const result = await this.execute(
                item.automation.id,
                input,
                dryRun,
                platformAccountId
            );

            console.log(
                "Automation execution finished:",
                result,
            );

            results.push({
                automationId: item.automation.id,
                result,
            });
        }

        return results;
    }

    private matchesTrigger(
        triggerType: string,
        config: unknown,
        input: Record<string, unknown>,
    ) {
        if (
            triggerType !== "INSTAGRAM_DM" &&
            triggerType !== "INSTAGRAM_COMMENT" &&
            triggerType !== "INSTAGRAM_STORY_REPLY"
        ) {
            return false;
        }

        const triggerConfig =
            config &&
            typeof config === "object" &&
            !Array.isArray(config)
                ? config as Record<string, unknown>
                : {};
        
        if (triggerType === "INSTAGRAM_STORY_REPLY") {
            return true;
        }

        if (triggerType === "INSTAGRAM_COMMENT") {
            const target =
                triggerConfig.target === "SPECIFIC"
                    ? "SPECIFIC"
                    : "ALL";

            if (target === "SPECIFIC") {
                const contentId =
                    typeof triggerConfig.contentId === "string"
                        ? triggerConfig.contentId
                        : "";

                const mediaId =
                    typeof input.mediaId === "string"
                        ? input.mediaId
                        : "";

                if (!contentId || !mediaId || contentId !== mediaId) {
                    return false;
                }
            }
        }

        const keywords =
            Array.isArray(triggerConfig.keywords)
                ? triggerConfig.keywords.filter(
                    (keyword): keyword is string =>
                        typeof keyword === "string" &&
                        keyword.trim().length > 0,
                )
                : [];

        if (keywords.length === 0) {
            return true;
        }

        const message =
            typeof input.message === "string"
                ? input.message.trim().toLowerCase()
                : "";

        if (!message) {
            return false;
        }

        const matchedKeywords =
            keywords.filter((keyword) =>
                message.includes(
                    keyword.trim().toLowerCase(),
                ),
            );

        const matchMode =
            triggerConfig.match === "ALL"
                ? "ALL"
                : "ANY";

        return matchMode === "ALL"
            ? matchedKeywords.length === keywords.length
            : matchedKeywords.length > 0;
    }
}