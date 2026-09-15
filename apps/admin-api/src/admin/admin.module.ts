import { Module } from "@nestjs/common";
import { AdminAuthModule } from "./auth/admin-auth.module.js";
import { AdminRbacModule } from "./rbac/admin-rbac.module.js";
import { AdminUsersModule } from "./users/admin-users.module.js";
import { PlatformUsersModule } from "./platform-users/platform-users.module.js";

@Module({
  imports: [AdminAuthModule, AdminRbacModule, AdminUsersModule, PlatformUsersModule],
})
export class AdminModule {}