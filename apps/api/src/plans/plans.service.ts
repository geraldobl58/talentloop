import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PlanRepository } from './repositories/plan.repository';
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
import {
  SubStatus,
  SubscriptionAction,
  Plan,
  Subscription,
} from '@prisma/client';

type SubscriptionWithPlan = Subscription & { plan: Plan };

@Injectable()
export class PlansService {
  private readonly logger = new Logger(PlansService.name);

  constructor(
    private readonly planRepository: PlanRepository,
    private readonly stripeService: StripeService,
    private readonly emailService: EmailService,
  ) {}

  async getCurrentPlan(tenantId: string): Promise<PlanInfoDto> {
    const subscription =
      await this.planRepository.getCurrentSubscription(tenantId);

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

    const currentSubscription =
      await this.planRepository.getCurrentSubscription(tenantId);

    if (!currentSubscription) {
      throw new NotFoundException('Assinatura não encontrada');
    }

    this.logger.log(
      `[upgradePlan] stripePriceId: ${dto.stripePriceId}, newPlan: ${dto.newPlan}`,
    );

    // Upgrade via Stripe
    if (dto.stripePriceId) {
      this.logger.log(
        `[upgradePlan] Usando upgrade via Stripe com priceId: ${dto.stripePriceId}`,
      );
      return this.upgradeSubscription(tenantId, dto.stripePriceId);
    }

    // Upgrade tradicional
    if (dto.newPlan) {
      const currentPlanLevel = this.getPlanLevel(currentSubscription.plan.name);
      const newPlanLevel = this.getPlanLevel(dto.newPlan);

      if (newPlanLevel <= currentPlanLevel) {
        throw new BadRequestException(
          'O novo plano deve ser superior ao plano atual',
        );
      }

      const newPlan = await this.planRepository.findPlanByName(dto.newPlan);

      if (!newPlan) {
        throw new NotFoundException('Plano não encontrado');
      }

      // Calcular nova data de expiração
      const now = new Date();
      const currentExpiresAt = currentSubscription.expiresAt || now;
      const timeRemaining = currentExpiresAt.getTime() - now.getTime();
      const newExpiresAt = new Date(
        now.getTime() + timeRemaining + 30 * 24 * 60 * 60 * 1000,
      );

      const updatedSubscription = await this.planRepository.upgradePlan(
        tenantId,
        newPlan.id,
        newExpiresAt,
      );

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
    }

    this.logger.error(
      `[upgradePlan] Nenhum stripePriceId ou newPlan fornecido`,
      { stripePriceId: dto.stripePriceId, newPlan: dto.newPlan },
    );
    throw new BadRequestException('Especifique newPlan ou stripePriceId');
  }

  async cancelPlan(tenantId: string): Promise<PlanCancelResponseDto> {
    const subscription =
      await this.planRepository.getCurrentSubscription(tenantId);

    if (!subscription) {
      throw new NotFoundException('Assinatura não encontrada');
    }

    if (subscription.status === SubStatus.CANCELED) {
      throw new BadRequestException('Assinatura já está cancelada');
    }

    // Cancelar no Stripe se existir
    if (subscription.stripeSubscriptionId) {
      try {
        await this.stripeService.cancelSubscription(
          subscription.stripeSubscriptionId,
        );
      } catch (error) {
        this.logger.error('Erro ao cancelar assinatura no Stripe:', {
          error: (error as Error).message,
          subscriptionId: subscription.stripeSubscriptionId,
          tenantId,
        });
      }
    }

    // Cancelar no banco local
    await this.planRepository.cancelSubscription(tenantId);

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

    // Enviar email de cancelamento
    await this.sendCancellationEmail(tenantId, subscription);

    return {
      success: true,
      message: 'Plano cancelado com sucesso',
    };
  }

