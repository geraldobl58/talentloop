import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '@/libs/prisma/prisma.service';
import { StripeService } from '@/stripe/services/stripe.service';
import { EmailService } from '@/email/services/email.service';
import { PlanUpgradeDto } from './dto/plan-upgrade.dto';
import {
  PlanInfoDto,
  PlanUpgradeResponseDto,
  PlanCancelResponseDto,
} from './dto/plan-response.dto';
import {
  SubscriptionHistoryDto,
  SubscriptionHistoryEventDto,
  SubscriptionActionEnum,
  PlanHistoryDetailDto,
} from './dto/subscription-history.dto';
import { SubStatus, SubscriptionAction } from '@prisma/client';

@Injectable()
export class PlansService {
  private readonly logger = new Logger(PlansService.name);

  constructor(
    private prisma: PrismaService,
    private stripeService: StripeService,
    private emailService: EmailService,
  ) {}

  async getCurrentPlan(tenantId: string): Promise<PlanInfoDto> {
    const subscription = await this.prisma.subscription.findUnique({
      where: { tenantId },
      include: {
        plan: true,
      },
    });

    if (!subscription) {
      throw new NotFoundException('Plano não encontrado para este tenant');
    }

    return this.mapToPlanInfoDto(subscription.plan, subscription);
  }

  async upgradePlan(
    tenantId: string,
    dto: PlanUpgradeDto,
  ): Promise<PlanUpgradeResponseDto> {
    this.logger.log(`[upgradePlan] Iniciando upgrade para tenant ${tenantId}`, {
      dto,
    });

    // Buscar assinatura atual
    const currentSubscription = await this.prisma.subscription.findUnique({
      where: { tenantId },
      include: { plan: true },
    });

    if (!currentSubscription) {
      throw new NotFoundException('Assinatura não encontrada');
    }

    let newPlan;

    this.logger.log(
      `[upgradePlan] stripePriceId: ${dto.stripePriceId}, newPlan: ${dto.newPlan}`,
    );

    // Determinar se é upgrade via Stripe ou método tradicional
    if (dto.stripePriceId) {
      // Upgrade via Stripe
      this.logger.log(
        `[upgradePlan] Usando upgrade via Stripe com priceId: ${dto.stripePriceId}`,
      );
      return this.upgradeSubscription(tenantId, dto.stripePriceId);
    } else if (dto.newPlan) {
      // Método tradicional
      // Verificar se o novo plano é superior ao atual
      const currentPlanLevel = this.getPlanLevel(currentSubscription.plan.name);
      const newPlanLevel = this.getPlanLevel(dto.newPlan);

      if (newPlanLevel <= currentPlanLevel) {
        throw new BadRequestException(
          'O novo plano deve ser superior ao plano atual',
        );
      }

      // Buscar o novo plano
      newPlan = await this.prisma.plan.findUnique({
        where: { name: dto.newPlan },
      });

      if (!newPlan) {
        throw new NotFoundException('Plano não encontrado');
      }

      // Calcular nova data de expiração (manter o tempo restante + 30 dias)
      const now = new Date();
      const currentExpiresAt = currentSubscription.expiresAt || now;
      const timeRemaining = currentExpiresAt.getTime() - now.getTime();
      const newExpiresAt = new Date(
        now.getTime() + timeRemaining + 30 * 24 * 60 * 60 * 1000,
      );

      // Atualizar assinatura
      const updatedSubscription = await this.prisma.subscription.update({
        where: { tenantId },
        data: {
          planId: newPlan.id,
          expiresAt: newExpiresAt,
          renewedAt: now,
        },
        include: { plan: true },
      });

      // Registrar no histórico
      const action =
        newPlanLevel > currentPlanLevel
          ? SubscriptionAction.UPGRADED
          : SubscriptionAction.DOWNGRADED;

      await this.recordSubscriptionHistory(
        tenantId,
        action,
        currentSubscription.plan.id,
        currentSubscription.plan.name,
        currentSubscription.plan.price,
        newPlan.id,
        newPlan.name,
        newPlan.price,
        'Upgrade/Downgrade manual do plano',
        'user',
      );

      return {
        success: true,
        message: `Plano atualizado para ${newPlan.name} com sucesso`,
        newPlan: this.mapToPlanInfoDto(newPlan, updatedSubscription),
        nextBillingDate: newExpiresAt.toISOString(),
      };
    } else {
      this.logger.error(
        `[upgradePlan] Nenhum stripePriceId ou newPlan fornecido`,
        {
          stripePriceId: dto.stripePriceId,
          newPlan: dto.newPlan,
        },
      );
      throw new BadRequestException('Especifique newPlan ou stripePriceId');
    }
  }

