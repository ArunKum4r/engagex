import {
    Controller,
    Delete,
    Get,
    Param,
    Post,
    Query,
    Req,
    Res,
    UnauthorizedException,
    UseGuards,
} from "@nestjs/common";
import type { response, Response } from "express";
import { AuthGuard } from "../../auth/auth.guard.js";
import type { AuthenticatedRequest } from "../../auth/auth.types.js";
import { InstagramService } from "./instagram.service.js";
import { WorkspaceRoleGuard } from "../../workspaces/workspace-role.guard.js";
import { RequireWorkspaceRole } from "../../workspaces/workspace-role.decorator.js";

@Controller()
export class InstagramController {
    constructor(
        private readonly instagramService: InstagramService,
    ) {}

    @Get(
        "workspaces/:workspaceId/integrations/instagram/connect",
    )
    @UseGuards(AuthGuard, WorkspaceRoleGuard)
    @RequireWorkspaceRole("OWNER", "ADMIN")
    async connect(
        @Param("workspaceId") workspaceId: string,
        @Req() request: AuthenticatedRequest,
        @Res() response: Response,
    ) {
        if (!request.user) {
            throw new UnauthorizedException(
                "Authentication required",
            );
        }

        const authorizationUrl =
            await this.instagramService.getAuthorizationUrl(
                workspaceId,
                request.user.id,
            );

        return response.redirect(authorizationUrl);
    }

    @Get("integrations/instagram/callback")
    async callback(
        @Query("code") code: string,
        @Query("state") state: string,
        @Res() response: Response
    ) {
        if (!code || !state) {
            throw new UnauthorizedException(
                "Invalid Instagram OAuth callback",
            );
        }

        await this.instagramService.handleCallback(
            code,
            state,
        );

        const frontendUrl = process.env.FRONTEND_URL ?? "http://localhost:5173";
        return response.redirect(`${frontendUrl}/integrations?instagram=connected`);
    }

    @Get("workspaces/:workspaceId/integrations/instagram/:platformAccountId/test")
    @UseGuards(AuthGuard, WorkspaceRoleGuard)
    @RequireWorkspaceRole("OWNER", "ADMIN")
    async testConnection(
        @Param("workspaceId") workspaceId: string,
        @Param("platformAccountId") platformAccountId: string,
    ) {
        return this.instagramService.testConnection(
            workspaceId,
            platformAccountId,
        );
    }

    @Post("workspaces/:workspaceId/integrations/instagram/:platformAccountId/webhook/subscribe")
    @UseGuards(AuthGuard, WorkspaceRoleGuard)
    @RequireWorkspaceRole("OWNER", "ADMIN")
    async subscribeToWebhooks(
        @Param("workspaceId") workspaceId: string,
        @Param("platformAccountId") platformAccountId: string,
    ) {
        return this.instagramService.subscribeToWebhooks(
            workspaceId,
            platformAccountId,
        );
    }

    @Get("workspaces/:workspaceId/integrations/instagram/:platformAccountId/webhook/subscriptions")
    @UseGuards(AuthGuard, WorkspaceRoleGuard)
    @RequireWorkspaceRole("OWNER", "ADMIN")
    async getWebhookSubscriptions(
        @Param("workspaceId") workspaceId: string,
        @Param("platformAccountId") platformAccountId: string,
    ) {
        return this.instagramService.getWebhookSubscriptions(
            workspaceId,
            platformAccountId,
        );
    }

    @Delete(":platformAccountId")
    @UseGuards(AuthGuard, WorkspaceRoleGuard)
    @RequireWorkspaceRole("OWNER", "ADMIN")
    async disconnectInstagram(
        @Param("workspaceId") workspaceId: string,
        @Param("platformAccountId") platformAccountId: string,
    ) {
        return this.instagramService.disconnectInstagramAccount(
            workspaceId,
            platformAccountId,
        );
    }
}