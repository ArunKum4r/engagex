import { Injectable, UnauthorizedException } from "@nestjs/common";
import {
    createAdminSession,
    findAdminUserByEmail,
    updateAdminUserLastLogin,
} from "@engagex/db";
import {
    generateSessionToken,
    hashSessionToken,
    verifyPassword,
} from "./admin-auth.utils.js";

@Injectable()
export class AdminAuthService {
    async login(
        email: string,
        password: string,
        ipAddress?: string,
        userAgent?: string,
    ) {
        const adminUser = await findAdminUserByEmail(email);

        if (!adminUser) {
            throw new UnauthorizedException("Invalid credentials");
        }

        if (
            !adminUser.isActive ||
            adminUser.status !== "ACTIVE"
        ) {
            throw new UnauthorizedException(
                "Admin account is not active",
            );
        }

        const passwordValid = await verifyPassword(
            adminUser.passwordHash,
            password,
        );

        if (!passwordValid) {
            throw new UnauthorizedException("Invalid credentials");
        }

        const sessionToken = generateSessionToken();
        const tokenHash = hashSessionToken(sessionToken);

        const expiresAt = new Date(
            Date.now() + 8 * 60 * 60 * 1000,
        );

        const session = await createAdminSession({
            adminUserId: adminUser.id,
            tokenHash,
            expiresAt,
            ipAddress,
            userAgent,
        });

        if (!session) {
            throw new UnauthorizedException(
                "Unable to create admin session",
            );
        }

        await updateAdminUserLastLogin(adminUser.id);

        return {
            sessionToken,
            expiresAt,
            adminUser: {
                id: adminUser.id,
                email: adminUser.email,
                name: adminUser.name,
            },
        };
    }
}