  async cancelPlan(tenantId: string): Promise<PlanCancelResponseDto> {
    // Buscar assinatura atual
    const subscription = await this.prisma.subscription.findUnique({
      where: { tenantId },
      include: { plan: true },
    });

    if (!subscription) {
      throw new NotFoundException('Assinatura não encontrada');
    }

    if (subscription.status === SubStatus.CANCELED) {
      throw new BadRequestException('Assinatura já está cancelada');
    }

    // Cancelar no Stripe se existir stripeSubscriptionId
    if (subscription.stripeSubscriptionId) {
      try {
        await this.stripeService.cancelSubscription(
          subscription.stripeSubscriptionId,
        );
      } catch (error) {
        // Log do erro, mas não falha se o Stripe retornar erro
        this.logger.error('Erro ao cancelar assinatura no Stripe:', {
          error: error.message,
          subscriptionId: subscription.stripeSubscriptionId,
          tenantId,
        });
      }
    }

    // Cancelar assinatura no banco local
    await this.prisma.subscription.update({
      where: { tenantId },
      data: {
        status: SubStatus.CANCELED,
        canceledAt: new Date(),
      },
    });

    // Registrar no histórico
    await this.recordSubscriptionHistory(
      tenantId,
      SubscriptionAction.CANCELED,
      subscription.plan.id,
      subscription.plan.name,
      subscription.plan.price,
      undefined,
      undefined,
      undefined,
      'Cancelamento manual do plano',
      'user',
    );

    // Enviar email de cancelamento (não bloqueia se falhar)
    try {
      const tenant = await this.prisma.tenant.findUnique({
        where: { id: tenantId },
      });

      const adminUser = await this.prisma.user.findFirst({
        where: { tenantId, isActive: true },
      });

      if (tenant && adminUser) {
        this.logger.log(`[cancelPlan] Enviando email de cancelamento`, {
          tenantId,
          email: adminUser.email,
        });

        // Enviar email de cancelamento
        const expirationDate =
          subscription.expiresAt?.toISOString() ?? new Date().toISOString();
        await this.emailService
          .sendCancellationEmail({
            companyName: tenant.name,
            contactName: adminUser.name,
            contactEmail: adminUser.email,
            planName: subscription.plan.name || 'Plano',
            expirationDate,
          })
          .catch((error) => {
            this.logger.error(
              `[cancelPlan] Erro ao enviar email de cancelamento`,
              {
                error: error.message,
                tenantId,
                email: adminUser.email,
              },
            );
          });
      }
    } catch (error) {
      this.logger.error(`[cancelPlan] Erro ao preparar dados do email`, {
        error: error.message,
        tenantId,
      });
    }

    return {
      success: true,
      message: 'Plano cancelado com sucesso',
    };
  }

