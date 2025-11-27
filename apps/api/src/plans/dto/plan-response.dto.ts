import { ApiProperty } from '@nestjs/swagger';

export class PlanInfoDto {
  @ApiProperty({
    description: 'ID do plano',
    example: 'plan_123',
  })
  id: string;

  @ApiProperty({
    description: 'Nome do plano',
    example: 'PROFESSIONAL',
  })
  name: string;

  @ApiProperty({
    description: 'Preço do plano',
    example: 299.0,
  })
  price: number;

  @ApiProperty({
    description: 'Moeda',
    example: 'BRL',
  })
  currency: string;

  @ApiProperty({
    description: 'Máximo de usuários',
    example: 20,
    required: false,
  })
  maxUsers?: number;

  @ApiProperty({
    description: 'Máximo de contatos',
    example: 5000,
    required: false,
  })
  maxContacts?: number;

  @ApiProperty({
    description: 'Tem acesso à API',
    example: true,
  })
  hasAPI: boolean;

  @ApiProperty({
    description: 'Descrição do plano',
    example: 'Ideal para empresas em crescimento',
  })
  description: string;

  @ApiProperty({
    description: 'Data de expiração do plano',
    example: '2024-02-15T10:30:00Z',
  })
  planExpiresAt: string;

  @ApiProperty({
    description: 'Data de criação',
    example: '2024-01-15T10:30:00Z',
  })
  createdAt: string;

  @ApiProperty({
    description: 'Status do plano',
    enum: ['ACTIVE', 'EXPIRED', 'CANCELLED'],
    example: 'ACTIVE',
  })
  status: 'ACTIVE' | 'EXPIRED' | 'CANCELLED';
}

export class PlanUpgradeResponseDto {
  @ApiProperty({
    description: 'Sucesso da operação',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Mensagem de resposta',
    example: 'Plano atualizado com sucesso',
  })
  message: string;

  @ApiProperty({
    description: 'Novo plano',
    type: PlanInfoDto,
  })
  newPlan: PlanInfoDto;

  @ApiProperty({
    description: 'Próxima data de cobrança',
    example: '2024-03-15T10:30:00Z',
  })
  nextBillingDate: string;
}

export class PlanCancelResponseDto {
  @ApiProperty({
    description: 'Sucesso da operação',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Mensagem de resposta',
    example: 'Plano cancelado com sucesso',
  })
  message: string;
}
