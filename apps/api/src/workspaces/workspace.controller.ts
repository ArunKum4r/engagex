import { Body, Controller, Delete, Get,
    Param, Patch, Post, Req, UseGuards } from "@nestjs/common";
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { AuthGuard } from "../auth/auth.guard.js";
import type { AuthenticatedRequest } from "../auth/auth.types.js";
import { AcceptWorkspaceInvitationDto, AddWorkspaceMemberDto, CreateWorkspaceDto, CreateWorkspaceInvitationDto, UpdateWorkspaceDto, UpdateWorkspaceMemberRoleDto } from "./workspace.dto.js";
import { WorkspaceService } from "./workspace.service.js";
import { RequireWorkspaceRole } from "./workspace-role.decorator.js";
import { WorkspaceRoleGuard } from "./workspace-role.guard.js";

@ApiTags("Workspaces")
@UseGuards(AuthGuard)
@Controller("workspaces")
export class WorkspaceController {

    constructor(
        private readonly workspaceService: WorkspaceService,
    ) {}

    // ============================
    // Create Workspace
    // ============================
    @Post()
    @UseGuards(AuthGuard)
    @ApiOperation({
        summary: "Create workspace",
    })
    @ApiBody({
        type: CreateWorkspaceDto,
        examples: {
            default: {
                summary: "Example workspace",
                value: {
                    name: "Acme Corporation",
                    slug: "acme-corporation",
                },
            },
        },
    })
    @ApiResponse({
        status: 201,
        description: "Workspace created successfully",
    })
    async create(@Req() request: AuthenticatedRequest, @Body() dto: CreateWorkspaceDto) {
        return this.workspaceService.create(request.user.id, dto);
    }

    // ============================
    // List User's Workspaces
    // ============================
    @Get()
    @UseGuards(AuthGuard)
    @ApiOperation({
        summary: "List user's workspaces",
    })
    @ApiResponse({
        status: 200,
        description: "Workspaces retrieved successfully",
    })
    async findAll(@Req() request: AuthenticatedRequest) {
        return this.workspaceService.findAll(request.user.id);
    }

    @Get(":workspaceId")
    @UseGuards(AuthGuard)
    @ApiOperation({
        summary: "Get workspace",
    })
    async findOne(@Param("workspaceId") workspaceId: string, @Req() request: AuthenticatedRequest) {
        return this.workspaceService.findOne(workspaceId, request.user.id);
    }

    // ============================
    // Update Workspace
    // ============================
    @Patch(":workspaceId")
    @UseGuards(AuthGuard, WorkspaceRoleGuard)
    @RequireWorkspaceRole("OWNER", "ADMIN")
    @ApiOperation({
        summary: "Update workspace",
    })
    @ApiBody({
        type: UpdateWorkspaceDto,
        examples: {
            default: {
                summary: "Example update",
                value: {
                    name: "Acme Inc",
                },
            },
        },
    })
    async update(@Param("workspaceId") workspaceId: string, @Body() dto: UpdateWorkspaceDto) {
        return this.workspaceService.update(workspaceId, dto);
    }

    // ============================
    // Delete Workspace
    // ============================
    @Delete(":workspaceId")
    @UseGuards(AuthGuard, WorkspaceRoleGuard)
    @RequireWorkspaceRole("OWNER", "ADMIN")
    @ApiOperation({
        summary: "Delete workspace",
    })
    async remove(@Param("workspaceId") workspaceId: string) {
        return this.workspaceService.remove(workspaceId);
    }

    // ============================
    // List Workspace Members
    // ============================
    @Get(":workspaceId/members")
    @ApiOperation({
        summary: "List workspace members",
    })
    @ApiResponse({
        status: 200,
        description: "Workspace members retrieved successfully",
    })
    async findMembers(@Param("workspaceId") workspaceId: string) {
        return this.workspaceService.findMembers(workspaceId);
    }

    // ============================
    // Add Workspace Member
    // ============================
    @Post(":workspaceId/members")
    @UseGuards(AuthGuard, WorkspaceRoleGuard)
    @RequireWorkspaceRole("OWNER", "ADMIN")
    @ApiOperation({
        summary: "Add workspace member",
    })
    @ApiBody({
        type: AddWorkspaceMemberDto,
        examples: {
            default: {
                summary: "Example member",
                value: {
                    userId: "72728de2-7d91-4e7a-a380-9715ddbcb80f",
                    role: "MEMBER",
                },
            },
        },
    })
    async addMember(@Param("workspaceId") workspaceId: string, @Body() dto: AddWorkspaceMemberDto) {
        return this.workspaceService.addMember(workspaceId, dto);
    }

    // ============================
    // Update Workspace Member Role
    // ============================
    @Patch(":workspaceId/members/:userId")
    @UseGuards(AuthGuard, WorkspaceRoleGuard)
    @RequireWorkspaceRole("OWNER", "ADMIN")
    @ApiOperation({
        summary: "Update workspace member role",
    })
    @ApiBody({
        type: UpdateWorkspaceMemberRoleDto,
        examples: {
            default: {
                summary: "Example role update",
                value: {
                    role: "ADMIN",
                },
            },
        },
    })
    async updateMemberRole(@Param("workspaceId") workspaceId: string, @Param("userId") userId: string, @Body() dto: UpdateWorkspaceMemberRoleDto) {
        return this.workspaceService.updateMemberRole(workspaceId, userId, dto);
    }

    // ============================
    // Remove Workspace Member
    // ============================
    @Delete(":workspaceId/members/:userId")
    @UseGuards(AuthGuard, WorkspaceRoleGuard)
    @RequireWorkspaceRole("OWNER", "ADMIN")
    @ApiOperation({
        summary: "Remove workspace member",
    })
    async removeMember(@Param("workspaceId") workspaceId: string, @Param("userId") userId: string) {
        return this.workspaceService.removeMember(workspaceId, userId);
    }

    // ============================
    // Create Workspace Invitation
    // ============================
    @Post(":workspaceId/invitations")
    @UseGuards(AuthGuard, WorkspaceRoleGuard)
    @RequireWorkspaceRole("OWNER", "ADMIN")
    @ApiOperation({
        summary: "Invite a user to workspace",
    })
    @ApiBody({
        type: CreateWorkspaceInvitationDto,
        examples: {
            default: {
                summary: "Example invitation",
                value: {
                    email: "member@example.com",
                    role: "MEMBER",
                },
            },
        },
    })
    @ApiResponse({
        status: 201,
        description: "Workspace invitation created successfully",
    })
    async createInvitation(
        @Param("workspaceId") workspaceId: string,
        @Body() dto: CreateWorkspaceInvitationDto,
    ) {
        return this.workspaceService.createInvitation(
            workspaceId,
            dto,
        );
    }

    // ============================
    // Accept Workspace Invitation
    // ============================
    @Post("invitations/accept")
    @UseGuards(AuthGuard)
    @ApiOperation({
        summary: "Accept workspace invitation",
    })
    @ApiBody({
        type: AcceptWorkspaceInvitationDto,
        examples: {
            default: {
                summary: "Example invitation token",
                value: {
                    token: "7b7e8e5b2f...",
                },
            },
        },
    })
    @ApiResponse({
        status: 200,
        description: "Workspace invitation accepted successfully",
    })
    async acceptInvitation(
        @Req() request: AuthenticatedRequest,
        @Body() dto: AcceptWorkspaceInvitationDto,
    ) {
        return this.workspaceService.acceptInvitation(
            request.user.id,
            request.user.email,
            dto,
        );
    }
}