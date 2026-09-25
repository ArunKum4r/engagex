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
    findActiveContactAutomationPauses,
    findAutomationExecutionById,
    findRecentAutomationExecution,
    createAutomationExecutionWithPolicyLock
} from "@engagex/db";

import type { AutomationExecutionContext } from "./execution-context.js";
import type { AutomationStep } from "./step-executor.js";

import { AutomationStepExecutorService } from "./automation-step-executor.service.js";
import { QueueService } from "../../queue/queue.service.js";

@Injectable()
export class AutomationExecutionService {
    constructor(
        private readonly stepExecutor: AutomationStepExecutorService,
        private readonly queueService: QueueService,
    ) {}

    // async execute(automationId: string, input: Record<string, unknown> = {}, dryRun = true, platformAccountId?: string) {
    //     const graph = await findAutomationWithGraph(automationId);
    //     if (!graph) {
    //         throw new NotFoundException("Automation not found");
    //     }
        
    //     const automation = graph.automation;
    //     console.log("Automation execution context source:", {
    //         automationId,
    //         workspaceId: automation?.workspaceId,
    //         platformAccountId: automation?.platformAccountId,
    //     });

    //     const trigger = graph.triggers[0] ?? null;

    //     if (!trigger?.entryStepId) {
    //         throw new NotFoundException(
    //             "Automation does not have an entry step",
    //         );
    //     }

    //     const execution = await createAutomationExecution({
    //         workspaceId: automation.workspaceId,
    //         automationId,
    //         webhookEventId:
    //             typeof input.webhookEventId === "string"
    //                 ? input.webhookEventId
    //                 : null,
    //         contactId:
    //             typeof input.contactId === "string"
    //                 ? input.contactId
    //                 : null,
    //         conversationId:
    //             typeof input.conversationId === "string"
    //                 ? input.conversationId
    //                 : null,
    //         status: "RUNNING",
    //         input,
    //     });

    //     if (!execution) {
    //         throw new Error("Failed to create automation execution");
    //     }

    //     const context: AutomationExecutionContext = {
    //         executionId: execution.id,
    //         automationId,
    //         workspaceId: automation.workspaceId,
    //         contactId: execution.contactId ?? null,
    //         conversationId: execution.conversationId ?? null,
    //         input,
    //         platformAccountId: platformAccountId ?? automation.platformAccountId,
    //         variables: {},
    //         dryRun,
    //     };

    //     await updateAutomationExecution(execution.id, {
    //         startedAt: new Date(),
    //     });

    //     try {
    //         await this.executeFromStep(
    //             trigger.entryStepId,
    //             graph.steps,
    //             graph.edges,
    //             context,
    //         );

    //         const steps = await findAutomationExecutionSteps(
    //             execution.id,
    //         );

    //         const failedStep = steps.find(
    //             (step) => step.status === "FAILED",
    //         );

    //         if (failedStep) {
    //             await updateAutomationExecution(execution.id, {
    //                 status: "FAILED",
    //                 output: {
    //                     failedStepId: failedStep.stepId,
    //                 },
    //                 errorMessage:
    //                     failedStep.errorMessage ??
    //                     "Automation step failed",
    //                 completedAt: new Date(),
    //             });

    //             return await this.getExecutionResult(execution.id);
    //         }

    //         const currentExecution = await findAutomationExecutionById(execution.id);

    //         if (currentExecution?.status === "WAITING") {
    //             return await this.getExecutionResult(execution.id);
    //         }

    //         await updateAutomationExecution(execution.id, {
    //             status: "COMPLETED",
    //             output: {
    //                 dryRun,
    //             },
    //             completedAt: new Date(),
    //         });

    //         return await this.getExecutionResult(execution.id);
    //     } catch (error) {
    //         const errorMessage =
    //             error instanceof Error
    //                 ? error.message
    //                 : "Automation execution failed";

    //         await updateAutomationExecution(execution.id, {
    //             status: "FAILED",
    //             errorMessage,
    //             completedAt: new Date(),
    //         });

