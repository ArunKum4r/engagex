import { BadRequestException, ConflictException, Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { createUser, findUserByEmail, createEmailVerification, findActiveEmailVerification,
    incrementEmailVerificationAttempts, verifyUserEmail, markEmailVerificationUsed, 
    createSession, revokeSession, deleteEmailVerificationsByUserId, deletePasswordResetsByUserId,
    createPasswordReset, findPasswordResetByTokenHash, updateUserPassword, markPasswordResetUsed,
    revokeAllUserSessions } from "@engagex/db";
import * as argon2 from "argon2";
import { RegisterDto, VerifyEmailDto, UserLoginDto, ResendVerificationDto, ForgotPasswordDto, ResetPasswordDto } from "./auth.dto.js";
import { EMAIL_PROVIDER } from "../providers/email/email.module.js";
import type { EmailProvider } from "../providers/email/email.types.js";
import { generateSessionToken, hashPassword, hashSessionToken, verifyPassword,
    generatePasswordResetToken, hashPasswordResetToken } from "./auth.utils.js";
import { SubscriptionsService } from "../subscriptions/subscriptions.service.js";

@Injectable()
export class AuthService {

    constructor(
        @Inject(EMAIL_PROVIDER)
        private readonly emailProvider: EmailProvider,
        private readonly subscriptionsService: SubscriptionsService
    ) {}

    async register(dto: RegisterDto) {

        const email = dto.email.trim().toLowerCase();

        const existingUser = await findUserByEmail(email);

        if (existingUser) {
            throw new ConflictException("Email is already registered");
        }

        const passwordHash = await hashPassword(dto.password);

        const user = await createUser({
            email,
            name: dto.name.trim(),
            passwordHash,
        });

        await this.subscriptionsService.provisionFreeSubscription(user.id);

        const code = Math.floor(100000 + Math.random() * 900000).toString();

        const codeHash = await argon2.hash(code);

        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

        await createEmailVerification({
            userId: user.id,
            codeHash,
            expiresAt,
        });

        await this.emailProvider.sendVerificationCode(user.email, code);

        return {
            message: "Registration successful. Please verify your email.",
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
            },
        };

    }

    async verifyEmail(dto: VerifyEmailDto) {
        const email = dto.email.trim().toLowerCase();

        const user = await findUserByEmail(email);
        if (!user) {
            throw new BadRequestException("User not found");
        }

        if (user.emailVerifiedAt) {
            throw new BadRequestException("Email already verified")
        }

        const verification = await findActiveEmailVerification(user.id);
        if (!verification) {
            throw new BadRequestException("Verification code is invalid or expired");
        }

        if (verification.attempts > 5) {
            throw new BadRequestException("Too many attempts")
        }

        const isValid = await argon2.verify(verification.codeHash, dto.otp);
        if (!isValid) {
            await incrementEmailVerificationAttempts(user.id);
            throw new BadRequestException("Invalid verification code");
        }

        await verifyUserEmail(user.id);

        await markEmailVerificationUsed(verification.id);

        return { message: "Email Verified successfully" };
    }

    async login(dto: UserLoginDto) {
        const email = dto.email.trim().toLowerCase();

        const user = await findUserByEmail(email);
        if (!user) {
            throw new UnauthorizedException("user not found");
        }

        if(!user.emailVerifiedAt || user.status !== "ACTIVE") {
            throw new UnauthorizedException("email not verified");
        }

        const isValidPassword = await verifyPassword(user.passwordHash, dto.password);
        if (!isValidPassword) {
            throw new UnauthorizedException("invalid password");
        }

        const sessionToken = generateSessionToken();
        const tokenHash = hashSessionToken(sessionToken);

        const sessionDuration = dto.rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000;
        const expiresAt = new Date(Date.now() + sessionDuration);

        const session = createSession({
            userId: user.id,
            tokenHash,
            expiresAt
        });

        return {
            sessionToken,
            expiresAt: session.expiresAt,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role
            }
        };
    }

    async logout(sessionId: string) {
        await revokeSession(sessionId);
    }

    async resendVerification(dto: ResendVerificationDto) {
        const email = dto.email.trim().toLowerCase();

        const user = await findUserByEmail(email);
        if (!user) {
            throw new BadRequestException("Invalid verification request");
        }

        if (user.emailVerifiedAt) {
            throw new BadRequestException("Email already verified");
        }

        await deleteEmailVerificationsByUserId(user.id);

        const code = Math.floor(100000 + Math.random() * 900000).toString();

        const codeHash = await argon2.hash(code);

        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

        await createEmailVerification({
            userId: user.id,
            codeHash,
            expiresAt,
        });

        await this.emailProvider.sendVerificationCode(user.email, code);

        return { message: "Verification code sent successfully"};
    }

    async forgotPassword(dto: ForgotPasswordDto) {
        const email = dto.email.trim().toLowerCase();

        const user = await findUserByEmail(email);
        if (!user) {
            return {
                message:
                    "If an account exists with this email, a password reset link has been sent.",
            };
        }

        await deletePasswordResetsByUserId(user.id);

        const token = generatePasswordResetToken();

        const tokenHash = hashPasswordResetToken(token);

        const expiresAt = new Date(
            Date.now() + 15 * 60 * 1000,
        );

        await createPasswordReset({
            userId: user.id,
            tokenHash,
            expiresAt,
        });

        /*
        * Temporary development provider.
        *
        * We'll add a dedicated password-reset email
        * method to EmailProvider next.
        */
        await this.emailProvider.sendPasswordReset(
            user.email,
            token,
        );

        return {
            message:
                "If an account exists with this email, a password reset link has been sent.",
        };
    }

    async resetPassword(dto: ResetPasswordDto) {
        const tokenHash = hashPasswordResetToken(
            dto.token,
        );

        const reset = await findPasswordResetByTokenHash(
            tokenHash,
        );

        if (!reset) {
            throw new BadRequestException(
                "Invalid or expired password reset token",
            );
        }

        if (reset.usedAt) {
            throw new BadRequestException(
                "Password reset token has already been used",
            );
        }

        if (reset.expiresAt <= new Date()) {
            throw new BadRequestException(
                "Invalid or expired password reset token",
            );
        }

        const passwordHash = await argon2.hash(
            dto.password,
        );

        await updateUserPassword(reset.userId, passwordHash);

        await revokeAllUserSessions(reset.userId);

        await markPasswordResetUsed(reset.id);

        return {
            message: "Password reset successfully",
        };

    }
}