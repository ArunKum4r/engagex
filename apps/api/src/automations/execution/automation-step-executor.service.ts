import { Injectable } from "@nestjs/common";

import type { AutomationExecutionContext } from "./execution-context.js";
import type {
    AutomationStep,
    AutomationStepExecutor,
} from "./step-executor.js";
import type { AutomationStepResult } from "./step-results.js";
import { InstagramService } from "../../integrations/instagram/instagram.service.js";

@Injectable()
export class AutomationStepExecutorService implements AutomationStepExecutor {

    constructor(
        private readonly instagramService: InstagramService,
    ) {}
    async execute(step: AutomationStep, context: AutomationExecutionContext): Promise<AutomationStepResult> {
        if (context.dryRun) {
            return this.executeDryRun(step, context);
        }

        switch (step.type) {
            case "SEND_DM":
                return this.executeSendDm(step, context);

            case "REPLY_COMMENT":
                return {
                    type: "FAILED",
                    errorMessage: "REPLY_COMMENT is not implemented yet",
                };

            default:
                return {
                    type: "FAILED",
                    errorMessage: `Step execution is not implemented: ${step.type}`,
                };
        }
    }

    private async executeSendDm(
        step: AutomationStep,
        context: AutomationExecutionContext,
    ): Promise<AutomationStepResult> {
        if (!context.platformAccountId) {
            return {
                type: "FAILED",
                errorMessage: "Instagram platform account is missing",
            };
        }

        const recipientId =
            typeof context.input.recipientId === "string"
                ? context.input.recipientId
                : "";

        if (!recipientId) {
            return {
                type: "FAILED",
                errorMessage: "Instagram recipient ID is missing",
            };
        }

        const message =
            typeof step.config.message === "string"
                ? step.config.message.trim()
                : "";

        if (!message) {
            return {
                type: "FAILED",
                errorMessage: "SEND_DM message is missing",
            };
        }

        try {
            const result =
                await this.instagramService.sendMessage(
                    context.workspaceId,
                    context.platformAccountId,
                    recipientId,
                    message,
                );

            return {
                type: "CONTINUE",
                output: {
                    sent: true,
                    platform: "INSTAGRAM",
                    messageId:
                        typeof result?.message_id === "string"
                            ? result.message_id
                            : null,
                },
            };
        } catch (error) {
            return {
                type: "FAILED",
                errorMessage:
                    error instanceof Error
                        ? error.message
                        : "Instagram message failed",
            };
        }
    }

    private executeDryRun(step: AutomationStep, context: AutomationExecutionContext): AutomationStepResult {
        switch (step.type) {
            case "WAIT":
                return {
                    type: "WAIT",
                    output: {
                        dryRun: true,
                        stepType: step.type,
                        config: step.config,
                    },
                };

            case "RANDOMIZER": {
                const configuredPaths =
                    typeof step.config.paths === "number"
                        ? Math.floor(step.config.paths)
                        : 2;

                const pathCount = Math.min(
                    5,
                    Math.max(2, configuredPaths),
                );

                const selectedPath =
                    Math.floor(Math.random() * pathCount) + 1;

                const selectedBranch = `PATH_${selectedPath}`;

                return {
                    type: "BRANCH",
                    branch: selectedBranch,
                    output: {
                        dryRun: true,
                        stepType: step.type,
                        selectedBranch,
                        pathCount,
                        config: step.config,
                    },
                };
            }

            case "KEYWORD_MATCH": {
                const keywords = Array.isArray(step.config.keywords)
                    ? step.config.keywords.filter(
                        (keyword): keyword is string =>
                            typeof keyword === "string" &&
                            keyword.trim().length > 0,
                    )
                    : [];

                const message =
                    typeof context.input.message === "string"
                        ? context.input.message
                        : "";

                const normalizedMessage = message.toLowerCase();

                const matchedKeyword = keywords.find((keyword) =>
                    normalizedMessage.includes(
                        keyword.toLowerCase().trim(),
                    ),
                );

                const matched = Boolean(matchedKeyword);

                return {
                    type: "BRANCH",
                    branch: matched ? "YES" : "NO",
                    output: {
                        dryRun: true,
                        stepType: step.type,
                        matched,
                        matchedKeyword: matchedKeyword ?? null,
                        message,
                        config: step.config,
                    },
                };
            }

            case "FOLLOWER_STATUS": {
                const isFollower =
                    context.input.isFollower === true;

                return {
                    type: "BRANCH",
                    branch: isFollower ? "YES" : "NO",
                    output: {
                        dryRun: true,
                        stepType: step.type,
                        isFollower,
                        config: step.config,
                    },
                };
            }

            case "LAST_INTERACTION": {
                const configuredValue =
                    typeof step.config.value === "number"
                        ? step.config.value
                        : 0;

                const lastInteractionValue =
                    typeof context.input.lastInteractionValue === "number"
                        ? context.input.lastInteractionValue
                        : 0;

                const matched =
                    lastInteractionValue >= configuredValue;

                return {
                    type: "BRANCH",
                    branch: matched ? "YES" : "NO",
                    output: {
                        dryRun: true,
                        stepType: step.type,
                        matched,
                        lastInteractionValue,
                        configuredValue,
                        config: step.config,
                    },
                };
            }

            case "LAST_SEEN": {
                const operator = String(
                    step.config.operator ?? "WITHIN",
                ).toUpperCase();

                const configuredValue =
                    typeof step.config.value === "number"
                        ? step.config.value
                        : Number(step.config.value ?? 0);

                const lastSeenValue =
                    typeof context.input.lastSeenValue === "number"
                        ? context.input.lastSeenValue
                        : 0;

                let matched = false;

                switch (operator) {
                    case "BEFORE":
                        matched = lastSeenValue > configuredValue;
                        break;

                    case "AFTER":
                        matched = lastSeenValue < configuredValue;
                        break;

                    case "WITHIN":
                    default:
                        matched = lastSeenValue <= configuredValue;
                        break;
                }

                return {
                    type: "BRANCH",
                    branch: matched ? "YES" : "NO",
                    output: {
                        dryRun: true,
                        stepType: step.type,
                        matched,
                        operator,
                        lastSeenValue,
                        configuredValue,
                        unit: step.config.unit ?? "MINUTES",
                        config: step.config,
                    },
                };
            }

            case "SEND_DM":
            case "REPLY_COMMENT":
                return {
                    type: "CONTINUE",
                    output: {
                        dryRun: true,
                        stepType: step.type,
                        executed: true,
                        config: step.config,
                    },
                };

            default:
                return {
                    type: "FAILED",
                    errorMessage: `Unsupported automation step: ${step.type}`,
                };
        }
    }
}