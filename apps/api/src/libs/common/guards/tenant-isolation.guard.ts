import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { TenantType } from '@prisma/client';

/**
 * Guard que garante isolamento de tenant
 *
 * Este guard verifica:
 * 1. Se o usuário está autenticado
 * 2. Se o usuário está acessando apenas dados do seu próprio tenant
 * 3. Se o tipo de tenant corresponde ao esperado (opcional)
 *
 * Uso:
 * @UseGuards(JwtAuthGuard, TenantIsolationGuard)
 * @TenantType('COMPANY') // opcional - restringe a apenas empresas
 */
@Injectable()
export class TenantIsolationGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.tenantId) {
      throw new ForbiddenException('Usuário não autenticado corretamente');
    }

    // Verificar se há restrição de tipo de tenant na rota
    const requiredTenantType = this.reflector.get<TenantType>(
      'tenantType',
      context.getHandler(),
    );

    if (requiredTenantType && user.tenantType !== requiredTenantType) {
      throw new ForbiddenException(
        `Esta rota é restrita para ${requiredTenantType === TenantType.CANDIDATE ? 'candidatos' : 'empresas'}`,
      );
    }

    // Verificar se o tenantId no params/query/body corresponde ao do usuário
    const params = request.params;
    const query = request.query;
    const body = request.body;

    // Verificar tenantId nos parâmetros da URL
    if (params.tenantId && params.tenantId !== user.tenantId) {
      throw new ForbiddenException(
        'Você não tem permissão para acessar dados de outro tenant',
      );
    }

    // Verificar tenantId na query string
    if (query.tenantId && query.tenantId !== user.tenantId) {
      throw new ForbiddenException(
        'Você não tem permissão para acessar dados de outro tenant',
      );
    }

    // Verificar tenantId no body (para POST/PUT/PATCH)
    if (body?.tenantId && body.tenantId !== user.tenantId) {
      throw new ForbiddenException(
        'Você não tem permissão para modificar dados de outro tenant',
      );
    }

    return true;
  }
}

/**
 * Decorator para especificar o tipo de tenant requerido
 */
import { SetMetadata } from '@nestjs/common';

export const RequireTenantType = (type: TenantType) =>
  SetMetadata('tenantType', type);

/**
 * Decorator para rotas exclusivas de candidatos
 */
export const CandidatesOnly = () => RequireTenantType(TenantType.CANDIDATE);

/**
 * Decorator para rotas exclusivas de empresas
 */
export const CompaniesOnly = () => RequireTenantType(TenantType.COMPANY);
