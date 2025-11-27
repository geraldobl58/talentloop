import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    // Se não há permissões requeridas, permite o acesso
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.userId || !user.tenantId) {
      throw new ForbiddenException('Usuário não autenticado');
    }

    // Busca a role do usuário com suas permissões
    const userRole = await this.prisma.userRole.findFirst({
      where: {
        userId: user.userId,
        tenantId: user.tenantId,
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
      include: {
        role: {
          include: {
            permissions: {
              include: {
                permission: true,
              },
            },
          },
        },
      },
    });

    if (!userRole) {
      throw new ForbiddenException(
        'Você não possui permissão para acessar este recurso',
      );
    }

    // Extrai os nomes das permissões do usuário
    const userPermissions = userRole.role.permissions.map(
      (rp) => rp.permission.name,
    );

    // Verifica se o usuário tem todas as permissões requeridas
    const hasAllPermissions = requiredPermissions.every((permission) =>
      userPermissions.includes(permission),
    );

    if (!hasAllPermissions) {
      throw new ForbiddenException(
        'Você não possui as permissões necessárias para acessar este recurso',
      );
    }

    // Adiciona as permissões ao request para uso posterior
    request.user.permissions = userPermissions;

    return true;
  }
}
