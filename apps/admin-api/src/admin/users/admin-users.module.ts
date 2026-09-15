import { Module } from "@nestjs/common";
import { AdminAuthModule } from "../auth/admin-auth.module.js";
import { AdminRbacModule } from "../rbac/admin-rbac.module.js";
import { AdminInvitationsController } from "./admin-invitations.controller.js";
import { AdminInvitationsService } from "./admin-invitations.service.js";
import { AdminUsersController } from "./admin-users.controller.js";
import { AdminUsersService } from "./admin-users.service.js";

@Module({
  imports: [
    AdminAuthModule,
    AdminRbacModule,
  ],
  controllers: [
    AdminUsersController,
    AdminInvitationsController,
  ],
  providers: [
    AdminUsersService,
    AdminInvitationsService,
  ],
})
export class AdminUsersModule {}