  async reactivateSubscription(
    tenantId: string,
  ): Promise<PlanUpgradeResponseDto> {
    const subscription =
      await this.planRepository.getCurrentSubscription(tenantId);

    if (!subscription) {
      throw new NotFoundException('Assinatura não encontrada');
    }

    if (subscription.status !== SubStatus.CANCELED) {
      throw new BadRequestException(
        'Apenas assinaturas canceladas podem ser reativadas',
      );
    }

    const newExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    const reactivatedSubscription =
      await this.planRepository.reactivateSubscription(tenantId, newExpiresAt);

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

    // Enviar email de reativação
    await this.sendReactivationEmail(tenantId, subscription.plan);

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

  async getPlanHistory(tenantId: string): Promise<SubscriptionHistoryDto> {
    const subscription =
      await this.planRepository.getSubscriptionWithHistory(tenantId);

    if (!subscription) {
      throw new NotFoundException('Assinatura não encontrada');
    }

    const now = new Date();
    const expiresAt = subscription.expiresAt || now;
    const isExpired = expiresAt < now;

    let currentStatus: 'ACTIVE' | 'CANCELED' | 'EXPIRED';
    if (subscription.status === SubStatus.CANCELED) {
      currentStatus = 'CANCELED';
    } else if (isExpired) {
      currentStatus = 'EXPIRED';
    } else {
      currentStatus = 'ACTIVE';
    }

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

  async getPlanHistoryDetailed(
    tenantId: string,
  ): Promise<PlanHistoryDetailDto[]> {
    const subscription =
      await this.planRepository.getSubscriptionWithHistory(tenantId);

    if (!subscription) {
      throw new NotFoundException('Assinatura não encontrada');
    }

    return subscription.history.map((history) => {
      const actionDescriptions: Record<string, string> = {
        CREATED: `Assinatura criada no plano ${history.newPlanName}`,
        UPGRADED: `Upgrade de ${history.previousPlanName} para ${history.newPlanName}`,
        DOWNGRADED: `Downgrade de ${history.previousPlanName} para ${history.newPlanName}`,
        RENEWED: `Renovação do plano ${history.newPlanName}`,
        CANCELED: `Plano ${history.previousPlanName} cancelado`,
        REACTIVATED: `Assinatura reativada no plano ${history.newPlanName}`,
        EXPIRED: `Plano ${history.previousPlanName} expirou`,
      };

      return {
        id: history.id,
        timestamp: history.createdAt.toISOString(),
        action: history.action,
        previousPlan: history.previousPlanName || null,
        currentPlan: history.newPlanName || null,
        description: actionDescriptions[history.action] || 'Ação desconhecida',
        reason: history.reason || undefined,
        triggeredBy: history.triggeredBy || undefined,
      };
    });
  }

  async getAllPlans(tenantType?: 'CANDIDATE' | 'COMPANY') {
    const plans = await this.planRepository.getAllPlans();

    if (!tenantType) {
      return plans;
    }

    const candidatePlans = ['FREE', 'PRO', 'PREMIUM'];
    const companyPlans = ['STARTUP', 'BUSINESS', 'ENTERPRISE'];

    const filteredPlans = plans.filter((plan) => {
      if (tenantType === 'CANDIDATE') {
        return candidatePlans.includes(plan.name);
      }
      return companyPlans.includes(plan.name);
    });

    return filteredPlans.map((plan) => ({
      ...plan,
      features: this.getPlanFeatures(plan.name, tenantType),
    }));
  }

  async createCheckoutSession(
    tenantId: string,
    priceId: string,
    successUrl: string,
    cancelUrl: string,
  ) {
    const plan = await this.planRepository.findPlanByStripePriceId(priceId);

    if (!plan) {
      throw new NotFoundException('Plano não encontrado');
    }

    const existingSubscription =
      await this.planRepository.getCurrentSubscription(tenantId);

    // Check if user has an active PAID subscription (not FREE)
    // FREE plans (price = 0) don't count as paid subscriptions
    const isFreePlan = existingSubscription?.plan?.price === 0;
    const hasActivePaidSubscription =
      existingSubscription?.status === SubStatus.ACTIVE &&
      !isFreePlan &&
      existingSubscription?.stripeSubscriptionId;

    if (hasActivePaidSubscription) {
      throw new BadRequestException(
        'Já existe uma assinatura paga ativa para este tenant. Use o portal de cobrança para gerenciar.',
      );
    }

    let customerId: string;

    if (existingSubscription?.stripeCustomerId) {
      customerId = existingSubscription.stripeCustomerId;
    } else {
      const tenant = await this.planRepository.getTenantById(tenantId);

      if (!tenant) {
        throw new NotFoundException('Tenant não encontrado');
      }

      const adminUser = await this.planRepository.getActiveAdminUser(tenantId);
      if (!adminUser) {
        throw new NotFoundException('Usuário administrador não encontrado');
      }

      const customer = await this.stripeService.createCustomer({
        email: adminUser.email,
        name: tenant.name,
        tenantId,
      });

      customerId = customer.id;

      // Save the stripeCustomerId on the existing subscription
      if (existingSubscription) {
        await this.planRepository.updateSubscription(tenantId, {
          stripeCustomerId: customerId,
        });
      }
    }

    return await this.stripeService.createCheckoutSession(
      priceId,
      customerId,
      successUrl,
      cancelUrl,
    );
  }

  /**
   * Verify a checkout session and sync subscription status
   * This is an alternative to webhooks for local development
   */
  async verifyAndSyncCheckout(
    tenantId: string,
    sessionId: string,
  ): Promise<{ success: boolean; message: string; plan?: string }> {
    this.logger.log('Verifying checkout session', { tenantId, sessionId });

    try {
      // Get checkout session from Stripe
      const session = await this.stripeService.getCheckoutSession(sessionId);

      this.logger.log('Checkout session retrieved', {
        status: session.status,
        paymentStatus: session.payment_status,
        subscriptionId:
          typeof session.subscription === 'string'
            ? session.subscription
            : session.subscription?.id,
      });

      // Check if payment was successful
      if (session.status !== 'complete' || session.payment_status !== 'paid') {
        return {
          success: false,
          message: 'Pagamento não foi concluído',
        };
      }

      // Get the subscription from the session
      const stripeSubscription = session.subscription;
      const stripeSubscriptionId =
        typeof stripeSubscription === 'string'
          ? stripeSubscription
          : stripeSubscription?.id;

      if (!stripeSubscriptionId) {
        return {
          success: false,
          message: 'Subscription não encontrada na sessão',
        };
      }

      // Get price ID from the session
      const lineItems =
        await this.stripeService.getCheckoutSessionLineItems(sessionId);
      const priceId = lineItems?.data?.[0]?.price?.id;

      if (!priceId) {
        return {
          success: false,
          message: 'Price ID não encontrado',
        };
      }

      // Find the plan by stripe price ID
      const plan = await this.planRepository.findPlanByStripePriceId(priceId);

      if (!plan) {
        return {
          success: false,
          message: 'Plano não encontrado para este price ID',
        };
      }

      // Get existing subscription
      const existingSubscription =
        await this.planRepository.getCurrentSubscription(tenantId);

      if (!existingSubscription) {
        return {
          success: false,
          message: 'Subscription não encontrada para este tenant',
        };
      }

      // Calculate expiration date
      const expiresAt =
        plan.billingPeriodDays > 0
          ? new Date(Date.now() + plan.billingPeriodDays * 24 * 60 * 60 * 1000)
          : null;

      // Get customer ID
      const customerId =
        typeof session.customer === 'string'
          ? session.customer
          : session.customer?.id;

      // Update the subscription
      await this.planRepository.updateSubscription(tenantId, {
        planId: plan.id,
        stripeSubscriptionId,
        stripeCustomerId: customerId,
        status: SubStatus.ACTIVE,
        startedAt: new Date(),
        expiresAt,
      });

      // Log the upgrade action
      await this.planRepository.recordHistory({
        tenantId,
        subscriptionId: existingSubscription.id,
        action: SubscriptionAction.UPGRADED,
        previousPlanId: existingSubscription.planId,
        previousPlanName: existingSubscription.plan?.name,
        newPlanId: plan.id,
        newPlanName: plan.name,
        reason: `Checkout session: ${sessionId}`,
        triggeredBy: 'verify-checkout',
      });

      // Send upgrade email notification
      if (existingSubscription.plan) {
        await this.sendUpgradeEmail(tenantId, existingSubscription.plan, plan);
      }

      this.logger.log('✅ Subscription synced successfully', {
        tenantId,
        newPlan: plan.name,
        stripeSubscriptionId,
      });

      return {
        success: true,
        message: `Plano atualizado para ${plan.name} com sucesso!`,
        plan: plan.name,
      };
    } catch (error) {
      this.logger.error('Error verifying checkout', error);
      return {
        success: false,
        message:
          error instanceof Error ? error.message : 'Erro ao verificar checkout',
      };
    }
  }

  async getSubscriptionLimits(tenantId: string) {
    const subscription =
      await this.planRepository.getCurrentSubscription(tenantId);

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
    const subscription =
      await this.planRepository.getCurrentSubscription(tenantId);

    if (!subscription) {
      throw new NotFoundException('Assinatura não encontrada');
    }

    return {
      contacts: { limit: subscription.plan.maxContacts },
      api: { enabled: subscription.plan.hasAPI },
    };
  }

  async upgradeSubscription(
    tenantId: string,
    newPriceId: string,
  ): Promise<PlanUpgradeResponseDto> {
    const subscription =
      await this.planRepository.getCurrentSubscription(tenantId);

    if (!subscription) {
      throw new NotFoundException('Assinatura não encontrada');
    }

    const newPlan =
      await this.planRepository.findPlanByStripePriceId(newPriceId);

    if (!newPlan) {
      throw new NotFoundException('Novo plano não encontrado');
    }

    const currentPlanLevel = this.getPlanLevel(subscription.plan.name);
    const newPlanLevel = this.getPlanLevel(newPlan.name);

    if (newPlanLevel <= currentPlanLevel) {
      throw new BadRequestException('O novo plano deve ser superior ao atual');
    }

    if (subscription.stripeSubscriptionId) {
      try {
        await this.stripeService.updateSubscription(
          subscription.stripeSubscriptionId,
          newPriceId,
        );
      } catch (error) {
        throw new BadRequestException(
          `Erro ao atualizar assinatura no Stripe: ${(error as Error).message}`,
        );
      }
    }

    const newExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    const updatedSubscription = await this.planRepository.upgradePlan(
      tenantId,
      newPlan.id,
      newExpiresAt,
    );

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

    await this.sendUpgradeEmail(tenantId, subscription.plan, newPlan);

    return {
      success: true,
      message: `Plano atualizado para ${newPlan.name} com sucesso`,
      newPlan: this.mapToPlanInfoDto(newPlan, updatedSubscription),
      nextBillingDate: updatedSubscription.expiresAt?.toISOString() || '',
    };
  }

  async validateSubscription(tenantId: string): Promise<boolean> {
    const subscription =
      await this.planRepository.getCurrentSubscription(tenantId);

    if (!subscription) {
      return false;
    }

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
    const subscription =
      await this.planRepository.getCurrentSubscription(tenantId);

    if (!subscription) {
      throw new NotFoundException('Assinatura não encontrada');
    }

    if (!subscription.stripeCustomerId) {
      throw new BadRequestException(
        'Portal de pagamento não disponível. Entre em contato com o suporte.',
      );
    }

    try {
      return await this.stripeService.createBillingPortalSession(
        subscription.stripeCustomerId,
        returnUrl,
      );
    } catch (error) {
      // Handle Stripe customer not found error
      if (
        error?.type === 'StripeInvalidRequestError' ||
        error?.code === 'resource_missing' ||
        error?.message?.includes('No such customer')
      ) {
        throw new BadRequestException(
          'Portal de pagamento não disponível. O cadastro de pagamento não foi encontrado.',
        );
      }
      throw error;
    }
  }

  async getCurrentCompany(tenantId: string) {
    const tenant = await this.planRepository.getTenantById(tenantId);

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
    const [userCount, subscription] = await Promise.all([
      this.planRepository.countActiveUsers(tenantId),
      this.planRepository.getCurrentSubscription(tenantId),
    ]);

    if (!subscription) {
      throw new NotFoundException('Plano não encontrado');
    }

    return {
      currentUsers: userCount,
      maxUsers: subscription.plan.maxUsers || 0,
    };
  }

  // ===== MÉTODOS PRIVADOS =====

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
      const subscription =
        await this.planRepository.getCurrentSubscription(tenantId);

      if (!subscription) {
        return;
      }

      await this.planRepository.recordHistory({
        tenantId,
        subscriptionId: subscription.id,
        action,
        previousPlanId: previousPlanId || null,
        previousPlanName: previousPlanName || null,
        previousPlanPrice: previousPlanPrice || null,
        previousExpiresAt: subscription.expiresAt,
        newPlanId: newPlanId || null,
        newPlanName: newPlanName || null,
        newPlanPrice: newPlanPrice || null,
        newExpiresAt: subscription.expiresAt,
        reason,
        triggeredBy,
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
    }
  }

  private async sendCancellationEmail(
    tenantId: string,
    subscription: SubscriptionWithPlan,
  ): Promise<void> {
    try {
      const [tenant, adminUser] = await Promise.all([
        this.planRepository.getTenantById(tenantId),
        this.planRepository.getActiveAdminUser(tenantId),
      ]);

      if (tenant && adminUser) {
        this.logger.log(`[cancelPlan] Enviando email de cancelamento`, {
          tenantId,
          email: adminUser.email,
        });

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
                error: (error as Error).message,
                tenantId,
                email: adminUser.email,
              },
            );
          });
      }
    } catch (error) {
      this.logger.error(`[cancelPlan] Erro ao preparar dados do email`, {
        error: error instanceof Error ? error.message : String(error),
        tenantId,
      });
    }
  }

  private async sendUpgradeEmail(
    tenantId: string,
    oldPlan: Plan,
    newPlan: Plan,
  ): Promise<void> {
    try {
      const [tenant, adminUser] = await Promise.all([
        this.planRepository.getTenantById(tenantId),
        this.planRepository.getActiveAdminUser(tenantId),
      ]);

      if (tenant && adminUser) {
        this.logger.log(`[upgradeSubscription] Enviando email de upgrade`, {
          tenantId,
          oldPlan: oldPlan.name,
          newPlan: newPlan.name,
          email: adminUser.email,
        });

        await this.emailService
          .sendUpgradeEmail({
            companyName: tenant.name,
            contactName: adminUser.name,
            contactEmail: adminUser.email,
            oldPlanName: oldPlan.name,
            newPlanName: newPlan.name,
            newPlanPrice: newPlan.price,
            currency: newPlan.currency,
            newMaxUsers: newPlan.maxUsers || 0,
            newMaxContacts: newPlan.maxContacts || 0,
            hasAPI: newPlan.hasAPI,
          })
          .catch((error) => {
            this.logger.error(
              `[upgradeSubscription] Erro ao enviar email de upgrade`,
              {
                error: (error as Error).message,
                tenantId,
                email: adminUser.email,
              },
            );
          });
      }
    } catch (error) {
      this.logger.error(
        `[upgradeSubscription] Erro ao preparar dados do email`,
        {
          error: error instanceof Error ? error.message : String(error),
          tenantId,
        },
      );
    }
  }

  private async sendReactivationEmail(
    tenantId: string,
    plan: Plan,
  ): Promise<void> {
    try {
      const [tenant, adminUser] = await Promise.all([
        this.planRepository.getTenantById(tenantId),
        this.planRepository.getActiveAdminUser(tenantId),
      ]);

      if (tenant && adminUser) {
        this.logger.log(
          `[reactivateSubscription] Enviando email de reativação`,
          {
            tenantId,
            plan: plan.name,
            email: adminUser.email,
          },
        );

        // Use the upgrade email template with same plan (reactivation)
        await this.emailService
          .sendUpgradeEmail({
            companyName: tenant.name,
            contactName: adminUser.name,
            contactEmail: adminUser.email,
            oldPlanName: `${plan.name} (Cancelado)`,
            newPlanName: `${plan.name} (Reativado)`,
            newPlanPrice: plan.price,
            currency: plan.currency,
            newMaxUsers: plan.maxUsers || 0,
            newMaxContacts: plan.maxContacts || 0,
            hasAPI: plan.hasAPI,
          })
          .catch((error) => {
            this.logger.error(
              `[reactivateSubscription] Erro ao enviar email de reativação`,
              {
                error: (error as Error).message,
                tenantId,
                email: adminUser.email,
              },
            );
          });
      }
    } catch (error) {
      this.logger.error(
        `[reactivateSubscription] Erro ao preparar dados do email`,
        {
          error: error instanceof Error ? error.message : String(error),
          tenantId,
        },
      );
    }
  }

  private mapToPlanInfoDto(
    plan: Plan,
    subscription: Subscription,
  ): PlanInfoDto {
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
      maxUsers: plan.maxUsers ?? undefined,
      maxContacts: plan.maxContacts ?? undefined,
      hasAPI: plan.hasAPI,
      description: plan.description ?? '',
      planExpiresAt: expiresAt.toISOString(),
      createdAt: subscription.startedAt.toISOString(),
      status,
    };
  }

  private getPlanLevel(planName: string): number {
    const levels: Record<string, number> = {
      // Candidate plans
      FREE: 0,
      PRO: 1,
      PREMIUM: 2,
      // Company plans (no free plan for companies)
      STARTUP: 1,
      BUSINESS: 2,
      ENTERPRISE: 3,
    };
    return levels[planName] || 0;
  }

  private getPlanFeatures(
    planName: string,
    tenantType: 'CANDIDATE' | 'COMPANY',
  ): string[] {
    if (tenantType === 'CANDIDATE') {
      const candidateFeatures: Record<string, string[]> = {
        FREE: [
          '100 vagas visíveis por dia',
          '10 candidaturas manuais por dia',
          'AI Matching básico',
          '1 carta de apresentação IA/mês',
          'Email de vagas diário',
        ],
        PRO: [
          'Vagas ilimitadas',
          '50 candidaturas por dia',
          '10 AutoApply por dia',
          'AI Matching detalhado',
          '20 cartas de apresentação IA/mês',
          '5 adaptações de CV por IA/mês',
          'CRM de Recrutadores (50 contatos)',
          'Push notifications em tempo real',
          'Relatórios completos',
          'Suporte por email',
        ],
        PREMIUM: [
          'Tudo do plano Pro',
          'Candidaturas ilimitadas',
          '30 AutoApply por dia',
          'AI Matching + Sugestões personalizadas',
          'Cartas de apresentação ilimitadas',
          'Adaptações de CV ilimitadas',
          'CRM de Recrutadores ilimitado',
          'Push + WhatsApp notifications',
          'Relatórios + Exportação',
          'Suporte prioritário',
        ],
      };
      return candidateFeatures[planName] || [];
    }

    const companyFeatures: Record<string, string[]> = {
      STARTUP: [
        '5 vagas ativas',
        '2 recrutadores',
        '100 candidaturas recebidas/mês',
        'Filtros básicos',
        'ATS básico integrado',
        'Suporte por email',
      ],
      BUSINESS: [
        '20 vagas ativas',
        '10 recrutadores',
        '500 candidaturas/mês',
        'Acesso ao banco de CVs (busca)',
        'Filtros avançados completos',
        'ATS completo integrado',
        'Analytics de vagas',
        'Página da empresa (Employer Branding)',
        'Suporte por chat',
        'SLA 99.5%',
      ],
      ENTERPRISE: [
        'Vagas ilimitadas',
        'Recrutadores ilimitados',
        'Candidaturas ilimitadas',
        'Banco de CVs completo + Export',
        'Filtros avançados + IA',
        'ATS customizado',
        'Analytics + API',
        'Página + Destaques',
        'API de integração',
        'Suporte dedicado',
        'SLA 99.9%',
      ],
    };
    return companyFeatures[planName] || [];
  }
}
