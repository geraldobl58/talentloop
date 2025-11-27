import { Injectable, Logger } from '@nestjs/common';
import { TemplateRenderService } from '@/notifications/services/template-render.service';
import { EmailRepository } from '@/email/repositories/email.repository';

/**
 * Alert Email Service
 *
 * Responsabilidades:
 * - Enviar alertas de limite de uso atingido
 * - Enviar notificações de 2FA ativado/desativado
 * - Enviar alertas de segurança
 *
 * Princípio: Single Responsibility - APENAS emails de alertas
 */
@Injectable()
export class AlertEmailService {
  private readonly logger = new Logger(AlertEmailService.name);

  constructor(
    private readonly templateRenderService: TemplateRenderService,
    private readonly emailRepository: EmailRepository,
  ) {}

  /**
   * Enviar alerta de limite atingido
   */
  async sendLimitAlert(options: {
    to: string;
    userName: string;
    currentUsage: number;
    limit: number;
    usagePercentage: number;
    upgradeUrl: string;
  }): Promise<void> {
    try {
      const html = await this.templateRenderService.renderLimitAlert({
        userName: options.userName,
        currentUsage: options.currentUsage,
        limit: options.limit,
        usagePercentage: options.usagePercentage,
        upgradeUrl: options.upgradeUrl,
      });

      await this.emailRepository.send({
        to: options.to,
        subject: `Atenção: Limite de uso próximo ao máximo - sass-multitenant`,
        html,
      });

      this.logger.log(`Limit alert sent to ${options.to}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Failed to send limit alert to ${options.to}: ${message}`,
      );
      throw error;
    }
  }

  /**
   * Enviar notificação de 2FA ativado
   */
  async send2FAEnabledNotification(options: {
    to: string;
    userName: string;
    backupCodesCount: number;
    supportUrl: string;
  }): Promise<void> {
    try {
      const html = await this.templateRenderService.render2FAEnabled({
        userName: options.userName,
        backupCodesCount: options.backupCodesCount,
        supportUrl: options.supportUrl,
      });

      await this.emailRepository.send({
        to: options.to,
        subject: 'Autenticação de dois fatores ativada - sass-multitenant',
        html,
      });

      this.logger.log(`2FA enabled notification sent to ${options.to}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Failed to send 2FA enabled notification to ${options.to}: ${message}`,
      );
      throw error;
    }
  }

  /**
   * Enviar notificação de 2FA desativado
   */
  async send2FADisabledNotification(options: {
    to: string;
    userName: string;
    disabledAt: string;
  }): Promise<void> {
    try {
      const html = await this.templateRenderService.render2FADisabled({
        userName: options.userName,
        disabledAt: options.disabledAt,
      });

      await this.emailRepository.send({
        to: options.to,
        subject: 'Autenticação de dois fatores desativada - sass-multitenant',
        html,
      });

      this.logger.log(`2FA disabled notification sent to ${options.to}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Failed to send 2FA disabled notification to ${options.to}: ${message}`,
      );
      throw error;
    }
  }
}
