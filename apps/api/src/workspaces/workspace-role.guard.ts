import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { findWorkspaceMember } from "@engagex/db";
import { Reflector } from "@nestjs/core";
import type { AuthenticatedRequest } from "../auth/auth.types.js";
import { WORKSPACE_ROLES_KEY } from "./workspace-role.decorator.js";

@Injectable()
export class WorkspaceRoleGuard implements CanActivate {

    constructor(
        private readonly reflector: Reflector,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const requiredRoles =
            this.reflector.getAllAndOverride<string[]>(
                WORKSPACE_ROLES_KEY,
                [
                    context.getHandler(),
                    context.getClass(),
                ],
            );

        /*
         * If the endpoint doesn't specify a role,
         * authentication alone is enough.
         */
        if (!requiredRoles?.length) {
            return true;
        }

        const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
        const workspaceId = request.params.workspaceId;
        if (!workspaceId) {
            throw new ForbiddenException("Workspace ID is required");
        }

        const membership = await findWorkspaceMember(workspaceId, request.user.id);
        if (!membership) {
            throw new ForbiddenException("You are not a member of this workspace");
        }
        if (!requiredRoles.includes(membership.role)) {
            throw new ForbiddenException("You do not have permission to perform this action");
        }

        return true;
    }
}