import { Module } from "@nestjs/common";

import { AdminAuthController } from "./admin-auth.controller.js";
import { AdminAuthService } from "./admin-auth.service.js";
import { AdminAuthGuard } from "./admin-auth.guard.js";
import { AdminRbacModule } from "../rbac/admin-rbac.module.js";

@Module({
  imports: [AdminRbacModule],
  controllers: [AdminAuthController],
  providers: [AdminAuthService, AdminAuthGuard],
  exports: [AdminAuthService, AdminAuthGuard],
})
export class AdminAuthModule {}