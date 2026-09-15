import {
  Body,
  Controller,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import { AdminAuthGuard } from "../auth/admin-auth.guard.js";
import type { AdminAuthenticatedRequest } from "../auth/admin-auth.types.js";
import { AdminPermissionGuard } from "../rbac/admin-permission.guard.js";
import { RequirePermission } from "../rbac/admin-rbac.decorator.js";
import { AdminInvitationsService } from "./admin-invitations.service.js";
import {
  AcceptAdminInvitationDto,
  CreateAdminInvitationDto,
} from "./admin-users.dto.js";

@Controller("admin/users/invitations")
export class AdminInvitationsController {
  constructor(
    private readonly adminInvitationsService: AdminInvitationsService,
  ) {}

  @Post()
  @UseGuards(AdminAuthGuard, AdminPermissionGuard)
  @RequirePermission("users.update")
  createInvitation(
    @Body() dto: CreateAdminInvitationDto,
    @Req() request: AdminAuthenticatedRequest,
  ) {
    return this.adminInvitationsService.createInvitation({
      email: dto.email,
      name: dto.name,
      roleSlug: dto.roleSlug,
      invitedByAdminId: request.adminUser.id,
    });
  }

  @Post("accept")
  acceptInvitation(
    @Body() dto: AcceptAdminInvitationDto,
  ) {
    return this.adminInvitationsService.acceptInvitation(dto);
  }
}