import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  IsStrongPassword,
  MaxLength,
  MinLength,
  IsOptional,
  Length,
} from 'class-validator';

/**
 * DTO para signin de candidatos (B2C)
 * Não requer tenantId - usa automaticamente o tenant "candidates"
 */
export class SignInCandidateDto {
  @IsEmail()
  @ApiProperty({
    example: 'joao@email.com',
    description: 'Email do candidato',
  })
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
    example: 'SenhaForte123!@#',
    description:
      'Password must contain at least 1 uppercase, 1 lowercase, 1 number, and 1 symbol. Length: 6-20 chars.',
    minLength: 6,
    maxLength: 20,
  })
  password: string;

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

/**
 * Resposta do signin de candidato
 */
export class SignInCandidateResponseDto {
  @ApiProperty({
    example: true,
    description: 'Indica se requer 2FA',
  })
  requiresTwoFactor: boolean;

  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'JWT access token',
    required: false,
  })
  access_token?: string;

  @ApiProperty({
    example: 'CANDIDATE',
    description: 'Tipo do tenant (sempre CANDIDATE para esta rota)',
  })
  tenantType: 'CANDIDATE';

  @ApiProperty({
    description: 'Dados do usuário autenticado',
    required: false,
  })
  user?: {
    id: string;
    name: string;
    email: string;
  };

  @ApiProperty({
    example: 'Código de autenticação de dois fatores necessário',
    description: 'Mensagem (quando requer 2FA)',
    required: false,
  })
  message?: string;

  @ApiProperty({
    example: 'user-123',
    description: 'ID do usuário (quando requer 2FA)',
    required: false,
  })
  userId?: string;
}
