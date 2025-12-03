import { SetMetadata } from '@nestjs/common';
import { TenantType as PrismaTenantType } from '@prisma/client';

export const TENANT_TYPE_KEY = 'tenantType';

/**
 * Decorator para especificar o tipo de tenant requerido para a rota
 *
 * @param type - Tipo de tenant ('CANDIDATE' | 'COMPANY')
 *
 * Uso:
 * @TenantType('CANDIDATE')
 * @TenantType('COMPANY')
 */
export const TenantType = (type: PrismaTenantType | 'CANDIDATE' | 'COMPANY') =>
  SetMetadata(TENANT_TYPE_KEY, type);

/**
 * Decorator para rotas exclusivas de candidatos
 */
export const CandidateOnly = () => TenantType('CANDIDATE');

/**
 * Decorator para rotas exclusivas de empresas
 */
export const CompanyOnly = () => TenantType('COMPANY');
