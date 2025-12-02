import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/libs/prisma/prisma.service';
import { User, Tenant, PasswordReset, SubStatus } from '@prisma/client';

/**
 * Auth Repository
 *
 * Responsabilidades:
 * - Acesso a dados de usuários
 * - Acesso a dados de tenants
 * - Acesso a dados de password resets
 *
 * Princípio: Single Responsibility - APENAS data access
 */
@Injectable()
export class AuthRepository {
  private readonly logger = new Logger(AuthRepository.name);

  constructor(private readonly prisma: PrismaService) {}

  // ==================== TENANT ====================

  /**
   * Encontrar tenant por ID ou slug
   */
  async findTenantByIdOrSlug(identifier: string): Promise<Tenant | null> {
    return this.prisma.tenant.findFirst({
      where: {
        OR: [{ id: identifier }, { slug: identifier }],
      },
    });
  }

  /**
   * Encontrar tenant por slug
   */
  async findTenantBySlug(slug: string): Promise<Tenant | null> {
    return this.prisma.tenant.findUnique({
      where: { slug },
    });
  }

  /**
   * Encontrar tenant por ID
   */
  async findTenantById(id: string): Promise<Tenant | null> {
    return this.prisma.tenant.findUnique({
      where: { id },
    });
  }

  /**
   * Criar novo tenant
   */
  async createTenant(data: { name: string; slug: string }): Promise<Tenant> {
    return this.prisma.tenant.create({ data });
  }

  // ==================== USER ====================

  /**
   * Encontrar usuário por email e tenantId
   */
  async findUserByEmailAndTenant(
    email: string,
    tenantId: string,
  ): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: {
        tenantId_email: { tenantId, email },
        deletedAt: null,
        isActive: true,
      },
    });
  }

  /**
   * Encontrar usuário por ID
   */
  async findUserById(
    id: string,
    options?: { includeDeleted?: boolean },
  ): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: {
        id,
        ...(options?.includeDeleted ? {} : { deletedAt: null }),
      },
    });
  }

  /**
   * Encontrar usuário por email (qualquer tenant)
   */
  async findUserByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findFirst({
      where: { email, deletedAt: null, isActive: true },
    });
  }

  /**
   * Encontrar usuário por email com tenant (para identificar automaticamente o tenant)
   */
  async findUserByEmailWithTenant(
    email: string,
  ): Promise<(User & { tenant: Tenant }) | null> {
    return this.prisma.user.findFirst({
      where: { email, deletedAt: null, isActive: true },
      include: { tenant: true },
    });
  }

  /**
   * Criar novo usuário
   */
  async createUser(data: {
    tenantId: string;
    name: string;
    email: string;
    password: string;
    isActive?: boolean;
  }): Promise<User> {
    return this.prisma.user.create({
      data: {
        ...data,
        isActive: data.isActive ?? true,
      },
    });
  }

  /**
   * Atualizar usuário
   */
  async updateUser(
    id: string,
    data: Partial<{
      name: string;
      email: string;
      password: string;
      avatar: string;
      isActive: boolean;
      twoFactorEnabled: boolean;
      twoFactorSecret: string | null;
      twoFactorBackupCodes: string[];
    }>,
  ): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  /**
   * Obter usuário com dados básicos (sem senha)
   */
  async getUserProfile(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        isActive: true,
        twoFactorEnabled: true,
      },
    });
  }

  /**
   * Obter usuário com role (para exibir no frontend)
   */
  async getUserWithRole(userId: string, tenantId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        isActive: true,
        twoFactorEnabled: true,
        userRoles: {
          where: { tenantId },
          select: {
            role: {
              select: {
                name: true,
                description: true,
              },
            },
          },
          take: 1,
        },
      },
    });
  }

  // ==================== PASSWORD RESET ====================

  /**
   * Encontrar token de reset de senha
   */
  async findPasswordResetByToken(
    token: string,
  ): Promise<(PasswordReset & { user: User }) | null> {
    return this.prisma.passwordReset.findUnique({
      where: { token },
      include: { user: true },
    });
  }

  /**
   * Criar token de reset de senha
   */
  async createPasswordReset(data: {
    userId: string;
    token: string;
    expiresAt: Date;
  }): Promise<PasswordReset> {
    return this.prisma.passwordReset.create({ data });
  }

  /**
   * Marcar token de reset como usado
   */
  async markPasswordResetAsUsed(id: string): Promise<PasswordReset> {
    return this.prisma.passwordReset.update({
      where: { id },
      data: { usedAt: new Date() },
    });
  }

  /**
   * Invalidar todos os tokens de reset não usados de um usuário
   */
  async invalidateUserPasswordResets(userId: string): Promise<void> {
    await this.prisma.passwordReset.updateMany({
      where: {
        userId,
        usedAt: null,
      },
      data: {
        usedAt: new Date(),
      },
    });
  }

  /**
   * Executar transação de reset de senha
   */
  async executePasswordReset(
    userId: string,
    hashedPassword: string,
    resetId: string,
  ): Promise<void> {
    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: userId },
        data: { password: hashedPassword },
      }),
      this.prisma.passwordReset.update({
        where: { id: resetId },
        data: { usedAt: new Date() },
      }),
    ]);
  }

  // ==================== SUBSCRIPTION ====================

  /**
   * Obter subscription com plano
   */
  async getSubscriptionWithPlan(tenantId: string) {
    return this.prisma.subscription.findUnique({
      where: { tenantId },
      include: { plan: true },
    });
  }

  /**
   * Criar subscription
   */
  async createSubscription(data: {
    tenantId: string;
    planId: string;
    status: SubStatus;
    startedAt: Date;
    expiresAt: Date | null;
  }) {
    return this.prisma.subscription.create({ data });
  }
}
