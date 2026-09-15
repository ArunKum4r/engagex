import { IsIn } from "class-validator";

export class UpdatePlatformUserStatusDto {
  @IsIn(["ACTIVE", "SUSPENDED"])
  status!: "ACTIVE" | "SUSPENDED";
}