import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { AuthGuard } from "../auth/auth.guard.js";
import { RequireWorkspaceRole } from "../workspaces/workspace-role.decorator.js";
import { WorkspaceRoleGuard } from "../workspaces/workspace-role.guard.js";
import { CreatePlatformAccountDto, PlatformAccountResponseDto, UpdatePlatformAccountDto } from "./integration.dto.js";
import { IntegrationService } from "./integration.service.js";

@ApiTags("Integrations")
@UseGuards(AuthGuard)
@Controller("workspaces/:workspaceId/integrations")
export class IntegrationController {

    constructor(
        private readonly integrationService: IntegrationService,
    ) {}

    // ============================
    // Create Platform Account
    // ============================
    @Post()
    @UseGuards(AuthGuard, WorkspaceRoleGuard)
    @RequireWorkspaceRole("OWNER", "ADMIN")
    @ApiOperation({
        summary: "Connect platform account",
    })
    @ApiBody({
        type: CreatePlatformAccountDto,
        examples: {
            instagram: {
                summary: "Instagram account",
                value: {
                    platform: "INSTAGRAM",
                    externalAccountId:
                        "17841400000000000",
                    name: "EngageX Demo",
                    username: "engagex_demo",
                    metadata: {
                        accountType: "BUSINESS",
                    },
                },
            },
        },
    })
    @ApiResponse({
        status: 201,
        description:
            "Platform account connected successfully",
        type: PlatformAccountResponseDto,
    })
    async create(
        @Param("workspaceId") workspaceId: string,
        @Body() dto: CreatePlatformAccountDto,
    ) {
        return this.integrationService.create(
            workspaceId,
            dto,
        );
    }

    // ============================
    // List Connected Platform Accounts
    // ============================
    @Get()
    @ApiOperation({
        summary: "List connected platform accounts",
    })
    @ApiResponse({
        status: 200,
        description:
            "Platform accounts retrieved successfully",
        type: PlatformAccountResponseDto,
        isArray: true,
    })
    async findAll(
        @Param("workspaceId") workspaceId: string,
    ) {
        return this.integrationService.findAll(
            workspaceId,
        );
    }

    // ============================
    // Get Connected Platform Account
    // ============================
    @Get(":platformAccountId")
    @ApiOperation({
        summary: "Get connected platform account",
    })
    @ApiResponse({
        status: 200,
        description:
            "Platform account retrieved successfully",
        type: PlatformAccountResponseDto,
    })
    async findOne(
        @Param("workspaceId") workspaceId: string,
        @Param("platformAccountId")
        platformAccountId: string,
    ) {
        return this.integrationService.findOne(
            workspaceId,
            platformAccountId,
        );
    }

    // ============================
    // Update Connected Platform Account
    // ============================
    @Patch(":platformAccountId")
    @UseGuards(AuthGuard, WorkspaceRoleGuard)
    @RequireWorkspaceRole("OWNER", "ADMIN")
    @ApiOperation({
        summary: "Update connected platform account",
    })
    @ApiBody({
        type: UpdatePlatformAccountDto,
        examples: {
            default: {
                summary: "Update account",
                value: {
                    name: "My Instagram Account",
                    username: "my_instagram",
                },
            },
        },
    })
    @ApiResponse({
        status: 200,
        description:
            "Platform account updated successfully",
        type: PlatformAccountResponseDto,
    })
    async update(
        @Param("workspaceId") workspaceId: string,
        @Param("platformAccountId")
        platformAccountId: string,
        @Body() dto: UpdatePlatformAccountDto,
    ) {
        return this.integrationService.update(
            workspaceId,
            platformAccountId,
            dto,
        );
    }

    // ============================
    // Disconnect Platform Account
    // ============================
    @Delete(":platformAccountId")
    @UseGuards(AuthGuard, WorkspaceRoleGuard)
    @RequireWorkspaceRole("OWNER", "ADMIN")
    @ApiOperation({
        summary: "Disconnect platform account",
    })
    @ApiResponse({
        status: 200,
        description:
            "Platform account disconnected successfully",
    })
    async remove(
        @Param("workspaceId") workspaceId: string,
        @Param("platformAccountId")
        platformAccountId: string,
    ) {
        return this.integrationService.remove(
            workspaceId,
            platformAccountId,
        );
    }
}