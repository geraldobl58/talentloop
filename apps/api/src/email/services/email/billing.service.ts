import { Injectable, Logger } from '@nestjs/common';
import { TemplateRenderService } from '@/notifications/services/template-render.service';
import { EmailRepository } from '@/email/repositories/email.repository';

/**
 * Billing Email Service
 *
 * Responsabilidades:
 * - Enviar recibos de pagamento
 * - Enviar notificações de fatura
 * - Enviar lembretes de renovação
 * - Enviar confirmações de reembolso
 *
 * Princípio: Single Responsibility - APENAS emails de cobrança/faturamento
 */
@Injectable()
export class BillingEmailService {
  private readonly logger = new Logger(BillingEmailService.name);

  constructor(
    private readonly templateRenderService: TemplateRenderService,
    private readonly emailRepository: EmailRepository,
  ) {}

  /**
   * Enviar recibo de pagamento usando template genérico
   */
  async sendPaymentReceipt(options: {
    to: string;
    userName: string;
    amount: number;
    currency: string;
    plan: string;
    paymentDate: Date;
    receiptUrl: string;
  }): Promise<void> {
    try {
      const html = this.templateRenderService.render('payment-receipt', {
        userName: options.userName,
        amount: options.amount.toFixed(2),
        currency: options.currency,
        plan: options.plan,
        paymentDate: options.paymentDate.toLocaleDateString('pt-BR'),
        receiptUrl: options.receiptUrl,
      });

      await this.emailRepository.send({
        to: options.to,
        subject: `Recibo de pagamento - ${options.plan} - sass-multitenant`,
        html,
      });

      this.logger.log(`Payment receipt sent to ${options.to}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Failed to send payment receipt to ${options.to}: ${message}`,
      );
      throw error;
    }
  }

  /**
   * Enviar notificação de fatura
   */
  async sendInvoiceNotification(options: {
    to: string;
    userName: string;
    invoiceNumber: string;
    amount: number;
    dueDate: Date;
    invoiceUrl: string;
  }): Promise<void> {
    try {
      const html = this.templateRenderService.render('invoice-notice', {
        userName: options.userName,
        invoiceNumber: options.invoiceNumber,
        amount: options.amount.toFixed(2),
        dueDate: options.dueDate.toLocaleDateString('pt-BR'),
        invoiceUrl: options.invoiceUrl,
      });

      await this.emailRepository.send({
        to: options.to,
        subject: `Fatura ${options.invoiceNumber} - sass-multitenant`,
        html,
      });

      this.logger.log(`Invoice notification sent to ${options.to}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Failed to send invoice notification to ${options.to}: ${message}`,
      );
      throw error;
    }
  }

  /**
   * Enviar lembrete de renovação
   */
  async sendRenewalReminder(options: {
    to: string;
    userName: string;
    plan: string;
    renewalDate: Date;
    amount: number;
  }): Promise<void> {
    try {
      const html = this.templateRenderService.render('renewal-reminder', {
        userName: options.userName,
        plan: options.plan,
        renewalDate: options.renewalDate.toLocaleDateString('pt-BR'),
        amount: options.amount.toFixed(2),
      });

      await this.emailRepository.send({
        to: options.to,
        subject: `Seu plano ${options.plan} será renovado - sass-multitenant`,
        html,
      });

      this.logger.log(`Renewal reminder sent to ${options.to}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Failed to send renewal reminder to ${options.to}: ${message}`,
      );
      throw error;
    }
  }

  /**
   * Enviar confirmação de reembolso
   */
  async sendRefundConfirmation(options: {
    to: string;
    userName: string;
    amount: number;
    reason: string;
    refundDate: Date;
  }): Promise<void> {
    try {
      const html = this.templateRenderService.render('refund-confirmation', {
        userName: options.userName,
        amount: options.amount.toFixed(2),
        reason: options.reason,
        refundDate: options.refundDate.toLocaleDateString('pt-BR'),
      });

      await this.emailRepository.send({
        to: options.to,
        subject: `Reembolso processado - sass-multitenant`,
        html,
      });

      this.logger.log(`Refund confirmation sent to ${options.to}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Failed to send refund confirmation to ${options.to}: ${message}`,
      );
      throw error;
    }
  }
}
