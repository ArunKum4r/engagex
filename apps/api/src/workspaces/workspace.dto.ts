import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsIn, IsNotEmpty, IsOptional, IsString, IsUUID, MaxLength, MinLength, IsEmail } from "class-validator";

export class CreateWorkspaceDto {
    @ApiProperty({
        example: "Xyz corp",
    })
    @IsString()
    @IsNotEmpty()
    @MinLength(2)
    @MaxLength(255)
    name: string;

    @ApiProperty({
        example: "xyz-corp",
    })
    @IsString()
    @IsNotEmpty()
    @MinLength(2)
    @MaxLength(100)
    slug: string;
}

export class UpdateWorkspaceDto {
    @ApiPropertyOptional({
        example: "Acme Corporation",
    })
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    @MinLength(2)
    @MaxLength(255)
    name?: string;

    @ApiPropertyOptional({
        example: "acme-corporation",
    })
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    @MinLength(2)
    @MaxLength(100)
    slug?: string;
}

export class AddWorkspaceMemberDto {
    @ApiProperty({
        example: "72728de2-7d91-4e7a-a380-9715ddbcb80f",
    })
    @IsUUID()
    userId: string;

    @ApiProperty({
        example: "MEMBER",
        enum: ["ADMIN", "MEMBER"],
        default: "MEMBER",
    })
    @IsIn(["ADMIN", "MEMBER"])
    role: string;
}

export class UpdateWorkspaceMemberRoleDto {
    @ApiProperty({
        example: "ADMIN",
        enum: ["ADMIN", "MEMBER"],
    })
    @IsIn(["ADMIN", "MEMBER"])
    role: string;
}

export class CreateWorkspaceInvitationDto {
    @ApiProperty({
        example: "member@example.com",
    })
    @IsEmail()
    email: string;

    @ApiProperty({
        example: "MEMBER",
        enum: ["MEMBER", "ADMIN"],
        default: "MEMBER",
    })
    @IsIn(["MEMBER", "ADMIN"])
    role: string;
}

export class AcceptWorkspaceInvitationDto {
    @ApiProperty({
        example: "7b7e8e5b2f...",
        description: "Invitation token received by email",
    })
    @IsString()
    @IsNotEmpty()
    token: string;
}