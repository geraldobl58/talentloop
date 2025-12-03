import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { TenantType } from '@prisma/client';
import { TENANT_TYPE_KEY } from '../decorators/tenant-type.decorator';

/**
 * Guard que verifica se o usuário é do tipo de tenant correto
 *
 * Este guard é usado em conjunto com o decorator @TenantType
 * para restringir rotas a candidatos ou empresas.
 *
 * Uso:
 * @UseGuards(JwtAuthGuard, TenantIsolationGuard, TenantTypeGuard)
 * @TenantType('COMPANY')
 *
 * Ou nos controllers de candidatos/empresas:
 * @TenantType('CANDIDATE')
 * class CandidatePlansController {}
 */
@Injectable()
export class TenantTypeGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Buscar o tipo de tenant requerido no método ou classe
    const requiredTenantType = this.reflector.getAllAndOverride<TenantType>(
      TENANT_TYPE_KEY,
      [context.getHandler(), context.getClass()],
    );

    // Se não há restrição de tipo, permitir acesso
    if (!requiredTenantType) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Usuário não autenticado');
    }

    // Verificar se o tipo de tenant do usuário corresponde ao requerido
    if (user.tenantType !== requiredTenantType) {
      const typeLabel =
        requiredTenantType === TenantType.CANDIDATE ? 'candidatos' : 'empresas';
      throw new ForbiddenException(
        `Esta funcionalidade é exclusiva para ${typeLabel}`,
      );
    }

    return true;
  }
}