  async reactivateSubscription(
    tenantId: string,
  ): Promise<PlanUpgradeResponseDto> {
    // Buscar assinatura atual
    const subscription = await this.prisma.subscription.findUnique({
      where: { tenantId },
      include: { plan: true },
    });

    if (!subscription) {
      throw new NotFoundException('Assinatura não encontrada');
    }

    if (subscription.status !== SubStatus.CANCELED) {
      throw new BadRequestException(
        'Apenas assinaturas canceladas podem ser reativadas',
      );
    }

    // Nota: Para reativar no Stripe, seria necessário criar uma nova assinatura
    // Por enquanto, apenas reativamos no banco local
    // Se houver integração com Stripe, isso precisaria ser implementado

    // Reativar no banco de dados
    const now = new Date();
    const newExpiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 dias

    const reactivatedSubscription = await this.prisma.subscription.update({
      where: { tenantId },
      data: {
        status: SubStatus.ACTIVE,
        canceledAt: null,
        expiresAt: newExpiresAt,
        renewedAt: now,
      },
      include: { plan: true },
    });

    // Registrar no histórico
    await this.recordSubscriptionHistory(
      tenantId,
      SubscriptionAction.REACTIVATED,
      subscription.plan.id,
      subscription.plan.name,
      subscription.plan.price,
      subscription.plan.id,
      subscription.plan.name,
      subscription.plan.price,
      'Reativação manual da assinatura',
      'user',
    );

    return {
      success: true,
      message: `Plano ${subscription.plan.name} reativado com sucesso`,
      newPlan: this.mapToPlanInfoDto(
        reactivatedSubscription.plan,
        reactivatedSubscription,
      ),
      nextBillingDate: newExpiresAt.toISOString(),
    };
  }
  private async recordSubscriptionHistory(
    tenantId: string,
    action: SubscriptionAction,
    previousPlanId?: string,
    previousPlanName?: string,
    previousPlanPrice?: number,
    newPlanId?: string,
    newPlanName?: string,
    newPlanPrice?: number,
    reason?: string,
    triggeredBy: string = 'system',
  ): Promise<void> {
    try {
      const subscription = await this.prisma.subscription.findUnique({
        where: { tenantId },
      });

      if (!subscription) {
        return;
      }

      // Buscar datas de expiração se existirem
      const [prevPlan, newPlan] = await Promise.all([
        previousPlanId
          ? this.prisma.plan.findUnique({
              where: { id: previousPlanId },
            })
          : null,
        newPlanId
          ? this.prisma.plan.findUnique({
              where: { id: newPlanId },
            })
          : null,
      ]);

      await this.prisma.subscriptionHistory.create({
        data: {
          tenantId,
          subscriptionId: subscription.id,
          action,
          previousPlanId: previousPlanId || null,
          previousPlanName: previousPlanName || prevPlan?.name || null,
          previousPlanPrice: previousPlanPrice || prevPlan?.price || null,
          previousExpiresAt: subscription.expiresAt,
          newPlanId: newPlanId || null,
          newPlanName: newPlanName || newPlan?.name || null,
          newPlanPrice: newPlanPrice || newPlan?.price || null,
          newExpiresAt: subscription.expiresAt,
          reason,
          triggeredBy,
        },
      });

      this.logger.log(`[recordSubscriptionHistory] Histórico registrado`, {
        tenantId,
        action,
        reason,
      });
    } catch (error) {
      this.logger.error(
        `[recordSubscriptionHistory] Erro ao registrar histórico`,
        {
          error: error instanceof Error ? error.message : String(error),
          tenantId,
          action,
        },
      );
      // Não falha o fluxo se o histórico não for registrado
    }
  }

