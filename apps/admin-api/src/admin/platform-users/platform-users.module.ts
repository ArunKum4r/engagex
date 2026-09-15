import { Module } from "@nestjs/common";
import { AdminAuthModule } from "../auth/admin-auth.module.js";
import { AdminRbacModule } from "../rbac/admin-rbac.module.js";
import { PlatformUsersController } from "./platform-users.controller.js";
import { PlatformUsersService } from "./platform-users.service.js";

@Module({
  imports: [
    AdminAuthModule,
    AdminRbacModule,
  ],
  controllers: [
    PlatformUsersController,
  ],
  providers: [
    PlatformUsersService,
  ],
})
export class PlatformUsersModule {}