import { IsIn, IsObject, IsOptional, IsString, IsUUID, MaxLength } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreatePlatformAccountDto {
    @ApiProperty({
        example: "INSTAGRAM",
        enum: ["INSTAGRAM"],
    })
    @IsString()
    @IsIn(["INSTAGRAM", "WHATSAPP"])
    platform: string;

    @ApiProperty({
        example: "17841400000000000",
        description: "Platform's external account ID",
    })
    @IsString()
    @MaxLength(255)
    externalAccountId: string;

    @ApiPropertyOptional({
        example: "EngageX Demo",
    })
    @IsOptional()
    @IsString()
    @MaxLength(255)
    name?: string;

    @ApiPropertyOptional({
        example: "engagex_demo",
    })
    @IsOptional()
    @IsString()
    @MaxLength(255)
    username?: string;

    @ApiPropertyOptional({
        example: {
            accountType: "BUSINESS",
        },
    })
    @IsOptional()
    @IsObject()
    metadata?: Record<string, unknown>;
}

export class UpdatePlatformAccountDto {
    @ApiPropertyOptional({
        example: "EngageX Instagram",
    })
    @IsOptional()
    @IsString()
    @MaxLength(255)
    name?: string;

    @ApiPropertyOptional({
        example: "engagex_demo",
    })
    @IsOptional()
    @IsString()
    @MaxLength(255)
    username?: string;

    @ApiPropertyOptional({
        example: "ACTIVE",
        enum: ["ACTIVE", "DISCONNECTED", "ERROR"],
    })
    @IsOptional()
    @IsString()
    @IsIn([
        "ACTIVE",
        "DISCONNECTED",
        "ERROR",
    ])
    status?: string;

    @ApiPropertyOptional({
        example: {
            accountType: "BUSINESS",
        },
    })
    @IsOptional()
    @IsObject()
    metadata?: Record<string, unknown>;
}

export class PlatformAccountResponseDto {
    @ApiProperty({
        example: "72728de2-7d91-4e7a-a380-9715ddbcb80f",
    })
    id: string;

    @ApiProperty({
        example: "72728de2-7d91-4e7a-a380-9715ddbcb80f",
    })
    workspaceId: string;

    @ApiProperty({
        example: "INSTAGRAM",
    })
    platform: string;

    @ApiProperty({
        example: "17841400000000000",
    })
    externalAccountId: string;

    @ApiPropertyOptional({
        example: "EngageX Demo",
    })
    name: string | null;

    @ApiPropertyOptional({
        example: "engagex_demo",
    })
    username: string | null;

    @ApiProperty({
        example: "ACTIVE",
        enum: [
            "ACTIVE",
            "DISCONNECTED",
            "ERROR",
        ],
    })
    status: string;

    @ApiProperty({
        example: {
            accountType: "BUSINESS",
        },
    })
    metadata: Record<string, unknown>;

    @ApiProperty()
    createdAt: Date;

    @ApiProperty()
    updatedAt: Date;
}