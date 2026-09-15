import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";

import {
  findAdminSessionWithUserByTokenHash,
  updateAdminSessionLastSeen,
} from "@engagex/db";

import { hashSessionToken } from "./admin-auth.utils.js";
import type { AdminAuthenticatedRequest } from "./admin-auth.types.js";

@Injectable()
export class AdminAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request =
      context.switchToHttp().getRequest<AdminAuthenticatedRequest>();

    const token = request.cookies?.admin_session;

    if (!token) {
      throw new UnauthorizedException("Admin authentication required");
    }

    const tokenHash = hashSessionToken(token);

    const result =
      await findAdminSessionWithUserByTokenHash(tokenHash);

    if (!result) {
      throw new UnauthorizedException("Invalid admin session");
    }

    const { session, adminUser } = result;

    if (session.revokedAt) {
      throw new UnauthorizedException(
        "Admin session has been revoked",
      );
    }

    if (session.expiresAt <= new Date()) {
      throw new UnauthorizedException(
        "Admin session has expired",
      );
    }

    if (!adminUser.isActive || adminUser.status !== "ACTIVE") {
      throw new UnauthorizedException(
        "Admin account is not active",
      );
    }

    request.adminSessionId = session.id;
    request.adminUser = adminUser;

    await updateAdminSessionLastSeen(session.id);

    return true;
  }
}