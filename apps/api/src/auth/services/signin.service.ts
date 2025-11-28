import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcrypt';
import { AuthRepository } from '../repositories/auth.repository';
import { TwoFactorService } from './two-factor.service';

/**
 * Sign In Service
 *
 * Responsabilidades:
 * - Autenticação de usuários
 * - Geração de tokens JWT
 * - Integração com 2FA
 *
 * Princípio: Single Responsibility - APENAS autenticação
 */
@Injectable()
export class SignInService {
  private readonly logger = new Logger(SignInService.name);

  constructor(
    private readonly authRepository: AuthRepository,
    private readonly jwtService: JwtService,
    private readonly twoFactorService: TwoFactorService,
  ) {}

  /**
   * Autenticar usuário
   */
  async execute(
    email: string,
    password: string,
    tenantId: string,
    twoFactorToken?: string,
  ) {
    this.logger.log(`[signIn] Iniciando signin para email: ${email}`);

    // Verificar tenant
    const tenant = await this.authRepository.findTenantByIdOrSlug(tenantId);

    if (!tenant) {
      this.logger.warn(`[signIn] Tenant não encontrado: ${tenantId}`);
      throw new UnauthorizedException('Credenciais inválidas');
    }

    // Buscar usuário
    const user = await this.authRepository.findUserByEmailAndTenant(
      email,
      tenant.id,
    );

    if (!user) {
      this.logger.warn(`[signIn] Usuário não encontrado: ${email}`);
      throw new UnauthorizedException('Credenciais inválidas');
    }

    // Validar senha
    const isPasswordValid = await compare(password, user.password);

    if (!isPasswordValid) {
      this.logger.warn(`[signIn] Senha inválida para: ${email}`);
      throw new UnauthorizedException('Credenciais inválidas');
    }

    // Verificar 2FA se ativo
    if (user.twoFactorEnabled) {
      if (!twoFactorToken) {
        return {
          requiresTwoFactor: true,
          userId: user.id,
          message: 'Código de autenticação de dois fatores necessário',
        };
      }

      const isValid = await this.twoFactorService.verifyTwoFactorToken(
        user.id,
        twoFactorToken,
      );

      if (!isValid) {
        throw new UnauthorizedException('Código de autenticação inválido');
      }
    }

    // Gerar token JWT
    const payload = {
      sub: user.id,
      email: user.email,
      tenantId: user.tenantId,
      tenantSlug: tenant.slug,
      tenantType: tenant.type, // CANDIDATE or COMPANY
    };

    const access_token = await this.jwtService.signAsync(payload);

    this.logger.log(`[signIn] Token gerado com sucesso para: ${email}`);

    return {
      requiresTwoFactor: false,
      access_token,
      tenantType: tenant.type, // Return tenant type to frontend
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    };
  }

  /**
   * Refresh token
   */
  async refreshToken(userId: string) {
    const user = await this.authRepository.findUserById(userId);

    if (!user || !user.isActive || user.deletedAt) {
      throw new UnauthorizedException('Usuário inválido ou inativo');
    }

    const tenant = await this.authRepository.findTenantById(user.tenantId);

    const payload = {
      sub: user.id,
      email: user.email,
      tenantId: user.tenantId,
      tenantSlug: tenant?.slug,
      tenantType: tenant?.type,
    };

    const access_token = await this.jwtService.signAsync(payload);

    return { access_token, tenantType: tenant?.type };
  }
}
