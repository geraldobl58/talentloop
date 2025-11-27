import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/libs/prisma/prisma.service';
import { Subscription, Plan } from '@prisma/client';

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
}
