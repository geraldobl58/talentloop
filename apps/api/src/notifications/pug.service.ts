import { Injectable } from '@nestjs/common';
import { TemplateRenderService } from '@/notifications/services/template-render.service';

export interface NotificationData {
  [key: string]: any;
}

/**
 * PugService (Backward Compatibility)
 *
 * Este serviço mantém a API anterior enquanto delega para a nova arquitetura.
 * Será deprecado em futuras versões.
 *
 * Use: TemplateRenderService
 */
@Injectable()
export class PugService {
  constructor(private readonly templateRender: TemplateRenderService) {}

  /**
   * Render a template with data
   */
  render(templateName: string, data: NotificationData = {}): string {
    return this.templateRender.render(templateName, data);
  }

  /**
   * Render welcome email
   */
  renderWelcome(data: {
    userName: string;
    email: string;
    password: string;
    planName: string;
    loginUrl: string;
  }): string {
    return this.templateRender.renderWelcome(data);
  }

  /**
   * Render password reset email
   */
  renderPasswordReset(data: {
    userName: string;
    resetLink: string;
    expiryMinutes: number;
  }): string {
    return this.templateRender.renderPasswordReset(data);
  }

  /**
   * Render limit alert email
   */
  renderLimitAlert(data: {
    userName: string;
    currentUsage: number;
    limit: number;
    usagePercentage: number;
    upgradeUrl: string;
  }): string {
    return this.templateRender.renderLimitAlert(data);
  }

  /**
   * Render cancellation email
   */
  renderCancellation(data: {
    userName: string;
    planName: string;
    cancellationDate: string;
    dataExportUrl: string;
  }): string {
    return this.templateRender.renderCancellation(data);
  }

  /**
   * Render upgrade confirmation email
   */
  renderUpgrade(data: {
    userName: string;
    oldPlan: string;
    newPlan: string;
    newPrice: string;
    billingDate: string;
    dashboardUrl: string;
  }): string {
    return this.templateRender.renderUpgrade(data);
  }

  /**
   * Clear template cache (useful for development or after template updates)
   */
  clearCache(): void {
    this.templateRender.clearCache();
  }
}
