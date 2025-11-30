import { Injectable, Logger } from '@nestjs/common';
import { TemplateRenderService } from '@/notifications/services/template-render.service';
import { EmailRepository } from '@/email/repositories/email.repository';

/**
 * Welcome Email Service
 *
 * Responsabilidades:
 * - Enviar emails de boas-vindas
 * - Enviar confirmação de email
 * - Enviar onboarding sequence
 *
 * Princípio: Single Responsibility - APENAS emails de boas-vindas
 */
@Injectable()
export class WelcomeEmailService {
  private readonly logger = new Logger(WelcomeEmailService.name);

  constructor(
    private readonly templateRenderService: TemplateRenderService,
    private readonly emailRepository: EmailRepository,
  ) {}

  /**
   * Enviar email de boas-vindas após signup
   */
  async sendWelcomeEmail(options: {
    to: string;
    userName: string;
    email: string;
    password: string;
    planName: string;
    loginUrl: string;
    companyName?: string;
    tenantId?: string;
  }): Promise<void> {
    try {
      const isCompany = !!options.companyName && !!options.tenantId;

      const html = isCompany
        ? this.templateRenderService.renderWelcomeCompany({
            userName: options.userName,
            companyName: options.companyName!,
            tenantId: options.tenantId!,
            email: options.email,
            password: options.password,
            planName: options.planName,
            loginUrl: options.loginUrl,
          })
        : this.templateRenderService.renderWelcome({
            userName: options.userName,
            email: options.email,
            password: options.password,
            planName: options.planName,
            loginUrl: options.loginUrl,
          });

      const subject = isCompany
        ? `🏢 Bem-vindo ao TalentLoop, ${options.companyName}! 🎉`
        : 'Bem-vindo ao TalentLoop! 🎉';

      await this.emailRepository.send({
        to: options.to,
        subject,
        html,
      });

      this.logger.log(
        `Welcome email sent to ${options.to} (${isCompany ? 'company' : 'candidate'})`,
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Failed to send welcome email to ${options.to}: ${message}`,
      );
      throw error;
    }
  }

  /**
   * Enviar email de confirmação
   */
  async sendConfirmationEmail(options: {
    to: string;
    firstName: string;
    confirmationUrl: string;
  }): Promise<void> {
    try {
      const html = this.templateRenderService.render('email-confirmation', {
        firstName: options.firstName,
        confirmationUrl: options.confirmationUrl,
      });

      await this.emailRepository.send({
        to: options.to,
        subject: 'Confirme seu email - sass-multitenant',
        html,
      });

      this.logger.log(`Confirmation email sent to ${options.to}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Failed to send confirmation email to ${options.to}: ${message}`,
      );
      throw error;
    }
  }
}
