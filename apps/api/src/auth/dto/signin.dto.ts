import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  IsStrongPassword,
  MaxLength,
  MinLength,
  IsNotEmpty,
  IsOptional,
  Length,
} from 'class-validator';

export class SignInDto {
  @IsEmail()
  @ApiProperty({ example: 'janedoe@email.com' })
  email: string;

  @IsString()
  @MinLength(6)
  @MaxLength(20)
  @IsStrongPassword({
    minLength: 6,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1,
  })
  @ApiProperty({
    example: 'Jane@123',
    description:
      'Password must contain at least 1 uppercase, 1 lowercase, 1 number, and 1 symbol. Length: 6-20 chars.',
    minLength: 6,
    maxLength: 20,
  })
  password: string;

  @IsNotEmpty({
    message: 'Tenant ID é obrigatório',
  })
  @IsString()
  @ApiProperty({
    example: 'tenant-id-or-slug ex: jane-doe',
    description: 'Tenant ID or slug for multi-tenant sign in',
    required: true,
  })
  tenantId: string;

  @IsOptional()
  @IsString()
  @Length(6, 8)
  @ApiProperty({
    example: '123456',
    description:
      'Two-factor authentication code (6 digits from authenticator app or 8-char backup code)',
    required: false,
  })
  twoFactorToken?: string;
}
