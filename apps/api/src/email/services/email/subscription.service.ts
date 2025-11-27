import { Injectable, Logger } from '@nestjs/common';
import { TemplateRenderService } from '@/notifications/services/template-render.service';
import { EmailRepository } from '@/email/repositories/email.repository';

/**
 * Subscription Email Service
 *
 * Responsabilidades:
 * - Enviar emails sobre upgrade de plano
 * - Enviar confirmações de mudança de plano
 * - Enviar emails sobre cancelamento de plano
 *
 * Princípio: Single Responsibility - APENAS emails de planos/assinatura
 */
@Injectable()
export class SubscriptionEmailService {
  private readonly logger = new Logger(SubscriptionEmailService.name);

  constructor(
    private readonly templateRenderService: TemplateRenderService,
    private readonly emailRepository: EmailRepository,
  ) {}

  /**
   * Enviar email de upgrade de plano
   */
  async sendUpgradeEmail(options: {
    to: string;
    userName: string;
    oldPlan: string;
    newPlan: string;
    newPrice: string;
    billingDate: string;
    dashboardUrl: string;
  }): Promise<void> {
    try {
      const html = this.templateRenderService.renderUpgrade({
        userName: options.userName,
        oldPlan: options.oldPlan,
        newPlan: options.newPlan,
        newPrice: options.newPrice,
        billingDate: options.billingDate,
        dashboardUrl: options.dashboardUrl,
      });

      await this.emailRepository.send({
        to: options.to,
        subject: `Bem-vindo ao plano ${options.newPlan}! 🚀 - sass-multitenant`,
        html,
      });

      this.logger.log(`Upgrade email sent to ${options.to}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Failed to send upgrade email to ${options.to}: ${message}`,
      );
      throw error;
    }
  }

  /**
   * Enviar email de cancelamento de plano
   */
  async sendCancellationEmail(options: {
    to: string;
    userName: string;
    planName: string;
    cancellationDate: string;
    dataExportUrl: string;
  }): Promise<void> {
    try {
      const html = this.templateRenderService.renderCancellation({
        userName: options.userName,
        planName: options.planName,
        cancellationDate: options.cancellationDate,
        dataExportUrl: options.dataExportUrl,
      });

      await this.emailRepository.send({
        to: options.to,
        subject: 'Sua assinatura foi cancelada - sass-multitenant',
        html,
      });

      this.logger.log(`Cancellation email sent to ${options.to}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Failed to send cancellation email to ${options.to}: ${message}`,
      );
      throw error;
    }
  }
}
