import { ConflictException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { activateAutomation, createAutomation, deleteAutomation, findAutomationById,
    findAutomationWithGraph, findWorkspaceAutomations, pauseAutomation, updateAutomation, ENTITLEMENTS,
    saveAutomationGraph } from "@engagex/db";
import { CreateAutomationDto, SaveAutomationGraphDto, UpdateAutomationDto } from "./automation.dto.js";
import { SubscriptionsService } from "../subscriptions/subscriptions.service.js";

@Injectable()
export class AutomationService {

    constructor(
        private readonly subscriptionsService: SubscriptionsService
    ) {}

    async create(workspaceId: string, userId: string, dto: CreateAutomationDto) {
        const subscription = await this.subscriptionsService.getWorkspaceSubscription(workspaceId);
        if (!subscription) {
            throw new ForbiddenException("active subscription required")
        }

        const limitCheck = await this.subscriptionsService.checkLimit({
            subscriptionId: subscription.subscription.id,
            key: ENTITLEMENTS.AUTOMATIONS_MAX,
            userId: subscription.subscription.userId,
            workspaceId
        })

        if (!limitCheck.allowed) {
            throw new ForbiddenException("automation limit reached");
        }

        return createAutomation({
            workspaceId,
            createdByUserId: userId,
            name: dto.name,
            description: dto.description,
            platformAccountId: dto.platformAccountId,
        });
    }

    async findAll(workspaceId: string) {
        return findWorkspaceAutomations(workspaceId);
    }

    async findOne(workspaceId: string, automationId: string) {
        const automation = await findAutomationById(automationId);
        if (!automation) {
            throw new NotFoundException("Automation not found");
        }

        if (automation.workspaceId !== workspaceId) {
            throw new NotFoundException("Automation not found");
        }

        return automation;
    }

    async findGraph(workspaceId: string, automationId: string) {
        const automation = await findAutomationWithGraph(automationId);
        if (!automation) {
            throw new NotFoundException("Automation not found");
        }

        if (automation.automation.workspaceId !== workspaceId) {
            throw new NotFoundException("Automation not found");
        }

        return automation;
    }

    async update(workspaceId: string, automationId: string, dto: UpdateAutomationDto) {
        await this.findOne(workspaceId, automationId);
        const automation = await updateAutomation(automationId, {
            name: dto.name,
            description: dto.description,
            platformAccountId: dto.platformAccountId,
        });

        if (!automation) {
            throw new NotFoundException("Automation not found");
        }

        return automation;
    }

    async remove(workspaceId: string, automationId: string) {
        const automation = await this.findOne(workspaceId, automationId);
        const deleted = await deleteAutomation(automation.id);
        if (!deleted) {
            throw new NotFoundException("Automation not found");
        }

        return {
            message: "Automation deleted successfully",
            automation: deleted,
        };
    }

    async activate(workspaceId: string, automationId: string) {
        const automation = await this.findOne(workspaceId, automationId);

        if (automation.status === "ACTIVE") {
            throw new ConflictException("Automation is already active");
        }

        const result = await activateAutomation(automationId);

        if (!result.success) {
            throw new ConflictException({
                message: "Automation cannot be activated",
                errors: result.errors,
            });
        }

        if (!result.automation) {
            throw new NotFoundException("Automation not found");
        }

        return result.automation;
    }

    async pause(workspaceId: string, automationId: string) {
        const automation = await this.findOne(workspaceId, automationId);

        if (automation.status === "PAUSED") {
            throw new ConflictException("Automation is already paused");
        }

        const updated = await pauseAutomation(automationId);
        if (!updated) {
            throw new NotFoundException("Automation not found");
        }

        return updated;
    }

    async saveGraph(
        workspaceId: string,
        automationId: string,
        dto: SaveAutomationGraphDto,
    ) {
        const automation =
            await this.findOne(
                workspaceId,
                automationId,
            );

        if (automation.status !== "DRAFT") {
            throw new ConflictException(
                "Only draft automations can be edited",
            );
        }

        const saved =
            await saveAutomationGraph(
                automation.id,
                {
                    trigger: dto.trigger
                        ? {
                            type: dto.trigger.type,
                            config: dto.trigger.config,
                            entryStepId: dto.trigger.entryStepId ?? null,
                        }
                        : null,

                    steps: dto.steps.map(
                        (step) => ({
                            id: step.id,
                            type: step.type,
                            position:
                                step.position ?? 0,
                            config:
                                step.config ?? {},
                            canvasPosition: step.canvasPosition ?? { x: 0, y: 0 }
                        }),
                    ),

                    edges: dto.edges.map(
                        (edge) => ({
                            fromStepId:
                                edge.fromStepId,
                            toStepId:
                                edge.toStepId,
                            branch:
                                edge.branch ?? null,
                        }),
                    ),
                },
            );

        if (!saved) {
            throw new NotFoundException("Automation not found");
        }

        return this.findGraph(
            workspaceId,
            automationId,
        );
    }
}