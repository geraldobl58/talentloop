import { Injectable, OnModuleInit } from '@nestjs/common';
import { TemplateRepository } from '../repositories/template.repository';

export interface NotificationData {
  [key: string]: any;
}

/**
 * Template Render Service
 *
 * Responsabilidades:
 * - Renderização de templates com dados
 * - Métodos específicos para cada tipo de email
 * - Validação de dados de entrada
 *
 * Princípio: Single Responsibility - APENAS renderização de templates
 */
@Injectable()
export class TemplateRenderService implements OnModuleInit {
  private readonly TEMPLATES_TO_PRELOAD = [
    'welcome',
    'password-reset',
    'limit-alert',
    'cancellation',
    'upgrade',
    '2fa-enabled',
    '2fa-disabled',
  ];

  constructor(private readonly templateRepository: TemplateRepository) {}

  onModuleInit() {
    this.templateRepository.preloadTemplates(this.TEMPLATES_TO_PRELOAD);
  }

  /**
   * Renderizar template genérico
   */
  render(templateName: string, data: NotificationData = {}): string {
    try {
      const compiled =
        this.templateRepository.getCompiledTemplate(templateName);
      return compiled(data);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to render template ${templateName}: ${message}`);
    }
  }

  /**
   * Renderizar email de boas-vindas
   */
  renderWelcome(data: {
    userName: string;
    email: string;
    password: string;
    planName: string;
    loginUrl: string;
  }): string {
    return this.render('welcome', data);
  }

  /**
   * Renderizar email de reset de senha
   */
  renderPasswordReset(data: {
    userName: string;
    resetLink: string;
    expiryMinutes: number;
  }): string {
    return this.render('password-reset', data);
  }

  /**
   * Renderizar alerta de limite
   */
  renderLimitAlert(data: {
    userName: string;
    currentUsage: number;
    limit: number;
    usagePercentage: number;
    upgradeUrl: string;
  }): string {
    return this.render('limit-alert', data);
  }

  /**
   * Renderizar email de cancelamento
   */
  renderCancellation(data: {
    userName: string;
    planName: string;
    cancellationDate: string;
    dataExportUrl: string;
  }): string {
    return this.render('cancellation', data);
  }

  /**
   * Renderizar email de upgrade
   */
  renderUpgrade(data: {
    userName: string;
    oldPlan: string;
    newPlan: string;
    newPrice: string;
    billingDate: string;
    dashboardUrl: string;
  }): string {
    return this.render('upgrade', data);
  }

  /**
   * Renderizar email de 2FA ativado
   */
  render2FAEnabled(data: {
    userName: string;
    backupCodesCount: number;
    supportUrl: string;
  }): string {
    return this.render('2fa-enabled', data);
  }

  /**
   * Renderizar email de 2FA desativado
   */
  render2FADisabled(data: { userName: string; disabledAt: string }): string {
    return this.render('2fa-disabled', data);
  }

  /**
   * Limpar cache de templates (dev/reload)
   */
  clearCache(): void {
    this.templateRepository.clearCache();
  }
}
