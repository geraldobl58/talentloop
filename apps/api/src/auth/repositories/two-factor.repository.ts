import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/libs/prisma/prisma.service';

/**
 * Two Factor Repository
 *
 * Responsabilidades:
 * - Acesso a dados relacionados ao 2FA
 * - Queries específicas para two-factor authentication
 *
 * Princípio: Single Responsibility - APENAS data access para 2FA
 */
@Injectable()
export class TwoFactorRepository {
  private readonly logger = new Logger(TwoFactorRepository.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Obter dados de 2FA do usuário
   */
  async getTwoFactorData(userId: string): Promise<{
    id: string;
    email: string;
    name: string | null;
    twoFactorEnabled: boolean;
    twoFactorSecret: string | null;
    twoFactorBackupCodes: string[];
  } | null> {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        twoFactorEnabled: true,
        twoFactorSecret: true,
        twoFactorBackupCodes: true,
      },
    });
  }

  /**
   * Salvar secret temporário (antes de ativar 2FA)
   */
  async saveTwoFactorSecret(userId: string, secret: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { twoFactorSecret: secret },
    });
  }

  /**
   * Ativar 2FA com backup codes
   */
  async enableTwoFactor(userId: string, backupCodes: string[]): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        twoFactorEnabled: true,
        twoFactorBackupCodes: backupCodes,
      },
    });
  }

  /**
   * Desativar 2FA
   */
  async disableTwoFactor(userId: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        twoFactorEnabled: false,
        twoFactorSecret: null,
        twoFactorBackupCodes: [],
      },
    });
  }

  /**
   * Atualizar backup codes
   */
  async updateBackupCodes(
    userId: string,
    backupCodes: string[],
  ): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { twoFactorBackupCodes: backupCodes },
    });
  }

  /**
   * Remover um backup code usado
   */
  async removeUsedBackupCode(
    userId: string,
    usedCode: string,
    currentCodes: string[],
  ): Promise<void> {
    const updatedCodes = currentCodes.filter((code) => code !== usedCode);
    await this.updateBackupCodes(userId, updatedCodes);
  }

  /**
   * Verificar se 2FA está ativo
   */
  async isTwoFactorEnabled(userId: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { twoFactorEnabled: true },
    });
    return user?.twoFactorEnabled ?? false;
  }
}
