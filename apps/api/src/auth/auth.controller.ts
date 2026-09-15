import { Body, Controller, Get, Post, Res, UseGuards, Req } from "@nestjs/common";
import type { response, Response } from "express";
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { AuthService } from "./auth.service.js";
import { ForgotPasswordDto, RegisterDto, ResendVerificationDto, ResetPasswordDto, UserLoginDto, VerifyEmailDto } from "./auth.dto.js";
import { AuthGuard } from "./auth.guard.js";
import type { AuthenticatedRequest } from "./auth.types.js";

@ApiTags("Auth")
@Controller("auth")
export class AuthController {

    constructor(
        private readonly authService: AuthService,
    ) {}

    // ============================
    // SignUp / Register
    // ============================
    @Post("register")
    @ApiOperation({
        summary: "Register a new user",
    })
    @ApiBody({
        type: RegisterDto,
        examples: {
            default: {
                summary: "Example registration",
                value: {
                    email: "arun@example.com",
                    name: "Arun Kumar",
                    password: "Password@123",
                },
            },
        },
    })
    @ApiResponse({
        status: 201,
        description: "User registered successfully",
    })
    async register(@Body() dto: RegisterDto) {
        return this.authService.register(dto);
    }

    // ============================
    // Verify Email
    // ============================
    @Post("verify-email")
    @ApiOperation({
        summary: "Verify user email",
    })
    @ApiBody({
        type: VerifyEmailDto,
        examples: {
            default: {
                summary: "Example email verification",
                value: {
                    email: "[email_address]",
                otp: "123456"
                }
            }
        }
    })
    @ApiResponse({
        status: 200,
        description: "Email verified successfully",
    })
    @ApiResponse({
        status: 400,
        description: "Invalid OTP or email",
    })
    async verifyEmail(@Body() dto: VerifyEmailDto) {
        return this.authService.verifyEmail(dto);
    }

    // ============================
    // User Login
    // ============================
    @Post("login")
    @ApiOperation({
        summary: "user login",
    })
    @ApiBody({
        type: UserLoginDto,
        examples: {
            default: {
                summary: "Example login",
                value: {
                    email: "arun@example.com",
                    password: "Password@123",
                    rememberMe: true,
                },
            },
        },
    })
    @ApiResponse({
        status: 200,
        description: "User logged in successfully",
    })
    @ApiResponse({
        status: 401,
        description: "Invalid email or password",
    })
    async login(@Body() dto: UserLoginDto, @Res({ passthrough: true }) response: Response) {
        
        const result = await this.authService.login(dto);

        const maxAge = dto.rememberMe
            ? 30 * 24 * 60 * 60 * 1000
            : 24 * 60 * 60 * 1000;

        response.cookie("session", result.sessionToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge,
            path: "/",
        });

        return {
            user: result.user,
            expiresAt: result.expiresAt,
        };
    }

    // ============================
    // Get Authenticated user
    // ============================
    @Get("me")
    @UseGuards(AuthGuard)
    @ApiOperation({
        summary: "Get current authenticated user",
    })
    @ApiResponse({
        status: 200,
        description: "Authenticaed User"
    })
    async me(@Req() request: AuthenticatedRequest) {
        return { user: request.user};
    }

    // ============================
    // Logout
    // ============================
    @Post("logout")
    @UseGuards(AuthGuard)
    @ApiOperation({
        summary: "User logout",
    })
    @ApiResponse({
        status: 200,
        description: "User logged out successfully",
    })
    @ApiResponse({
        status: 401,
        description: "Invalid session",
    })
    async logout(@Req() request: AuthenticatedRequest, @Res({ passthrough: true }) response: Response) {
        await this.authService.logout(request.sessionId);

        response.clearCookie("session", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/"
        });

        return { message: "Logged out successfully" };
    }

    // ============================
    // Resend verification email
    // ============================
    @Post("resend-verification")
    @ApiOperation({
        summary: "Resend verification email",
    })
    @ApiBody({
        type: ResendVerificationDto,
        examples: {
            default: {
                summary: "Example resend verification",
                value: {
                    email: "[EMAIL_ADDRESS]"
                }
            }
        }
    })
    @ApiResponse({
        status: 200,
        description: "Verification email sent successfully",
    })
    @ApiResponse({
        status: 400,
        description: "Invalid email or user not found",
    })
    async resendVerification(@Body() dto: ResendVerificationDto) {
        return this.authService.resendVerification(dto);
    }

    
    // ============================
    // Forgot Password
    // ============================
    @Post("forgot-password")
    @ApiOperation({
        summary: "Request a password reset",
    })
    @ApiBody({
        type: ForgotPasswordDto,
        examples: {
            default: {
                summary: "Example password reset request",
                value: {
                    email: "arun@example.com",
                },
            },
        },
    })
    @ApiResponse({
        status: 200,
        description: "Password reset request processed",
    })
    async forgotPassword(@Body() dto: ForgotPasswordDto) {
        return this.authService.forgotPassword(dto);
    }

    
    // ============================
    // Reset Password
    // ============================
    @Post("reset-password")
    @ApiOperation({
        summary: "Reset password",
    })
    @ApiBody({
        type: ResetPasswordDto,
    examples: {
        default: {
            summary: "Example password reset",
            value: {
                token: "reset-token-from-email",
                password: "NewPassword@123",
            },
        },
    },
    })
    @ApiResponse({
        status: 200,
        description: "Password reset successfully",
    })
    async resetPassword(@Body() dto: ResetPasswordDto) {
        return this.authService.resetPassword(dto);
    }
}