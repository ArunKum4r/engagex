import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Req,
  UseGuards,
} from "@nestjs/common";
import type { Response } from "express";
import { AdminAuthGuard } from "../auth/admin-auth.guard.js";
import { AdminPermissionGuard } from "../rbac/admin-permission.guard.js";
import { RequirePermission } from "../rbac/admin-rbac.decorator.js";
import { AdminUsersService } from "./admin-users.service.js";
import {
  AcceptAdminInvitationDto,
  CreateAdminInvitationDto,
  ReplaceAdminUserRolesDto,
  UpdateAdminUserDto,
  UpdateAdminUserStatusDto,
} from "./admin-users.dto.js";
import { AdminInvitationsService } from "./admin-invitations.service.js";
import type { AdminAuthenticatedRequest } from "../auth/admin-auth.types.js";

@Controller("admin/users")
@UseGuards(AdminAuthGuard, AdminPermissionGuard)
export class AdminUsersController {
  constructor(
    private readonly adminUsersService: AdminUsersService,
    private readonly adminInvitationsService: AdminInvitationsService
  ) {}

  @Get()
  @RequirePermission("users.read")
  findAll() {
    return this.adminUsersService.findAll();
  }

  @Get(":id")
  @RequirePermission("users.read")
  findOne(@Param("id") id: string) {
    return this.adminUsersService.findOne(id);
  }

  @Patch(":id")
  @RequirePermission("users.update")
  update(
    @Param("id") id: string,
    @Body() dto: UpdateAdminUserDto,
  ) {
    return this.adminUsersService.update(id, dto);
  }

  @Patch(":id/status")
  @RequirePermission("users.suspend")
  updateStatus(
    @Param("id") id: string,
    @Body() dto: UpdateAdminUserStatusDto,
    @Req() request: AdminAuthenticatedRequest
  ) {
    return this.adminUsersService.updateStatus(
      id,
      dto.isActive,
      request.adminUser.id
    );
  }

  @Get(":id/roles")
  @RequirePermission("users.read")
  getRoles(@Param("id") id: string) {
    return this.adminUsersService.getRoles(id);
  }

  @Put(":id/roles")
  @RequirePermission("users.update")
  replaceRoles(
    @Param("id") id: string,
    @Body() dto: ReplaceAdminUserRolesDto,
  ) {
    return this.adminUsersService.replaceRoles(
      id,
      dto.roleIds,
    );
  }

  @Post("invitations")
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

  @Post("invitations/accept")
  acceptInvitation(
    @Body() dto: AcceptAdminInvitationDto,
  ) {
    return this.adminInvitationsService.acceptInvitation(dto);
  }
}