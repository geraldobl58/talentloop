import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class ForgotPasswordDto {
  @ApiProperty({
    description: 'Email do usuário',
    example: 'admin@empresa-demo.com',
  })
  @IsEmail({}, { message: 'Email inválido' })
  @IsNotEmpty({ message: 'Email é obrigatório' })
  email: string;

  @ApiProperty({
    description: 'Tenant ID ou Slug',
    example: 'empresa-demo',
  })
  @IsString({ message: 'Tenant ID deve ser uma string' })
  @IsNotEmpty({ message: 'Tenant ID é obrigatório' })
  tenantId: string;
}

export class ResetPasswordDto {
  @ApiProperty({
    description: 'Token de recuperação de senha',
    example: 'abc123xyz',
  })
  @IsString({ message: 'Token deve ser uma string' })
  @IsNotEmpty({ message: 'Token é obrigatório' })
  token: string;

  @ApiProperty({
    description: 'Nova senha',
    example: 'NewPassword123!',
  })
  @IsString({ message: 'Nova senha deve ser uma string' })
  @IsNotEmpty({ message: 'Nova senha é obrigatória' })
  newPassword: string;
}

export class ChangePasswordDto {
  @ApiProperty({
    description: 'Senha atual',
    example: 'OldPassword123!',
  })
  @IsString({ message: 'Senha atual deve ser uma string' })
  @IsNotEmpty({ message: 'Senha atual é obrigatória' })
  currentPassword: string;

  @ApiProperty({
    description: 'Nova senha',
    example: 'NewPassword123!',
  })
  @IsString({ message: 'Nova senha deve ser uma string' })
  @IsNotEmpty({ message: 'Nova senha é obrigatória' })
  newPassword: string;
}
