import { Module } from "@nestjs/common";

import { AdminRbacService } from "./admin-rbac.service.js";
import { AdminPermissionGuard } from "./admin-permission.guard.js";

@Module({
    providers: [
        AdminRbacService,
        AdminPermissionGuard,
    ],
    exports: [
        AdminRbacService,
        AdminPermissionGuard,
    ],
})
export class AdminRbacModule {}