import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString, MinLength, Length, IsBoolean } from "class-validator";

export class RegisterDto {
    @ApiProperty({
        example: "arun@example.com",
    })
    @IsEmail()
    email: string;

    @ApiProperty({
        example: "Arun Kumar",
    })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({
        example: "Password@123",
        minLength: 8,
    })
    @IsString()
    @MinLength(8)
    password: string;
}

export class VerifyEmailDto {
    @ApiProperty({
        example: "arun@example.com",
    })
    @IsEmail()
    email: string;

    @ApiProperty({
        example: "123456",
        minLength: 6,
        maxLength: 6,
    })
    @IsString()
    @Length(6, 6)
    otp: string;
}

export class UserLoginDto {
    @ApiProperty({
        example: "arun@example.com",
    })
    @IsEmail()
    email: string;

    @ApiProperty({
        example: "qwert@123"
    })
    @IsString()
    @MinLength(8)
    password: string;

    @ApiProperty({
        example: true,
        default: false,
        description: "Keep the user signed in for an extended period",
    })
    @IsBoolean()
    rememberMe: boolean;
}

export class ResendVerificationDto {
    @ApiProperty({
        example: "arun@example.com",
    })
    @IsEmail()
    email: string;
}

export class ForgotPasswordDto {
    @ApiProperty({
        example: "arun@example.com",
    })
    @IsEmail()
    email: string;
}

export class ResetPasswordDto {
    @ApiProperty({
        example: "reset-token-from-email",
    })
    @IsString()
    @IsNotEmpty()
    token: string;

    @ApiProperty({
        example: "NewPassword@123",
        minLength: 8,
    })
    @IsString()
    @MinLength(8)
    password: string;
}