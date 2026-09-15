import {
    CanActivate,
    ExecutionContext,
    ForbiddenException,
    Injectable,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";

import {
    ADMIN_PERMISSION_KEY,
} from "./admin-rbac.decorator.js";

import { AdminRbacService } from "./admin-rbac.service.js";

import type {
    AdminAuthenticatedRequest,
} from "../auth/admin-auth.types.js";

@Injectable()
export class AdminPermissionGuard implements CanActivate {
    constructor(
        private readonly reflector: Reflector,
        private readonly rbacService: AdminRbacService,
    ) {}

    async canActivate(
        context: ExecutionContext,
    ): Promise<boolean> {
        const permission =
            this.reflector.getAllAndOverride<string>(
                ADMIN_PERMISSION_KEY,
                [
                    context.getHandler(),
                    context.getClass(),
                ],
            );

        if (!permission) {
            return true;
        }

        const request =
            context
                .switchToHttp()
                .getRequest<AdminAuthenticatedRequest>();

        if (!request.adminUser) {
            throw new ForbiddenException(
                "Admin authentication required",
            );
        }

        const allowed =
            await this.rbacService.hasPermission(
                request.adminUser.id,
                permission,
            );

        if (!allowed) {
            throw new ForbiddenException(
                "Insufficient permissions",
            );
        }

        return true;
    }
}