import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SetMetadata } from '@nestjs/common';

/**
 * Guard que garante que usuários só acessem seus próprios dados
 *
 * Para candidatos: Cada candidato só vê seus próprios dados
 * Para empresas: Usuários da empresa podem ver dados de outros usuários da mesma empresa
 *                (respeitando as permissões de role)
 *
 * Uso:
 * @UseGuards(JwtAuthGuard, UserDataIsolationGuard)
 * @OwnerOnly() // opcional - só o próprio usuário pode acessar
 */
@Injectable()
export class UserDataIsolationGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.userId) {
      throw new ForbiddenException('Usuário não autenticado');
    }

    // Verificar se a rota requer que seja o próprio dono do recurso
    const ownerOnly = this.reflector.get<boolean>(
      'ownerOnly',
      context.getHandler(),
    );

    if (!ownerOnly) {
      // Se não requer ser dono, apenas verificar tenant (feito pelo TenantIsolationGuard)
      return true;
    }

    // Verificar userId nos parâmetros da URL
    const params = request.params;
    const targetUserId = params.userId || params.id;

    if (targetUserId && targetUserId !== user.userId) {
      // Para candidatos, sempre rejeitar acesso a dados de outros
      if (user.tenantType === 'CANDIDATE') {
        throw new ForbiddenException(
          'Você só pode acessar seus próprios dados',
        );
      }

      // Para empresas, verificar se tem permissão de admin/manager
      // (isso pode ser expandido para verificar permissões específicas)
      const userRole = user.role?.name;
      const allowedRoles = ['OWNER', 'ADMIN', 'MANAGER'];

      if (!userRole || !allowedRoles.includes(userRole)) {
        throw new ForbiddenException(
          'Você não tem permissão para acessar dados de outros usuários',
        );
      }
    }

    return true;
  }
}

/**
 * Decorator para rotas que só o próprio usuário pode acessar
 */
export const OwnerOnly = () => SetMetadata('ownerOnly', true);