    //         return await this.getExecutionResult(execution.id);
    //     }
    // }

    async createExecution(
        automationId: string,
        input: Record<string, unknown> = {},
    ) {
        const graph = await findAutomationWithGraph(automationId);

        if (!graph) {
            throw new NotFoundException("Automation not found");
        }

        const automation = graph.automation;
        const trigger = graph.triggers[0] ?? null;

        if (!trigger?.entryStepId) {
            throw new NotFoundException(
                "Automation does not have an entry step",
            );
        }

        const execution = await createAutomationExecution({
            workspaceId: automation.workspaceId,
            automationId,
            webhookEventId:
                typeof input.webhookEventId === "string"
                    ? input.webhookEventId
                    : null,
            contactId:
                typeof input.contactId === "string"
                    ? input.contactId
                    : null,
            conversationId:
                typeof input.conversationId === "string"
                    ? input.conversationId
                    : null,
            status: "PENDING",
            input,
        });

        if (!execution) {
            throw new Error(
                "Failed to create automation execution",
            );
        }

        return execution;
    }

    async execute(
        automationId: string,
        input: Record<string, unknown> = {},
        dryRun = true,
        platformAccountId?: string,
    ) {
        const execution = await this.createExecution(
            automationId,
            input,
        );

        return this.runExecution(
            execution.id,
            dryRun,
            platformAccountId,
        );
    }

    async executeByExecutionId(
        executionId: string,
        dryRun = false,
    ) {
        const execution =
            await findAutomationExecutionById(
                executionId,
            );

        if (!execution) {
            throw new NotFoundException(
                "Automation execution not found",
            );
        }

        if (
            execution.status !== "PENDING" &&
            execution.status !== "RUNNING"
        ) {
            return this.getExecutionResult(
                execution.id,
            );
        }

        return this.runExecution(
            execution.id,
            dryRun,
        );
    }

