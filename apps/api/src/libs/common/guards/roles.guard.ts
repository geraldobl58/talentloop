import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RoleType } from '@prisma/client';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<RoleType[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // Se não há roles requeridas, permite o acesso
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.userId || !user.tenantId) {
      throw new ForbiddenException('Usuário não autenticado');
    }

    // Busca a role do usuário no tenant atual
    const userRole = await this.prisma.userRole.findFirst({
      where: {
        userId: user.userId,
        tenantId: user.tenantId,
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
      include: {
        role: true,
      },
    });

    if (!userRole) {
      throw new ForbiddenException(
        'Você não possui permissão para acessar este recurso',
      );
    }

    // Hierarquia de roles: OWNER > ADMIN > MANAGER > MEMBER > VIEWER
    const roleHierarchy: Record<RoleType, number> = {
      [RoleType.OWNER]: 5,
      [RoleType.ADMIN]: 4,
      [RoleType.MANAGER]: 3,
      [RoleType.MEMBER]: 2,
      [RoleType.VIEWER]: 1,
    };

    const userRoleLevel = roleHierarchy[userRole.role.name];

    // Verifica se o usuário tem pelo menos uma das roles requeridas ou superior
    const hasAccess = requiredRoles.some((requiredRole) => {
      const requiredRoleLevel = roleHierarchy[requiredRole];
      return userRoleLevel >= requiredRoleLevel;
    });

    if (!hasAccess) {
      throw new ForbiddenException(
        'Você não possui permissão para acessar este recurso',
      );
    }

    // Adiciona a role ao request para uso posterior
    request.user.role = {
      id: userRole.role.id,
      name: userRole.role.name,
    };

    return true;
  }
}