  /**
   * Retorna o histórico completo de assinatura
   */
  async getPlanHistory(tenantId: string): Promise<SubscriptionHistoryDto> {
    const subscription = await this.prisma.subscription.findUnique({
      where: { tenantId },
      include: {
        plan: true,
        history: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!subscription) {
      throw new NotFoundException('Assinatura não encontrada');
    }

    const now = new Date();
    const expiresAt = subscription.expiresAt || now;
    const isExpired = expiresAt < now;

    // Determinar status
    let currentStatus: 'ACTIVE' | 'CANCELED' | 'EXPIRED';
    if (subscription.status === SubStatus.CANCELED) {
      currentStatus = 'CANCELED';
    } else if (isExpired) {
      currentStatus = 'EXPIRED';
    } else {
      currentStatus = 'ACTIVE';
    }

    // Calcular estatísticas
    const upgrades = subscription.history.filter(
      (h) => h.action === 'UPGRADED',
    ).length;
    const downgrades = subscription.history.filter(
      (h) => h.action === 'DOWNGRADED',
    ).length;
    const cancellations = subscription.history.filter(
      (h) => h.action === 'CANCELED',
    ).length;

    const daysSinceCreation = Math.floor(
      (now.getTime() - subscription.startedAt.getTime()) /
        (1000 * 60 * 60 * 24),
    );
    const daysUntilExpiry =
      expiresAt > now
        ? Math.floor(
            (expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
          )
        : undefined;

    // Mapear eventos
    const events: SubscriptionHistoryEventDto[] = subscription.history.map(
      (history) => ({
        id: history.id,
        action: history.action as SubscriptionActionEnum,
        previousPlanName: history.previousPlanName || undefined,
        previousPlanPrice: history.previousPlanPrice || undefined,
        newPlanName: history.newPlanName || undefined,
        newPlanPrice: history.newPlanPrice || undefined,
        reason: history.reason || undefined,
        notes: history.notes || undefined,
        triggeredBy: history.triggeredBy || undefined,
        createdAt: history.createdAt.toISOString(),
      }),
    );

    return {
      currentStatus,
      currentPlan: subscription.plan.name,
      currentPlanPrice: subscription.plan.price,
      currentExpiresAt: expiresAt.toISOString(),
      startedAt: subscription.startedAt.toISOString(),
      events,
      summary: {
        totalUpgrades: upgrades,
        totalDowngrades: downgrades,
        totalCancellations: cancellations,
        daysSinceCreation,
        daysUntilExpiry,
      },
    };
  }

  /**
   * Retorna histórico em formato detalhado (para timeline visual)
   */
  async getPlanHistoryDetailed(
    tenantId: string,
  ): Promise<PlanHistoryDetailDto[]> {
    const subscription = await this.prisma.subscription.findUnique({
      where: { tenantId },
      include: {
        history: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!subscription) {
      throw new NotFoundException('Assinatura não encontrada');
    }

    const details: PlanHistoryDetailDto[] = [];

    for (const history of subscription.history) {
      const actionDescriptions: Record<string, string> = {
        CREATED: `Assinatura criada no plano ${history.newPlanName}`,
        UPGRADED: `Upgrade de ${history.previousPlanName} para ${history.newPlanName}`,
        DOWNGRADED: `Downgrade de ${history.previousPlanName} para ${history.newPlanName}`,
        RENEWED: `Renovação do plano ${history.newPlanName}`,
        CANCELED: `Plano ${history.previousPlanName} cancelado`,
        REACTIVATED: `Assinatura reativada no plano ${history.newPlanName}`,
        EXPIRED: `Plano ${history.previousPlanName} expirou`,
      };

      const description =
        actionDescriptions[history.action] || 'Ação desconhecida';

      details.push({
        id: history.id,
        timestamp: history.createdAt.toISOString(),
        action: history.action,
        previousPlan: history.previousPlanName || null,
        currentPlan: history.newPlanName || null,
        description,
        reason: history.reason || undefined,
        triggeredBy: history.triggeredBy || undefined,
      });
    }

    return details;
  }

  private mapToPlanInfoDto(plan: any, subscription: any): PlanInfoDto {
    const now = new Date();
    const expiresAt = subscription.expiresAt || now;
    const isExpired = expiresAt < now;

    let status: 'ACTIVE' | 'EXPIRED' | 'CANCELLED';
    if (subscription.status === SubStatus.CANCELED) {
      status = 'CANCELLED';
    } else if (isExpired) {
      status = 'EXPIRED';
    } else {
      status = 'ACTIVE';
    }

    return {
      id: plan.id,
      name: plan.name,
      price: plan.price,
      currency: plan.currency,
      maxUsers: plan.maxUsers,
      maxContacts: plan.maxContacts,
      hasAPI: plan.hasAPI,
      description: plan.description,
      planExpiresAt: expiresAt.toISOString(),
      createdAt: subscription.startedAt.toISOString(),
      status,
    };
  }

  private getPlanLevel(planName: string): number {
    const levels: Record<string, number> = {
      STARTER: 1,
      PROFESSIONAL: 2,
      ENTERPRISE: 3,
    };
    return levels[planName] || 0;
  }

  // ===== NOVOS MÉTODOS PARA INTEGRAÇÃO COM STRIPE =====

  async getAllPlans() {
    return await this.prisma.plan.findMany({
      orderBy: { price: 'asc' },
    });
  }

  async createCheckoutSession(
    tenantId: string,
    priceId: string,
    successUrl: string,
    cancelUrl: string,
  ) {
    // Buscar o plano pelo priceId
    const plan = await this.prisma.plan.findFirst({
      where: { stripePriceId: priceId },
    });

    if (!plan) {
      throw new NotFoundException('Plano não encontrado');
    }

    // Verificar se já existe uma subscription ativa
    const existingSubscription = await this.prisma.subscription.findUnique({
      where: { tenantId },
      include: { tenant: true },
    });

    if (existingSubscription?.status === SubStatus.ACTIVE) {
      throw new BadRequestException(
        'Já existe uma assinatura ativa para este tenant',
      );
    }

    let customerId: string;

    if (existingSubscription?.stripeCustomerId) {
      customerId = existingSubscription.stripeCustomerId;
    } else {
      // Buscar dados do tenant para criar o customer
      const tenant = await this.prisma.tenant.findUnique({
        where: { id: tenantId },
      });

      if (!tenant) {
        throw new NotFoundException('Tenant não encontrado');
      }

      const adminUser = await this.prisma.user.findFirst({
        where: { tenantId, isActive: true },
      });
      if (!adminUser) {
        throw new NotFoundException('Usuário administrador não encontrado');
      }

      const customer = await this.stripeService.createCustomer({
        email: adminUser.email,
        name: tenant.name,
        tenantId,
      });

      customerId = customer.id;
    }

    return await this.stripeService.createCheckoutSession(
      priceId,
      customerId,
      successUrl,
      cancelUrl,
    );
  }

  async getSubscriptionLimits(tenantId: string) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { tenantId },
      include: { plan: true },
    });

    if (!subscription) {
      throw new NotFoundException('Assinatura não encontrada');
    }

    return {
      maxUsers: subscription.plan.maxUsers,
      maxContacts: subscription.plan.maxContacts,
      hasAPI: subscription.plan.hasAPI,
    };
  }

  async checkUsageLimits(tenantId: string) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { tenantId },
      include: { plan: true },
    });

