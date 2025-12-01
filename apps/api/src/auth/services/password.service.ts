import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { hash, compare } from 'bcrypt';
import { randomBytes } from 'crypto';
import { AuthRepository } from '../repositories/auth.repository';
import { EmailService } from '@/email/services/email.service';
import { APP_CONSTANTS, MESSAGES } from '@/libs/common/constants';

/**
 * Password Service
 *
 * Responsabilidades:
 * - Forgot password
 * - Reset password
 * - Change password
 *
 * Princípio: Single Responsibility - APENAS gerenciamento de senhas
 */
@Injectable()
export class PasswordService {
  private readonly logger = new Logger(PasswordService.name);

  constructor(
    private readonly authRepository: AuthRepository,
    private readonly emailService: EmailService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Solicitar reset de senha
   * Detecta automaticamente o tenant pelo email
   */
  async forgotPassword(email: string) {
    // Buscar usuário pelo email (com tenant)
    const user = await this.authRepository.findUserByEmailWithTenant(email);

    if (!user) {
      // Por segurança, não informar se o email existe
      return {
        success: true,
        message:
          'Se o email existir em nossa base, você receberá instruções para redefinir sua senha.',
      };
    }

    // Invalidar tokens anteriores
    await this.authRepository.invalidateUserPasswordResets(user.id);

    // Gerar token único
    const token = randomBytes(
      APP_CONSTANTS.PASSWORD_RESET.TOKEN_LENGTH_BYTES,
    ).toString('hex');

    const expiresAt = new Date();
    expiresAt.setHours(
      expiresAt.getHours() + APP_CONSTANTS.PASSWORD_RESET.TOKEN_EXPIRES_HOURS,
    );

    // Criar registro de reset
    await this.authRepository.createPasswordReset({
      userId: user.id,
      token,
      expiresAt,
    });

    // Enviar email de reset de senha
    const frontendUrl = this.configService.get<string>(
      'FRONTEND_URL',
      'http://localhost:3000',
    );
    const resetLink = `${frontendUrl}/auth/reset-password?token=${token}`;

    try {
      await this.emailService.sendPasswordReset({
        to: user.email,
        userName: user.name,
        resetLink,
        expiryMinutes: APP_CONSTANTS.PASSWORD_RESET.TOKEN_EXPIRES_HOURS * 60,
      });
      this.logger.log(`Password reset email sent to ${user.email}`);
    } catch (error) {
      this.logger.error(`Failed to send password reset email: ${error}`);
      // Não falhar a operação se o email não for enviado
    }

    return {
      success: true,
      message:
        'Se o email existir em nossa base, você receberá instruções para redefinir sua senha.',
    };
  }

  /**
   * Redefinir senha com token
   */
  async resetPassword(token: string, newPassword: string) {
    const resetToken =
      await this.authRepository.findPasswordResetByToken(token);

    if (!resetToken) {
      throw new BadRequestException(MESSAGES.ERRORS.PASSWORD_RESET_NOT_FOUND);
    }

    if (resetToken.usedAt) {
      throw new BadRequestException(MESSAGES.ERRORS.TOKEN_ALREADY_USED);
    }

    if (resetToken.expiresAt < new Date()) {
      throw new BadRequestException(MESSAGES.ERRORS.TOKEN_EXPIRED);
    }

    const hashedPassword = await hash(
      newPassword,
      APP_CONSTANTS.DATABASE.BCRYPT_ROUNDS,
    );

    await this.authRepository.executePasswordReset(
      resetToken.userId,
      hashedPassword,
      resetToken.id,
    );

    return {
      message: MESSAGES.AUTH.PASSWORD_RESET_SUCCESS,
    };
  }

  /**
   * Alterar senha (usuário logado)
   */
  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ) {
    const user = await this.authRepository.findUserById(userId);

    if (!user) {
      throw new NotFoundException(MESSAGES.ERRORS.USER_NOT_FOUND);
    }

    const isPasswordValid = await compare(currentPassword, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException(MESSAGES.AUTH.INVALID_PASSWORD);
    }

    const hashedPassword = await hash(
      newPassword,
      APP_CONSTANTS.DATABASE.BCRYPT_ROUNDS,
    );

    await this.authRepository.updateUser(userId, { password: hashedPassword });

    return {
      message: MESSAGES.AUTH.PASSWORD_CHANGED_SUCCESS,
    };
  }
}
