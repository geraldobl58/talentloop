import { Injectable, Logger } from '@nestjs/common';
import { SignInService } from './signin.service';
import { PasswordService } from './password.service';
import { ProfileService } from './profile.service';

/**
 * Auth Service (Orchestrator)
 *
 * Responsabilidades:
 * - Orquestrar operações de autenticação
 * - Delegar para services especializados
 *
 * Princípio: Facade Pattern - interface unificada para módulo de auth
 */
@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly signInService: SignInService,
    private readonly passwordService: PasswordService,
    private readonly profileService: ProfileService,
  ) {}

  // ==================== AUTHENTICATION ====================

  /**
   * Sign in (detecção automática de tipo pelo email)
   */
  async signIn(email: string, password: string, twoFactorToken?: string) {
    return this.signInService.execute(email, password, twoFactorToken);
  }

  /**
   * Refresh token
   */
  async refreshToken(userId: string) {
    return this.signInService.refreshToken(userId);
  }

  // ==================== PASSWORD ====================

  /**
   * Forgot password (detecção automática de tenant pelo email)
   */
  async forgotPassword(email: string) {
    return this.passwordService.forgotPassword(email);
  }

  /**
   * Reset password
   */
  async resetPassword(token: string, newPassword: string) {
    return this.passwordService.resetPassword(token, newPassword);
  }

  /**
   * Change password
   */
  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ) {
    return this.passwordService.changePassword(
      userId,
      currentPassword,
      newPassword,
    );
  }

  // ==================== PROFILE ====================

  /**
   * Get user by ID
   */
  async getUserById(userId: string) {
    return this.profileService.getProfile(userId);
  }

  /**
   * Get profile with plan
   */
  async getProfileWithPlan(tenantId: string) {
    return this.profileService.getProfileWithPlan(tenantId);
  }

  /**
   * Upload avatar
   */
  async uploadAvatar(userId: string, file: Express.Multer.File) {
    return this.profileService.uploadAvatar(userId, file);
  }
}
