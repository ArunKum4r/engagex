import { Body, Controller, Delete, Get, Param,
    Patch, Post, Put, Req, UseGuards } from "@nestjs/common";
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { AuthGuard } from "../auth/auth.guard.js";
import type { AuthenticatedRequest } from "../auth/auth.types.js";
import { AutomationGraphResponseDto, AutomationResponseDto, CreateAutomationDto, SaveAutomationGraphDto, UpdateAutomationDto } from "./automation.dto.js";
import { AutomationService } from "./automation.service.js";
import { RequireWorkspaceRole } from "../workspaces/workspace-role.decorator.js";
import { WorkspaceRoleGuard } from "../workspaces/workspace-role.guard.js";

@ApiTags("Automations")
@UseGuards(AuthGuard)
@Controller("workspaces/:workspaceId/automations")
export class AutomationController {

    constructor(
        private readonly automationService: AutomationService,
    ) {}

    // ============================
    // Create Automation
    // ============================
    @Post()
    @UseGuards(AuthGuard, WorkspaceRoleGuard)
    @RequireWorkspaceRole("OWNER", "ADMIN")
    @ApiOperation({
        summary: "Create automation",
    })
    @ApiBody({
        type: CreateAutomationDto,
        examples: {
            default: {
                summary: "Example automation",
                value: {
                    name: "Instagram Price Inquiry",
                    description:
                        "Send pricing information when someone asks about price",
                    platformAccountId:
                        "72728de2-7d91-4e7a-a380-9715ddbcb80f",
                },
            },
        },
    })
    @ApiResponse({
        status: 201,
        description: "Automation created successfully",
        type: AutomationResponseDto,
    })
    async create(
        @Param("workspaceId") workspaceId: string,
        @Req() request: AuthenticatedRequest,
        @Body() dto: CreateAutomationDto,
    ) {
        return this.automationService.create(
            workspaceId,
            request.user.id,
            dto,
        );
    }

    // ============================
    // List Workspace Automations
    // ============================
    @Get()
    @ApiOperation({
        summary: "List workspace automations",
    })
    @ApiResponse({
        status: 200,
        description: "Automations retrieved successfully",
        type: AutomationResponseDto,
        isArray: true,
    })
    async findAll(
        @Param("workspaceId") workspaceId: string,
    ) {
        return this.automationService.findAll(
            workspaceId,
        );
    }

    // ============================
    // Get Automation
    // ============================
    @Get(":automationId")
    @ApiOperation({
        summary: "Get automation",
    })
    @ApiResponse({
        status: 200,
        description: "Automation retrieved successfully",
        type: AutomationResponseDto,
    })
    async findOne(
        @Param("workspaceId") workspaceId: string,
        @Param("automationId") automationId: string,
    ) {
        return this.automationService.findOne(
            workspaceId,
            automationId,
        );
    }

    // ============================
    // Get Automation with Graph
    // ============================
    @Get(":automationId/graph")
    @ApiOperation({
        summary: "Get automation with graph",
    })
    @ApiResponse({
        status: 200,
        description: "Automation graph retrieved successfully",
        type: AutomationGraphResponseDto,
    })
    async findGraph(
        @Param("workspaceId") workspaceId: string,
        @Param("automationId") automationId: string,
    ) {
        return this.automationService.findGraph(
            workspaceId,
            automationId,
        );
    }

    // ============================
    // Update Automation
    // ============================
    @Patch(":automationId")
    @UseGuards(AuthGuard, WorkspaceRoleGuard)
    @RequireWorkspaceRole("OWNER", "ADMIN")
    @ApiOperation({
        summary: "Update automation",
    })
    @ApiBody({
        type: UpdateAutomationDto,
        examples: {
            default: {
                summary: "Example update",
                value: {
                    name: "Updated Price Inquiry",
                    description:
                        "Updated automation description",
                },
            },
        },
    })
    @ApiResponse({
        status: 200,
        description: "Automation updated successfully",
        type: AutomationResponseDto,
    })
    async update(
        @Param("workspaceId") workspaceId: string,
        @Param("automationId") automationId: string,
        @Body() dto: UpdateAutomationDto,
    ) {
        return this.automationService.update(
            workspaceId,
            automationId,
            dto,
        );
    }

    // ============================
    // Delete Automation
    // ============================
    @Delete(":automationId")
    @UseGuards(AuthGuard, WorkspaceRoleGuard)
    @RequireWorkspaceRole("OWNER", "ADMIN")
    @ApiOperation({
        summary: "Delete automation",
    })
    @ApiResponse({
        status: 200,
        description: "Automation deleted successfully",
    })
    async remove(
        @Param("workspaceId") workspaceId: string,
        @Param("automationId") automationId: string,
    ) {
        return this.automationService.remove(
            workspaceId,
            automationId,
        );
    }

    // ============================
    // Activate Automation
    // ============================
    @Post(":automationId/activate")
    @UseGuards(AuthGuard, WorkspaceRoleGuard)
    @RequireWorkspaceRole("OWNER", "ADMIN")
    @ApiOperation({
        summary: "Activate automation",
    })
    @ApiResponse({
        status: 200,
        description: "Automation activated successfully",
        type: AutomationResponseDto,
    })
    async activate(
        @Param("workspaceId") workspaceId: string,
        @Param("automationId") automationId: string,
    ) {
        return this.automationService.activate(
            workspaceId,
            automationId,
        );
    }

    // ============================
    // Pause Automation
    // ============================
    @Post(":automationId/pause")
    @UseGuards(AuthGuard, WorkspaceRoleGuard)
    @RequireWorkspaceRole("OWNER", "ADMIN")
    @ApiOperation({
        summary: "Pause automation",
    })
    @ApiResponse({
        status: 200,
        description: "Automation paused successfully",
        type: AutomationResponseDto,
    })
    async pause(
        @Param("workspaceId") workspaceId: string,
        @Param("automationId") automationId: string,
    ) {
        return this.automationService.pause(
            workspaceId,
            automationId,
        );
    }

    @Put(":automationId/graph")
    @UseGuards(AuthGuard, WorkspaceRoleGuard)
    @RequireWorkspaceRole("OWNER", "ADMIN")
    @ApiOperation({
        summary: "Save automation graph",
    })
    @ApiBody({
        type: SaveAutomationGraphDto,
    })
    @ApiResponse({
        status: 200,
        description: "Automation graph saved successfully",
    })
    async saveGraph(
        @Param("workspaceId") workspaceId: string,
        @Param("automationId") automationId: string,
        @Body() dto: SaveAutomationGraphDto,
    ) {
        return this.automationService.saveGraph(
            workspaceId,
            automationId,
            dto,
        );
    }
}