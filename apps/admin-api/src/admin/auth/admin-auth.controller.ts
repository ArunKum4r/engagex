import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from "@nestjs/common";
import type { Request, Response } from "express";

import { AdminAuthService } from "./admin-auth.service.js";
import { AdminAuthGuard } from "./admin-auth.guard.js";
import type { AdminAuthenticatedRequest } from "./admin-auth.types.js";
import { revokeAdminSession } from "@engagex/db";
import { ApiBody, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { AdminPermissionGuard } from "../rbac/admin-permission.guard.js";
import { RequirePermission } from "../rbac/admin-rbac.decorator.js";

@Controller("admin/auth")
export class AdminAuthController {
  constructor(
    private readonly adminAuthService: AdminAuthService,
  ) {}

  @Post("login")
  @ApiOperation({
    summary: "login admin"
  })
  @ApiBody({
    type: Object,
    examples: {
        default: {
            summary: "Example login",
            value: {
                email: "[EMAIL_ADDRESS]",
                password: "qwert@123",
            },
        },
    },
  })
  @ApiResponse({
    status: 200,
    description: "Admin logged in successfully",
  })
  async login(
    @Body() body: { email: string; password: string },
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.adminAuthService.login(
      body.email,
      body.password,
      request.ip,
      request.headers["user-agent"],
    );

    response.cookie("admin_session", result.sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      // sameSite: "lax",
      sameSite: "none",
      expires: result.expiresAt,
      path: "/",
    });

    return {
      expiresAt: result.expiresAt,
      adminUser: result.adminUser,
    };
  }

  @Get("me")
  @UseGuards(AdminAuthGuard)
  me(@Req() request: AdminAuthenticatedRequest) {
    return {
      adminUser: {
        id: request.adminUser.id,
        email: request.adminUser.email,
        name: request.adminUser.name,
      },
    };
  }

  @Post("logout")
    @UseGuards(AdminAuthGuard)
    async logout(
    @Req() request: AdminAuthenticatedRequest,
    @Res({ passthrough: true }) response: Response,
    ) {
    await revokeAdminSession(request.adminSessionId);

    response.clearCookie("admin_session", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
    });

    return {
        success: true,
    };
    }
}