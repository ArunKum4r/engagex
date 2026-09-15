import {
  IsArray,
  IsBoolean,
  IsEmail,
  IsOptional,
  IsString,
  IsUUID,
  MinLength,
} from "class-validator";

export class UpdateAdminUserDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;
}

export class UpdateAdminUserStatusDto {
  @IsBoolean()
  isActive!: boolean;
}

export class ReplaceAdminUserRolesDto {
  @IsArray()
  @IsUUID("4", { each: true })
  roleIds!: string[];
}

export class CreateAdminInvitationDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(2)
  name!: string;

  @IsString()
  roleSlug!: string;
}

export class AcceptAdminInvitationDto {
  @IsString()
  @MinLength(32)
  token!: string;

  @IsString()
  @MinLength(8)
  password!: string;
}