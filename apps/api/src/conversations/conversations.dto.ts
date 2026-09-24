import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
    IsIn,
    IsOptional,
    IsString,
    MinLength,
} from "class-validator";

export class SendMessageDto {
    @ApiProperty({
        enum: [
            "TEXT",
            "IMAGE",
            "VIDEO",
            "AUDIO",
            "FILE",
        ],
        default: "TEXT",
    })
    @IsOptional()
    @IsIn([
        "TEXT",
        "IMAGE",
        "VIDEO",
        "AUDIO",
        "FILE",
    ])
    type?: "TEXT" | "IMAGE" | "VIDEO" | "AUDIO" | "FILE";

    @ApiProperty({
        example: "Hello from EngageX",
    })
    @IsString()
    @MinLength(1)
    content!: string;
}