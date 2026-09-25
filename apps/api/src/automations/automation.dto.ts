import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsArray, IsIn, IsInt, IsISO8601, IsNotEmpty, IsNumber, IsObject, IsOptional, IsString, IsUUID, MaxLength, Min, ValidateNested } from "class-validator";
import { Type } from "class-transformer";

export class CreateAutomationDto {
    @ApiProperty({
        example: "Instagram Price Inquiry",
    })
    @IsString()
    @MaxLength(255)
    name: string;

    @ApiPropertyOptional({
        example: "Send pricing information when someone asks about price",
    })
    @IsOptional()
    @IsString()
    @MaxLength(1000)
    description?: string;

    @ApiPropertyOptional({
        example: "72728de2-7d91-4e7a-a380-9715ddbcb80f",
        description: "Connected platform account used by this automation",
    })
    @IsOptional()
    @IsUUID()
    platformAccountId?: string;
}

export class UpdateAutomationDto {
    @ApiPropertyOptional({
        example: "Updated Price Inquiry",
    })
    @IsOptional()
    @IsString()
    @MaxLength(255)
    name?: string;

    @ApiPropertyOptional({
        example: "Updated automation description",
    })
    @IsOptional()
    @IsString()
    @MaxLength(1000)
    description?: string;

    @ApiPropertyOptional({
        example: "72728de2-7d91-4e7a-a380-9715ddbcb80f",
    })
    @IsOptional()
    @IsUUID()
    platformAccountId?: string;

    @ApiPropertyOptional({
        example: 10,
        description: "Automation priority. Higher values run first.",
    })
    @IsOptional()
    @IsInt()
    priority?: number;

    @ApiPropertyOptional({
        enum: ["EXCLUSIVE", "ALLOW_MULTIPLE"],
        example: "EXCLUSIVE",
    })
    @IsOptional()
    @IsIn(["EXCLUSIVE", "ALLOW_MULTIPLE"])
    executionPolicy?: "EXCLUSIVE" | "ALLOW_MULTIPLE";

    @ApiPropertyOptional({
        enum: [
            "EVERY_EVENT",
            "ONCE_PER_CONTACT",
            "ONCE_PER_CONVERSATION",
            "COOLDOWN",
        ],
        example: "EVERY_EVENT",
    })
    @IsOptional()
    @IsIn([
        "EVERY_EVENT",
        "ONCE_PER_CONTACT",
        "ONCE_PER_CONVERSATION",
        "COOLDOWN",
    ])
    triggerRunPolicy?:
        | "EVERY_EVENT"
        | "ONCE_PER_CONTACT"
        | "ONCE_PER_CONVERSATION"
        | "COOLDOWN";

    @ApiPropertyOptional({
        example: 3600,
        description: "Cooldown duration in seconds.",
    })
    @IsOptional()
    @IsInt()
    @Min(1)
    cooldownSeconds?: number | null;
}

export class AutomationResponseDto {
    @ApiProperty({
        example: "72728de2-7d91-4e7a-a380-9715ddbcb80f",
    })
    id: string;

    @ApiProperty({
        example: "Instagram Price Inquiry",
    })
    name: string;

    @ApiPropertyOptional({
        example: "Send pricing information when someone asks about price",
    })
    description: string | null;

    @ApiProperty({
        example: "DRAFT",
        enum: ["DRAFT", "ACTIVE", "PAUSED"],
    })
    status: string;

    @ApiPropertyOptional({
        example: "72728de2-7d91-4e7a-a380-9715ddbcb80f",
    })
    platformAccountId: string | null;

    @ApiProperty({
        example: "72728de2-7d91-4e7a-a380-9715ddbcb80f",
    })
    workspaceId: string;

    @ApiProperty({
        example: "72728de2-7d91-4e7a-a380-9715ddbcb80f",
    })
    createdByUserId: string;

    @ApiProperty()
    createdAt: Date;

    @ApiProperty()
    updatedAt: Date;
}

export class AutomationGraphResponseDto {
    @ApiProperty({
        type: AutomationResponseDto,
    })
    automation: AutomationResponseDto;

    @ApiProperty({
        type: Object,
        isArray: true,
    })
    triggers: object[];

    @ApiProperty({
        type: Object,
        isArray: true,
    })
    steps: object[];

    @ApiProperty({
        type: Object,
        isArray: true,
    })
    edges: object[];
}

export class AutomationGraphTriggerDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(64)
    type: string;

    @IsOptional()
    @IsString()
    entryStepId?: string | null;

    @IsOptional()
    @IsObject()
    config?: Record<string, unknown>;
}

export class AutomationGraphCanvasPositionDto {
    @IsNumber()
    x: number;

    @IsNumber()
    y: number;
}

export class AutomationGraphStepDto {
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    id?: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(64)
    type: string;

    @IsOptional()
    @IsInt()
    @Min(0)
    position?: number;

    @IsOptional()
    @ValidateNested()
    @Type(() => AutomationGraphCanvasPositionDto)
    canvasPosition?: AutomationGraphCanvasPositionDto;

    @IsOptional()
    @IsObject()
    config?: Record<string, unknown>;
}   

export class AutomationGraphEdgeDto {
    @IsString()
    @IsNotEmpty()
    fromStepId: string;

    @IsString()
    @IsNotEmpty()
    toStepId: string;

    @IsOptional()
    @IsString()
    @MaxLength(32)
    branch?: string | null;
}

export class SaveAutomationGraphDto {
    @IsOptional()
    @ValidateNested()
    @Type(() => AutomationGraphTriggerDto)
    trigger?: AutomationGraphTriggerDto | null;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => AutomationGraphStepDto)
    steps: AutomationGraphStepDto[];

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => AutomationGraphEdgeDto)
    edges: AutomationGraphEdgeDto[];
}

export class ContactAutomationPauseDto {
    @ApiPropertyOptional({
        description:
            "Automation ID. Omit to pause all automations for the contact.",
    })
    @IsOptional()
    @IsUUID()
    automationId?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    reason?: string;

    @ApiPropertyOptional({
        description:
            "Optional time when the automation should resume.",
    })
    @IsOptional()
    @IsISO8601()
    resumeAt?: string;
}