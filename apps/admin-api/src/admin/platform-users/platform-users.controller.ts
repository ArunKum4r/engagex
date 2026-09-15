import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  UseGuards,
} from "@nestjs/common";
import { AdminAuthGuard } from "../auth/admin-auth.guard.js";
import { AdminPermissionGuard } from "../rbac/admin-permission.guard.js";
import { RequirePermission } from "../rbac/admin-rbac.decorator.js";
import { PlatformUsersService } from "./platform-users.service.js";
import { UpdatePlatformUserStatusDto } from "./platform-users.dto.js";

@Controller("admin/platform-users")
@UseGuards(AdminAuthGuard, AdminPermissionGuard)
export class PlatformUsersController {
  constructor(
    private readonly platformUsersService: PlatformUsersService,
  ) {}

  @Get()
  @RequirePermission("users.read")
  findAll() {
    return this.platformUsersService.findAll();
  }

  @Get(":id")
  @RequirePermission("users.read")
  findOne(@Param("id") id: string) {
    return this.platformUsersService.findOne(id);
  }

  @Get(":id/workspaces")
  @RequirePermission("workspaces.read")
  findWorkspaces(@Param("id") id: string) {
    return this.platformUsersService.findWorkspaces(id);
  }

  @Patch(":id/status")
  @RequirePermission("users.suspend")
  updateStatus(
    @Param("id") id: string,
    @Body() dto: UpdatePlatformUserStatusDto,
  ) {
    return this.platformUsersService.updateStatus(
      id,
      dto.status,
    );
  }

  @Get(":id/subscription")
  @RequirePermission("subscriptions.read")
  findSubscription(@Param("id") id: string) {
    return this.platformUsersService.findSubscription(id);
  }

  @Get(":id/subscription-details")
  @RequirePermission("subscriptions.read")
  findSubscriptionDetails(
    @Param("id") id: string,
  ) {
    return this.platformUsersService.findSubscriptionDetails(id);
  }
}