    if (!subscription) {
      throw new NotFoundException('Assinatura não encontrada');
    }

    const limits = subscription.plan;

    return {
      contacts: {
        limit: limits.maxContacts,
      },
      api: {
        enabled: limits.hasAPI,
      },
    };
  }

  async upgradeSubscription(
    tenantId: string,
    newPriceId: string,
  ): Promise<PlanUpgradeResponseDto> {
    const subscription = await this.prisma.subscription.findUnique({
      where: { tenantId },
      include: { plan: true },
    });

    if (!subscription) {
      throw new NotFoundException('Assinatura não encontrada');
    }

    // Buscar o novo plano
    const newPlan = await this.prisma.plan.findFirst({
      where: { stripePriceId: newPriceId },
    });

    if (!newPlan) {
      throw new NotFoundException('Novo plano não encontrado');
    }

    // Validar se é realmente um upgrade
    const currentPlanLevel = this.getPlanLevel(subscription.plan.name);
    const newPlanLevel = this.getPlanLevel(newPlan.name);

    if (newPlanLevel <= currentPlanLevel) {
      throw new BadRequestException('O novo plano deve ser superior ao atual');
    }

    // Atualizar no Stripe se existir stripeSubscriptionId
    if (subscription.stripeSubscriptionId) {
      try {
        await this.stripeService.updateSubscription(
          subscription.stripeSubscriptionId,
          newPriceId,
        );
      } catch (error) {
        throw new BadRequestException(
          `Erro ao atualizar assinatura no Stripe: ${error.message}`,
        );
      }
    }

    // Atualizar no banco de dados
    const now = new Date();
    const newExpiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 dias para novo período

    const updatedSubscription = await this.prisma.subscription.update({
      where: { tenantId },
      data: {
        planId: newPlan.id,
        renewedAt: now,
        expiresAt: newExpiresAt,
      },
      include: { plan: true },
    });

    // Registrar no histórico
    await this.recordSubscriptionHistory(
      tenantId,
      SubscriptionAction.UPGRADED,
      subscription.plan.id,
      subscription.plan.name,
      subscription.plan.price,
      newPlan.id,
      newPlan.name,
      newPlan.price,
      'Upgrade via Stripe',
      'stripe',
    );

    // Buscar dados para enviar email
    try {
      const tenant = await this.prisma.tenant.findUnique({
        where: { id: tenantId },
      });

      const adminUser = await this.prisma.user.findFirst({
        where: { tenantId, isActive: true },
      });

      if (tenant && adminUser) {
        this.logger.log(`[upgradeSubscription] Enviando email de upgrade`, {
          tenantId,
          oldPlan: subscription.plan.name,
          newPlan: newPlan.name,
          email: adminUser.email,
        });

        // Enviar email de upgrade (não bloqueia se falhar)
        await this.emailService
          .sendUpgradeEmail({
            companyName: tenant.name,
            contactName: adminUser.name,
            contactEmail: adminUser.email,
            oldPlanName: subscription.plan.name,
            newPlanName: newPlan.name,
            newPlanPrice: newPlan.price,
            currency: newPlan.currency,
            newMaxUsers: newPlan.maxUsers || 0,
            newMaxContacts: newPlan.maxContacts || 0,
            hasAPI: newPlan.hasAPI,
          })
          .catch((error) => {
            // Log error but don't fail the upgrade
            this.logger.error(
              `[upgradeSubscription] Erro ao enviar email de upgrade`,
              {
                error: error.message,
                tenantId,
                email: adminUser.email,
              },
            );
          });
      }
    } catch (error) {
      // Log silencioso se falhar na busca de dados
      this.logger.error(
        `[upgradeSubscription] Erro ao preparar dados do email`,
        {
          error: error.message,
          tenantId,
        },
      );
    }

    return {
      success: true,
      message: `Plano atualizado para ${newPlan.name} com sucesso`,
      newPlan: this.mapToPlanInfoDto(newPlan, updatedSubscription),
      nextBillingDate: updatedSubscription.expiresAt?.toISOString() || '',
    };
  }

  async validateSubscription(tenantId: string): Promise<boolean> {
    const subscription = await this.prisma.subscription.findUnique({
      where: { tenantId },
    });

    if (!subscription) {
      return false;
    }

    // Verificar se está ativa e não expirada
    const now = new Date();
    const isActive = subscription.status === SubStatus.ACTIVE;
    const isNotExpired =
      !subscription.expiresAt || subscription.expiresAt > now;

    return isActive && isNotExpired;
  }

  async createBillingPortalSession(
    tenantId: string,
    returnUrl: string,
  ): Promise<string> {
    const subscription = await this.prisma.subscription.findUnique({
      where: { tenantId },
    });

    if (!subscription) {
      throw new NotFoundException('Assinatura não encontrada');
    }

    if (!subscription.stripeCustomerId) {
      throw new BadRequestException(
        'Customer Stripe não encontrado para este tenant',
      );
    }

    return await this.stripeService.createBillingPortalSession(
      subscription.stripeCustomerId,
      returnUrl,
    );
  }

  async getCurrentCompany(tenantId: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      select: {
        id: true,
        name: true,
        slug: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!tenant) {
      throw new NotFoundException('Empresa não encontrada');
    }

    return {
      id: tenant.id,
      name: tenant.name,
      tenantId: tenant.slug,
      domain: `${tenant.slug}.sass-multitenant.com`,
      createdAt: tenant.createdAt.toISOString(),
      updatedAt: tenant.updatedAt.toISOString(),
    };
  }

  async getPlanUsage(tenantId: string) {
    // Buscar estatísticas atuais do tenant
    const userCount = await this.prisma.user.count({
      where: { tenantId, deletedAt: null, isActive: true },
    });

    // Buscar limites do plano atual
    const subscription = await this.prisma.subscription.findUnique({
      where: { tenantId },
      include: { plan: true },
    });

    if (!subscription) {
      throw new NotFoundException('Plano não encontrado');
    }

    return {
      currentUsers: userCount,
      maxUsers: subscription.plan.maxUsers || 0,
    };
  }
}
