import { Injectable, Logger } from '@nestjs/common';
import { TemplateRenderService } from '@/notifications/services/template-render.service';
import { EmailRepository } from '@/email/repositories/email.repository';

/**
 * Password Email Service
 *
 * Responsabilidades:
 * - Enviar email de "esqueci a senha"
 * - Enviar email de reset de senha
 *
 * Princípio: Single Responsibility - APENAS emails de recuperação de senha
 */
@Injectable()
export class PasswordEmailService {
  private readonly logger = new Logger(PasswordEmailService.name);

  constructor(
    private readonly templateRenderService: TemplateRenderService,
    private readonly emailRepository: EmailRepository,
  ) {}

  /**
   * Enviar email para reset de senha
   */
  async sendPasswordResetEmail(options: {
    to: string;
    userName: string;
    resetLink: string;
    expiryMinutes: number;
  }): Promise<void> {
    try {
      const html = await this.templateRenderService.renderPasswordReset({
        userName: options.userName,
        resetLink: options.resetLink,
        expiryMinutes: options.expiryMinutes,
      });

      await this.emailRepository.send({
        to: options.to,
        subject: 'Redefina sua senha - sass-multitenant',
        html,
      });

      this.logger.log(`Password reset email sent to ${options.to}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Failed to send password reset email to ${options.to}: ${message}`,
      );
      throw error;
    }
  }
}
