import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsArray,
  IsDateString,
} from 'class-validator';
import { RoleType } from '@prisma/client';

export class AssignRoleDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsEnum(RoleType)
  @IsNotEmpty()
  role: RoleType;

  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}

export class ChangeRoleDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsEnum(RoleType)
  @IsNotEmpty()
  newRole: RoleType;
}

export class SetPermissionsDto {
  @IsArray()
  @IsString({ each: true })
  permissionIds: string[];
}

export class RemoveUserDto {
  @IsString()
  @IsNotEmpty()
  userId: string;
}
