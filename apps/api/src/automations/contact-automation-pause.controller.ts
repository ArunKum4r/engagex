import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Post,
    Query,
    Req,
    UseGuards,
} from "@nestjs/common";

import { AuthGuard } from "../auth/auth.guard.js";
import type { AuthenticatedRequest } from "../auth/auth.types.js";

import { ContactAutomationPauseDto } from "./automation.dto.js";
import { ContactAutomationPauseService } from "./contact-automation-pause.service.js";

@Controller(
    "workspaces/:workspaceId/contacts/:contactId/automation-pauses",
)
@UseGuards(AuthGuard)
export class ContactAutomationPauseController {
    constructor(
        private readonly pauseService: ContactAutomationPauseService,
    ) {}

    @Get()
    async list(
        @Param("workspaceId") workspaceId: string,
        @Param("contactId") contactId: string,
    ) {
        return this.pauseService.list(
            workspaceId,
            contactId,
        );
    }

    @Post()
    async pause(
        @Param("workspaceId") workspaceId: string,
        @Param("contactId") contactId: string,
        @Req() request: AuthenticatedRequest,
        @Body() body: ContactAutomationPauseDto,
    ) {
        return this.pauseService.pause(
            workspaceId,
            contactId,
            request.user.id,
            {
                automationId:
                    body.automationId,
                reason: body.reason,
                resumeAt: body.resumeAt
                    ? new Date(body.resumeAt)
                    : null,
            },
        );
    }

    @Delete()
    async resume(
        @Param("workspaceId") workspaceId: string,
        @Param("contactId") contactId: string,
        @Query("automationId")
        automationId?: string,
    ) {
        return this.pauseService.resume(
            workspaceId,
            contactId,
            automationId || null,
        );
    }
}