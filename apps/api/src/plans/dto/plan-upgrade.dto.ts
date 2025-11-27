import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export enum PlanType {
  STARTER = 'STARTER',
  PROFESSIONAL = 'PROFESSIONAL',
  ENTERPRISE = 'ENTERPRISE',
}

export class PlanUpgradeDto {
  @ApiProperty({
    description: 'Novo plano para upgrade (método tradicional)',
    enum: PlanType,
    example: PlanType.PROFESSIONAL,
    required: false,
  })
  @IsEnum(PlanType)
  @IsOptional()
  newPlan?: PlanType;

  @ApiProperty({
    description:
      'Stripe price ID para upgrade via Stripe (obrigatório para assinatura ativa)',
    example: 'price_1234567890',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  stripePriceId: string;
}