    private async runExecution(
        executionId: string,
        dryRun: boolean,
        platformAccountId?: string,
    ) {
        const execution =
            await findAutomationExecutionById(
                executionId,
            );

        if (!execution) {
            throw new NotFoundException(
                "Automation execution not found",
            );
        }

        const graph =
            await findAutomationWithGraph(
                execution.automationId,
            );

        if (!graph) {
            throw new NotFoundException(
                "Automation not found",
            );
        }

        const automation = graph.automation;

        console.log(
            "Automation execution context source:",
            {
                executionId,
                automationId:
                    execution.automationId,
                workspaceId:
                    automation.workspaceId,
                platformAccountId:
                    automation.platformAccountId,
            },
        );

        const trigger =
            graph.triggers[0] ?? null;

        if (!trigger?.entryStepId) {
            throw new NotFoundException(
                "Automation does not have an entry step",
            );
        }

        const input =
            execution.input &&
            typeof execution.input === "object" &&
            !Array.isArray(execution.input)
                ? (execution.input as Record<string, unknown>)
                : {};

        const context: AutomationExecutionContext = {
            executionId: execution.id,
            automationId:
                execution.automationId,
            workspaceId:
                automation.workspaceId,
            contactId:
                execution.contactId ?? null,
            conversationId:
                execution.conversationId ?? null,
            input,
            platformAccountId:
                platformAccountId ??
                automation.platformAccountId,
            variables: {},
            dryRun,
        };

        await updateAutomationExecution(
            execution.id,
            {
                status: "RUNNING",
                startedAt:
                    execution.startedAt ??
                    new Date(),
            },
        );

        try {
            await this.executeFromStep(
                trigger.entryStepId,
                graph.steps,
                graph.edges,
                context,
            );

            const steps =
                await findAutomationExecutionSteps(
                    execution.id,
                );

            const failedStep = steps.find(
                (step) =>
                    step.status === "FAILED",
            );

            if (failedStep) {
                await updateAutomationExecution(
                    execution.id,
                    {
                        status: "FAILED",
                        output: {
                            failedStepId:
                                failedStep.stepId,
                        },
                        errorMessage:
                            failedStep.errorMessage ??
                            "Automation step failed",
                        completedAt: new Date(),
                    },
                );

                return this.getExecutionResult(
                    execution.id,
                );
            }

            const currentExecution =
                await findAutomationExecutionById(
                    execution.id,
                );

            if (
                currentExecution?.status ===
                "WAITING"
            ) {
                return this.getExecutionResult(
                    execution.id,
                );
            }

            await updateAutomationExecution(
                execution.id,
                {
                    status: "COMPLETED",
                    output: {
                        dryRun,
                    },
                    completedAt: new Date(),
                },
            );

            return this.getExecutionResult(
                execution.id,
            );
        } catch (error) {
            const errorMessage =
                error instanceof Error
                    ? error.message
                    : "Automation execution failed";

            await updateAutomationExecution(
                execution.id,
                {
                    status: "FAILED",
                    errorMessage,
                    completedAt: new Date(),
                },
            );

            return this.getExecutionResult(
                execution.id,
            );
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

        if (result.type === "WAIT") {
            const outgoingEdges = edges.filter(
                (edge) => edge.fromStepId === step.id,
            );

            const nextEdge =
                outgoingEdges.find((edge) => !edge.branch) ??
                outgoingEdges[0];

            await updateAutomationExecutionStep(executionStep.id, {
                status: "COMPLETED",
                output: result.output ?? null,
                completedAt: new Date(),
            });

            await updateAutomationExecution(context.executionId, {
                status: "WAITING",
                currentStepId: nextEdge?.toStepId ?? null,
                resumeAt: new Date(Date.now() + result.delayMs),
            });

            return;
        }

        await updateAutomationExecutionStep(executionStep.id, {
            status: "COMPLETED",
            output: result.output ?? null,
            completedAt: new Date(),
        });

        if (result.type === "COMPLETE") {
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
        input: {
            webhookEventId?: string;
            contactId?: string;
            contactIdentityId?: string;
            conversationId?: string;
            messageId?: string;
            commentId?: string;
            message?: string;
            recipientId?: string;
            [key: string]: unknown;
        },
        dryRun = false,
        eventType?: string,
    ) {
        const activeTriggers =
            await findActiveAutomationTriggers(platformAccountId);

        const contactId =
            typeof input.contactId === "string"
                ? input.contactId
                : undefined;

        const contactPauses = contactId
            ? await findActiveContactAutomationPauses(contactId)
            : [];

        const pauseAll = contactPauses.some(
            pause => pause.automationId === null,
        );

        const pausedAutomationIds = new Set(
            contactPauses
                .filter(pause => pause.automationId !== null)
                .map(pause => pause.automationId),
        );

        const candidates: typeof activeTriggers = [];

        for (const item of activeTriggers) {
            if (
                eventType &&
                item.trigger.type !== eventType
            ) {
                continue;
            }

            if (
                contactId &&
                (pauseAll ||
                    pausedAutomationIds.has(
                        item.automation.id,
                    ))
            ) {
                console.log(
                    "Automation paused for contact:",
                    {
                        automationId:
                            item.automation.id,
                        contactId,
                        pauseAll,
                    },
                );
                continue;
            }

            const matched = this.matchesTrigger(
                item.trigger.type,
                item.trigger.config,
                input,
            );

            console.log("Automation trigger check:", {
                automationId: item.automation.id,
                triggerType: item.trigger.type,
                matched,
                input,
            });

            if (!matched) {
                continue;
            }

            candidates.push(item);
        }

        candidates.sort(
            (a, b) =>
                (b.automation.priority ?? 0) -
                (a.automation.priority ?? 0),
        );

        const selectedCandidates: typeof candidates = [];

        for (const candidate of candidates) {
            const executionPolicy =
                candidate.automation.executionPolicy ??
                "EXCLUSIVE";

            if (
                executionPolicy ===
                "ALLOW_MULTIPLE"
            ) {
                selectedCandidates.push(candidate);
                continue;
            }

            const hasExclusive =
                selectedCandidates.some(
                    selected =>
                        selected.automation
                            .executionPolicy !==
                        "ALLOW_MULTIPLE",
                );

            if (!hasExclusive) {
                selectedCandidates.push(candidate);
            }
        }

        const results: Array<{
            automationId: string;
            executionId: string;
        }> = [];

        for (const item of selectedCandidates) {
            console.log(
                "Queueing automation execution:",
                {
                    automationId:
                        item.automation.id,
                    priority:
                        item.automation.priority,
                    executionPolicy:
                        item.automation
                            .executionPolicy,
                    triggerRunPolicy:
                        item.automation
                            .triggerRunPolicy,
                },
            );

            const triggerRunPolicy =
                item.automation.triggerRunPolicy ??
                "EVERY_EVENT";

            const automationContactId =
                contactId ?? null;

            const conversationId =
                typeof input.conversationId ===
                "string"
                    ? input.conversationId
                    : null;

            const executionData = {
                workspaceId:
                    item.automation.workspaceId,
                automationId:
                    item.automation.id,
                webhookEventId:
                    typeof input.webhookEventId ===
                    "string"
                        ? input.webhookEventId
                        : null,
                contactId:
                    automationContactId,
                conversationId,
                status: "PENDING",
                input,
            };

            let execution;

            if (
                triggerRunPolicy ===
                    "ONCE_PER_CONTACT" &&
                automationContactId
            ) {
                const result =
                    await createAutomationExecutionWithPolicyLock(
                        executionData,
                        {
                            scope: "CONTACT",
                        },
                    );

                if (!result.created) {
                    console.log(
                        "Automation skipped: already ran for contact",
                        {
                            automationId:
                                item.automation.id,
                            contactId:
                                automationContactId,
                            existingExecutionId:
                                result.execution
                                    ?.id,
                        },
                    );
                    continue;
                }

                execution = result.execution;
            } else if (
                triggerRunPolicy ===
                    "ONCE_PER_CONVERSATION" &&
                conversationId
            ) {
                const result =
                    await createAutomationExecutionWithPolicyLock(
                        executionData,
                        {
                            scope: "CONVERSATION",
                        },
                    );

                if (!result.created) {
                    console.log(
                        "Automation skipped: already ran for conversation",
                        {
                            automationId:
                                item.automation.id,
                            conversationId,
                            existingExecutionId:
                                result.execution
                                    ?.id,
                        },
                    );
                    continue;
                }

                execution = result.execution;
            } else if (
                triggerRunPolicy === "COOLDOWN" &&
                automationContactId &&
                item.automation.cooldownSeconds &&
                item.automation.cooldownSeconds >
                    0
            ) {
                const since = new Date(
                    Date.now() -
                        item.automation
                            .cooldownSeconds *
                            1000,
                );

                const result =
                    await createAutomationExecutionWithPolicyLock(
                        executionData,
                        {
                            scope: "CONTACT",
                            since,
                        },
                    );

                if (!result.created) {
                    console.log(
                        "Automation skipped: cooldown active",
                        {
                            automationId:
                                item.automation.id,
                            contactId:
                                automationContactId,
                            cooldownSeconds:
                                item.automation
                                    .cooldownSeconds,
                            existingExecutionId:
                                result.execution
                                    ?.id,
                        },
                    );
                    continue;
                }

                execution = result.execution;
            } else {
                execution =
                    await this.createExecution(
                        item.automation.id,
                        input,
                    );
            }

            if (!execution) {
                throw new Error(
                    "Failed to create automation execution",
                );
            }

            if (!dryRun) {
                await this.queueService.enqueueAutomationExecution(
                    {
                        executionId: execution.id,
                    },
                );
            }

            results.push({
                automationId:
                    item.automation.id,
                executionId: execution.id,
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