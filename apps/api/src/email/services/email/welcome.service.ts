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
  }): Promise<void> {
    try {
      const html = await this.templateRenderService.renderWelcome({
        userName: options.userName,
        email: options.email,
        password: options.password,
        planName: options.planName,
        loginUrl: options.loginUrl,
      });

      await this.emailRepository.send({
        to: options.to,
        subject: 'Bem-vindo ao sass-multitenant! 🎉',
        html,
      });

      this.logger.log(`Welcome email sent to ${options.to}`);
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
      const html = await this.templateRenderService.render(
        'email-confirmation',
        {
          firstName: options.firstName,
          confirmationUrl: options.confirmationUrl,
        },
      );

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
