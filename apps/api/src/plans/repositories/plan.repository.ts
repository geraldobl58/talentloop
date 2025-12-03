import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/libs/prisma/prisma.service';
import {
  Subscription,
  Plan,
  SubscriptionAction,
  SubStatus,
} from '@prisma/client';

/**
 * Plan Repository
 *
 * Responsabilidades:
 * - Acesso a dados de planos e assinaturas
 * - Queries ao Prisma para planos
 * - Queries ao Prisma para assinaturas
 *
 * Princípio: Single Responsibility - APENAS data access
 */
@Injectable()
export class PlanRepository {
  private readonly logger = new Logger(PlanRepository.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Obter assinatura atual do tenant
   */
  async getCurrentSubscription(
    tenantId: string,
  ): Promise<(Subscription & { plan: Plan }) | null> {
    const subscription = await this.prisma.subscription.findUnique({
      where: { tenantId },
      include: { plan: true },
    });
    return subscription;
  }

  /**
   * Atualizar assinatura
   */
  async updateSubscription(
    tenantId: string,
    data: Record<string, any>,
  ): Promise<Subscription> {
    const updated = await this.prisma.subscription.update({
      where: { tenantId },
      data,
    });
    return updated;
  }

  /**
   * Encontrar plano por nome
   */
  async findPlanByName(name: string): Promise<Plan | null> {
    const plan = await this.prisma.plan.findUnique({ where: { name } });
    return plan;
  }

  /**
   * Encontrar plano por ID
   */
  async findPlanById(id: string): Promise<Plan | null> {
    const plan = await this.prisma.plan.findUnique({ where: { id } });
    return plan;
  }

  /**
   * Listar todos os planos
   */
  async getAllPlans(): Promise<Plan[]> {
    const plans = await this.prisma.plan.findMany({
      orderBy: { price: 'asc' },
    });
    return plans;
  }

  /**
   * Encontrar histório de assinatura
   */
  async getSubscriptionHistory(tenantId: string) {
    const history = await this.prisma.subscriptionHistory.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    });
    return history;
  }

  /**
   * Criar registro de histórico de assinatura
   */
  async createSubscriptionHistory(data: any) {
    const record = await this.prisma.subscriptionHistory.create({
      data,
    });
    return record;
  }

  /**
   * Obter informações básicas do plano
   */
  async getPlanInfo(planId: string) {
    const plan = await this.findPlanById(planId);
    if (!plan) return null;

    return {
      id: plan.id,
      name: plan.name,
      price: plan.price,
      currency: plan.currency,
      maxUsers: plan.maxUsers,
      maxContacts: plan.maxContacts,
    };
  }

  /**
   * Encontrar plano por stripePriceId
   */
  async findPlanByStripePriceId(stripePriceId: string): Promise<Plan | null> {
    return this.prisma.plan.findFirst({
      where: { stripePriceId },
    });
  }

  /**
   * Obter assinatura com histórico
   */
  async getSubscriptionWithHistory(tenantId: string) {
    return this.prisma.subscription.findUnique({
      where: { tenantId },
      include: {
        plan: true,
        history: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }

  /**
   * Obter tenant por ID
   */
  async getTenantById(tenantId: string) {
    return this.prisma.tenant.findUnique({
      where: { id: tenantId },
    });
  }

  /**
   * Obter usuário admin ativo do tenant
   */
  async getActiveAdminUser(tenantId: string) {
    return this.prisma.user.findFirst({
      where: { tenantId, isActive: true },
    });
  }

  /**
   * Contar usuários ativos do tenant
   */
  async countActiveUsers(tenantId: string): Promise<number> {
    return this.prisma.user.count({
      where: { tenantId, deletedAt: null, isActive: true },
    });
  }

  /**
   * Cancelar assinatura (atualizar status)
   */
  async cancelSubscription(tenantId: string) {
    return this.prisma.subscription.update({
      where: { tenantId },
      data: {
        status: SubStatus.CANCELED,
        canceledAt: new Date(),
      },
    });
  }

  /**
   * Reativar assinatura
   */
  async reactivateSubscription(tenantId: string, expiresAt: Date) {
    return this.prisma.subscription.update({
      where: { tenantId },
      data: {
        status: SubStatus.ACTIVE,
        canceledAt: null,
        expiresAt,
        renewedAt: new Date(),
      },
      include: { plan: true },
    });
  }

  /**
   * Atualizar plano da assinatura
   */
  async upgradePlan(tenantId: string, newPlanId: string, expiresAt: Date) {
    return this.prisma.subscription.update({
      where: { tenantId },
      data: {
        planId: newPlanId,
        expiresAt,
        renewedAt: new Date(),
      },
      include: { plan: true },
    });
  }

  /**
   * Registrar histórico de assinatura
   */
  async recordHistory(data: {
    tenantId: string;
    subscriptionId: string;
    action: SubscriptionAction;
    previousPlanId?: string | null;
    previousPlanName?: string | null;
    previousPlanPrice?: number | null;
    previousExpiresAt?: Date | null;
    newPlanId?: string | null;
    newPlanName?: string | null;
    newPlanPrice?: number | null;
    newExpiresAt?: Date | null;
    reason?: string;
    triggeredBy?: string;
  }) {
    return this.prisma.subscriptionHistory.create({ data });
  }
}
