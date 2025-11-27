import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';
import { APP_CONSTANTS } from '@/libs/common/constants';

/**
 * Email Repository
 *
 * Responsabilidades:
 * - Configuração SMTP
 * - Envio de emails via nodemailer
 * - Validação de configuração
 *
 * Princípio: Single Responsibility - APENAS envio de emails
 */
@Injectable()
export class EmailRepository {
  private readonly logger = new Logger(EmailRepository.name);
  private transporter: nodemailer.Transporter;

  constructor(private readonly configService: ConfigService) {
    this.transporter = this.setupTransporter();
    this.validateConfiguration();
  }

  /**
   * Configurar transporter SMTP
   */
  private setupTransporter(): nodemailer.Transporter {
    const mailConfig = {
      host: this.configService.get(
        'MAIL_HOST',
        APP_CONSTANTS.EMAIL.DEFAULT_HOST,
      ),
      port: parseInt(
        this.configService.get(
          'MAIL_PORT',
          `${APP_CONSTANTS.EMAIL.DEFAULT_PORT}`,
        ),
      ),
      secure: false,
      auth: {
        user: this.configService.get('MAIL_USER'),
        pass: this.configService.get('MAIL_PASS'),
      },
      connectionTimeout: APP_CONSTANTS.EMAIL.CONNECTION_TIMEOUT_MS,
      greetingTimeout: APP_CONSTANTS.EMAIL.GREETING_TIMEOUT_MS,
      socketTimeout: APP_CONSTANTS.EMAIL.SOCKET_TIMEOUT_MS,
      pool: true,
      maxConnections: APP_CONSTANTS.EMAIL.MAX_CONNECTIONS,
      maxMessages: APP_CONSTANTS.EMAIL.MAX_MESSAGES,
      requireTLS: false,
      tls: {
        rejectUnauthorized: false,
      },
    };

    return nodemailer.createTransport(mailConfig);
  }

  /**
   * Validar configuração de email
   */
  private validateConfiguration() {
    const mailUser = this.configService.get('MAIL_USER');
    const mailPass = this.configService.get('MAIL_PASS');

    if (!mailUser || !mailPass) {
      this.logger.warn('⚠️ Email configuration is incomplete');
    }
  }

  /**
   * Enviar email
   */
  async send(options: {
    to: string;
    subject: string;
    html: string;
  }): Promise<void> {
    try {
      const fromEmail = this.configService.get(
        'MAIL_FROM',
        APP_CONSTANTS.EMAIL.DEFAULT_FROM,
      );

      await this.transporter.sendMail({
        from: fromEmail,
        to: options.to,
        subject: options.subject,
        html: options.html,
      });

      this.logger.log(`Email sent to ${options.to}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to send email to ${options.to}: ${message}`);
      throw error;
    }
  }

  /**
   * Enviar múltiplos emails em paralelo
   */
  async sendBatch(
    options: Array<{
      to: string;
      subject: string;
      html: string;
    }>,
  ): Promise<void> {
    await Promise.all(options.map((opt) => this.send(opt)));
  }

  /**
   * Verificar conexão SMTP
   */
  async verifyConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      this.logger.log('✅ SMTP connection verified');
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`SMTP connection failed: ${message}`);
      return false;
    }
  }
}
