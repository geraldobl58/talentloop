import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';

import { Strategy, ExtractJwt } from 'passport-jwt';

import { PrismaService } from '../libs/prisma/prisma.service';

export interface JwtPayload {
  sub: string;
  email: string;
  tenantId: string;
  tenantSlug?: string;
  iat?: number;
  exp?: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private config: ConfigService,
    private prisma: PrismaService,
  ) {
    const jwtSecret = config.get<string>('JWT_SECRET');

    if (!jwtSecret) {
      throw new Error('JWT_SECRET is not defined in configuration');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
    });
  }

  async validate(payload: JwtPayload) {
    try {
      const user = await this.prisma.user.findUnique({
        where: {
          id: payload.sub,
          tenantId: payload.tenantId,
          deletedAt: null,
          isActive: true,
        },
        select: {
          id: true,
          name: true,
          email: true,
          tenantId: true,
        },
      });

      if (!user) {
        throw new UnauthorizedException('Usuário não encontrado ou inativo');
      }

      const tenant = await this.prisma.tenant.findUnique({
        where: { id: user.tenantId },
        select: {
          id: true,
          name: true,
          slug: true,
        },
      });

      // Buscar role do usuário
      const userRole = await this.prisma.userRole.findFirst({
        where: {
          userId: user.id,
          tenantId: user.tenantId,
          OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
        },
        include: {
          role: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      return {
        userId: user.id,
        email: user.email,
        name: user.name,
        tenantId: user.tenantId,
        tenant,
        role: userRole?.role || null,
      };
    } catch {
      throw new UnauthorizedException('Token inválido');
    }
  }
}
