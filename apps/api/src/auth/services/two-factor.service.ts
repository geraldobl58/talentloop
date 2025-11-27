import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { authenticator } from 'otplib';
import { toDataURL } from 'qrcode';
import * as crypto from 'crypto';
import { TwoFactorRepository } from '../repositories/two-factor.repository';
import { APP_CONSTANTS, MESSAGES } from '@/libs/common/constants';

/**
 * Two Factor Service
 *
 * Responsabilidades:
 * - Gerar secret e QR code para 2FA
 * - Ativar/desativar 2FA
 * - Verificar tokens TOTP
 * - Gerenciar backup codes
 *
 * Princípio: Single Responsibility - APENAS lógica de 2FA
 */
@Injectable()
export class TwoFactorService {
  constructor(private readonly twoFactorRepository: TwoFactorRepository) {
    authenticator.options = {
      step: APP_CONSTANTS.TWO_FACTOR.TOTP_STEP_SECONDS,
      window: APP_CONSTANTS.TWO_FACTOR.TOTP_WINDOW,
    };
  }

  /**
   * Gera um secret e QR code para ativar 2FA
   */
  async generateTwoFactorSecret(userId: string) {
    const user = await this.twoFactorRepository.getTwoFactorData(userId);

    if (!user) {
      throw new UnauthorizedException(MESSAGES.TWO_FACTOR.USER_NOT_FOUND);
    }

    if (user.twoFactorEnabled) {
      throw new BadRequestException(MESSAGES.TWO_FACTOR.ALREADY_ENABLED);
    }

    const secret = authenticator.generateSecret();
    const otpauth = authenticator.keyuri(
      user.email,
      'sass-multitenant',
      secret,
    );
    const qrCodeDataURL = await toDataURL(otpauth);

    await this.twoFactorRepository.saveTwoFactorSecret(userId, secret);

    return {
      secret,
      qrCode: qrCodeDataURL,
    };
  }

  /**
   * Ativa 2FA após verificar o token
   */
  async enableTwoFactor(userId: string, token: string) {
    const user = await this.twoFactorRepository.getTwoFactorData(userId);

    if (!user) {
      throw new UnauthorizedException(MESSAGES.TWO_FACTOR.USER_NOT_FOUND);
    }

    if (!user.twoFactorSecret) {
      throw new BadRequestException(MESSAGES.TWO_FACTOR.NO_SECRET_GENERATED);
    }

    if (user.twoFactorEnabled) {
      throw new BadRequestException(MESSAGES.TWO_FACTOR.NOT_ENABLED);
    }

    const isValid = authenticator.verify({
      token,
      secret: user.twoFactorSecret,
    });

    if (!isValid) {
      throw new BadRequestException(MESSAGES.TWO_FACTOR.INVALID_TOKEN);
    }

    const backupCodes = this.generateBackupCodes();

    await this.twoFactorRepository.enableTwoFactor(userId, backupCodes);

    return {
      success: true,
      backupCodes,
      message: MESSAGES.TWO_FACTOR.ENABLED_SUCCESS,
    };
  }

  /**
   * Desativa 2FA
   */
  async disableTwoFactor(userId: string, token: string) {
    const user = await this.twoFactorRepository.getTwoFactorData(userId);

    if (!user) {
      throw new UnauthorizedException(MESSAGES.TWO_FACTOR.USER_NOT_FOUND);
    }

    if (!user.twoFactorEnabled) {
      throw new BadRequestException(MESSAGES.TWO_FACTOR.NOT_ENABLED);
    }

    const isValid = authenticator.verify({
      token,
      secret: user.twoFactorSecret!,
    });

    if (!isValid) {
      throw new BadRequestException(MESSAGES.TWO_FACTOR.INVALID_TOKEN);
    }

    await this.twoFactorRepository.disableTwoFactor(userId);

    return {
      success: true,
      message: MESSAGES.TWO_FACTOR.DISABLED_SUCCESS,
    };
  }

  /**
   * Verifica token 2FA durante signin
   */
  async verifyTwoFactorToken(userId: string, token: string): Promise<boolean> {
    const user = await this.twoFactorRepository.getTwoFactorData(userId);

    if (!user || !user.twoFactorEnabled || !user.twoFactorSecret) {
      return false;
    }

    // Verificar se é um backup code
    if (user.twoFactorBackupCodes.includes(token)) {
      await this.twoFactorRepository.removeUsedBackupCode(
        userId,
        token,
        user.twoFactorBackupCodes,
      );
      return true;
    }

    return authenticator.verify({
      token,
      secret: user.twoFactorSecret,
    });
  }

  /**
   * Regenera backup codes
   */
  async regenerateBackupCodes(userId: string, token: string) {
    const user = await this.twoFactorRepository.getTwoFactorData(userId);

    if (!user || !user.twoFactorEnabled) {
      throw new BadRequestException(MESSAGES.TWO_FACTOR.NOT_ENABLED);
    }

    const isValid = authenticator.verify({
      token,
      secret: user.twoFactorSecret!,
    });

    if (!isValid) {
      throw new BadRequestException(MESSAGES.TWO_FACTOR.INVALID_TOKEN);
    }

    const backupCodes = this.generateBackupCodes();

    await this.twoFactorRepository.updateBackupCodes(userId, backupCodes);

    return {
      success: true,
      backupCodes,
      message: MESSAGES.TWO_FACTOR.BACKUP_CODES_REGENERATED,
    };
  }

  /**
   * Verifica se usuário tem 2FA ativo
   */
  async isTwoFactorEnabled(userId: string): Promise<boolean> {
    return this.twoFactorRepository.isTwoFactorEnabled(userId);
  }

  /**
   * Gera códigos de backup
   */
  private generateBackupCodes(
    count: number = APP_CONSTANTS.TWO_FACTOR.BACKUP_CODES_COUNT,
  ): string[] {
    const codes: string[] = [];

    for (let i = 0; i < count; i++) {
      const code = crypto
        .randomBytes(APP_CONSTANTS.TWO_FACTOR.BACKUP_CODE_LENGTH)
        .toString('hex')
        .toUpperCase();
      codes.push(code);
    }

    return codes;
  }
}
