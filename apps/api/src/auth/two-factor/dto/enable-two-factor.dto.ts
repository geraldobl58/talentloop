import { IsString, IsNotEmpty, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class EnableTwoFactorDto {
  @IsString()
  @IsNotEmpty()
  @Length(6, 6)
  @ApiProperty({
    example: '123456',
    description: 'Six-digit TOTP code from authenticator app',
    minLength: 6,
    maxLength: 6,
  })
  token: string;
}
