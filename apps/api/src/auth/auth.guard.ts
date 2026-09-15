import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from "@nestjs/common";

import { hashSessionToken } from "./auth.utils.js";
import type { AuthenticatedRequest } from "./auth.types.js";
import {
  findSessionWithUserByTokenHash,
  updateSessionLastSeen,
} from "@engagex/db";

@Injectable()
export class AuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request =
      context.switchToHttp().getRequest<AuthenticatedRequest>();

    const token = request.cookies?.session;

    if (!token) {
      throw new UnauthorizedException("Authentication required");
    }

    const tokenHash = hashSessionToken(token);

    const result = await findSessionWithUserByTokenHash(tokenHash);

    if (!result) {
      throw new UnauthorizedException("Invalid session");
    }

    const { session, user } = result;

    if (session.revokedAt) {
      throw new UnauthorizedException("Session has been revoked");
    }

    const now = new Date();

    if (session.expiresAt <= now) {
      throw new UnauthorizedException("Session has expired");
    }

    if (
      session.impersonatedByAdminId &&
      (!session.impersonationExpiresAt ||
        session.impersonationExpiresAt <= now)
    ) {
      throw new UnauthorizedException(
        "Impersonation session has expired",
      );
    }

    if (user.status !== "ACTIVE") {
      throw new UnauthorizedException("User is not active");
    }

    request.sessionId = session.id;
    request.user = user;

    request.impersonation =
      session.impersonatedByAdminId &&
      session.impersonationExpiresAt
        ? {
            adminUserId: session.impersonatedByAdminId,
            expiresAt: session.impersonationExpiresAt,
          }
        : null;

    await updateSessionLastSeen(session.id);

    return true;
  }
}