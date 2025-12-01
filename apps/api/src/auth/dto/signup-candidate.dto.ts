import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  IsEnum,
  IsOptional,
  Validate,
} from 'class-validator';
import { IsUrlOrLocalhostConstraint } from './validators';

/**
 * Planos disponíveis para candidatos (B2C)
 */
export enum CandidatePlanType {
  FREE = 'FREE',
  PRO = 'PRO',
  PREMIUM = 'PREMIUM',
}

export class SignupCandidateDto {
  @ApiProperty({
    description: 'Nome completo do candidato',
    example: 'João Silva',
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  name: string;

  @ApiProperty({
    description: 'Email do candidato',
    example: 'joao@email.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Plano escolhido pelo candidato',
    enum: CandidatePlanType,
    example: CandidatePlanType.FREE,
  })
  @IsEnum(CandidatePlanType)
  plan: CandidatePlanType;

  @ApiProperty({
    description: 'URL de sucesso para redirecionamento após pagamento',
    example: 'http://localhost:3000/auth/success',
    required: false,
  })
  @IsOptional()
  @Validate(IsUrlOrLocalhostConstraint)
  successUrl?: string;

  @ApiProperty({
    description:
      'URL de cancelamento para redirecionamento se pagamento for cancelado',
    example: 'http://localhost:3000/auth/sign-up',
    required: false,
  })
  @IsOptional()
  @Validate(IsUrlOrLocalhostConstraint)
  cancelUrl?: string;
}

export class SignupCandidateResponseDto {
  @ApiProperty({
    description: 'Indica se o signup foi bem-sucedido',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Mensagem de retorno',
    example:
      'Conta criada com sucesso. Verifique seu email para definir sua senha.',
  })
  message: string;

  @ApiProperty({
    description: 'ID do tenant (candidatos)',
    example: 'candidates',
    required: false,
  })
  tenantId?: string;

  @ApiProperty({
    description: 'Tipo do tenant',
    example: 'CANDIDATE',
    required: false,
  })
  tenantType?: 'CANDIDATE';

  @ApiProperty({
    description: 'URL do checkout do Stripe (se plano for pago)',
    example: 'https://checkout.stripe.com/pay/cs_1234567890',
    required: false,
  })
  checkoutUrl?: string;

  @ApiProperty({
    description: 'Dados do usuário criado',
    required: false,
  })
  user?: {
    id: string;
    name: string;
    email: string;
  };

  @ApiProperty({
    description: 'Dados do plano escolhido',
  })
  plan: {
    id: string;
    name: string;
    price: number;
    currency: string;
  };

  @ApiProperty({
    description: 'Indica se é plano FREE (sem pagamento)',
    example: true,
    required: false,
  })
  isFree?: boolean;

  @ApiProperty({
    description: 'Token JWT para login automático (plano FREE)',
    required: false,
  })
  token?: string;
}
