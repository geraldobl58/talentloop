import { Injectable, Logger } from '@nestjs/common';
import { WelcomeEmailService } from '@/email/services/email/welcome.service';
import { PasswordEmailService } from '@/email/services/email/password.service';
import { SubscriptionEmailService } from '@/email/services/email/subscription.service';
import { AlertEmailService } from '@/email/services/email/alert.service';
import { BillingEmailService } from '@/email/services/email/billing.service';

/**
 * Email Service (Orchestration)
 *
 * Responsabilidades:
 * - Coordenar envio de emails
 * - Abstrair complexidade de múltiplos serviços
 * - Fornecer interface unificada para emails
 *
 * Princípio: Facade Pattern - Fornece interface simplificada
 * para o cliente (controllers)
 *
 * Este serviço é o orquestrador e deveria ser injetado
 * nos controllers e outros serviços que precisam enviar emails.
 */
@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(
    private readonly welcomeEmailService: WelcomeEmailService,
    private readonly passwordEmailService: PasswordEmailService,
    private readonly subscriptionEmailService: SubscriptionEmailService,
    private readonly alertEmailService: AlertEmailService,
    private readonly billingEmailService: BillingEmailService,
  ) {}

  /**
   * Obter acesso aos serviços internos
   * (se necessário chamar métodos específicos)
   */
  getWelcomeEmailService(): WelcomeEmailService {
    return this.welcomeEmailService;
  }

  getPasswordEmailService(): PasswordEmailService {
    return this.passwordEmailService;
  }

  getSubscriptionEmailService(): SubscriptionEmailService {
    return this.subscriptionEmailService;
  }

  getAlertEmailService(): AlertEmailService {
    return this.alertEmailService;
  }

  getBillingEmailService(): BillingEmailService {
    return this.billingEmailService;
  }

  /**
   * Métodos de conveniência que delegam aos serviços especializados
   */

  async sendWelcome(options: {
    to: string;
    userName: string;
    email: string;
    password: string;
    planName: string;
    loginUrl: string;
    companyName?: string;
    tenantId?: string;
  }): Promise<void> {
    await this.welcomeEmailService.sendWelcomeEmail(options);
  }

  async sendPasswordReset(options: {
    to: string;
    userName: string;
    resetLink: string;
    expiryMinutes: number;
  }): Promise<void> {
    await this.passwordEmailService.sendPasswordResetEmail(options);
  }

  async sendUpgrade(options: {
    to: string;
    userName: string;
    oldPlan: string;
    newPlan: string;
    newPrice: string;
    billingDate: string;
    dashboardUrl: string;
  }): Promise<void> {
    await this.subscriptionEmailService.sendUpgradeEmail(options);
  }

  async sendLimitAlert(options: {
    to: string;
    userName: string;
    currentUsage: number;
    limit: number;
    usagePercentage: number;
    upgradeUrl: string;
  }): Promise<void> {
    await this.alertEmailService.sendLimitAlert(options);
  }

  async sendPaymentReceipt(options: {
    to: string;
    userName: string;
    amount: number;
    currency: string;
    plan: string;
    paymentDate: Date;
    receiptUrl: string;
  }): Promise<void> {
    await this.billingEmailService.sendPaymentReceipt(options);
  }

  /**
   * Enviar email de cancelamento (interface simplificada para PlansService)
   */
  async sendCancellationEmail(options: {
    companyName: string;
    contactName: string;
    contactEmail: string;
    planName: string;
    expirationDate: string;
  }): Promise<void> {
    await this.subscriptionEmailService.sendCancellationEmail({
      to: options.contactEmail,
      userName: options.contactName,
      planName: options.planName,
      cancellationDate: options.expirationDate,
      dataExportUrl: 'https://app.sass-multitenant.com/export',
    });
  }

  /**
   * Enviar email de upgrade (interface simplificada para PlansService)
   */
  async sendUpgradeEmail(options: {
    companyName: string;
    contactName: string;
    contactEmail: string;
    oldPlanName: string;
    newPlanName: string;
    newPlanPrice: number;
    currency: string;
    newMaxUsers: number;
    newMaxContacts: number;
    hasAPI: boolean;
  }): Promise<void> {
    await this.subscriptionEmailService.sendUpgradeEmail({
      to: options.contactEmail,
      userName: options.contactName,
      oldPlan: options.oldPlanName,
      newPlan: options.newPlanName,
      newPrice: `${options.currency} ${options.newPlanPrice}`,
      billingDate: new Date(
        Date.now() + 30 * 24 * 60 * 60 * 1000,
      ).toLocaleDateString('pt-BR'),
      dashboardUrl: 'https://app.sass-multitenant.com/dashboard',
    });
  }
}
