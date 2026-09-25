import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    Req,
    UseGuards,
} from "@nestjs/common";

import { AuthGuard } from "../auth/auth.guard.js";
import type { AuthenticatedRequest } from "../auth/auth.types.js";
import { ConversationReminderService } from "./conversation-reminders.service.js";

@Controller(
    "workspaces/:workspaceId/conversations/:conversationId/reminders",
)
@UseGuards(AuthGuard)
export class ConversationReminderController {
    constructor(
        private readonly reminderService: ConversationReminderService,
    ) {}

    @Post()
    async create(
        @Param("workspaceId")
        workspaceId: string,
        @Param("conversationId")
        conversationId: string,
        @Req()
        request: AuthenticatedRequest,
        @Body()
        body: {
            title: string;
            description?: string;
            remindAt: string;
        },
    ) {
        return this.reminderService.create(
            workspaceId,
            conversationId,
            request.user.id,
            body,
        );
    }

    @Get()
    async findAll(
        @Param("workspaceId")
        workspaceId: string,
        @Param("conversationId")
        conversationId: string,
    ) {
        return this.reminderService.findAll(
            workspaceId,
            conversationId,
        );
    }

    @Patch(":reminderId/complete")
    async complete(
        @Param("workspaceId")
        workspaceId: string,
        @Param("reminderId")
        reminderId: string,
    ) {
        return this.reminderService.complete(
            workspaceId,
            reminderId,
        );
    }

    @Patch(":reminderId/cancel")
    async cancel(
        @Param("workspaceId")
        workspaceId: string,
        @Param("reminderId")
        reminderId: string,
    ) {
        return this.reminderService.cancel(
            workspaceId,
            reminderId,
        );
    }

    @Delete(":reminderId")
    async delete(
        @Param("workspaceId")
        workspaceId: string,
        @Param("reminderId")
        reminderId: string,
    ) {
        return this.reminderService.delete(
            workspaceId,
            reminderId,
        );
    }
}