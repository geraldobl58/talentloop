import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException, NotFoundException } from '@nestjs/common';
import { AuthService } from './services/auth.service';
import { SignInService } from './services/signin.service';
import { PasswordService } from './services/password.service';
import { ProfileService } from './services/profile.service';

describe('AuthService', () => {
  let service: AuthService;
  let signInService: SignInService;
  let passwordService: PasswordService;
  let profileService: ProfileService;

  const mockSignInService = {
    execute: vi.fn(),
    refreshToken: vi.fn(),
  };

  const mockPasswordService = {
    forgotPassword: vi.fn(),
    resetPassword: vi.fn(),
    changePassword: vi.fn(),
  };

  const mockProfileService = {
    getProfile: vi.fn(),
    getProfileWithPlan: vi.fn(),
    uploadAvatar: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: SignInService, useValue: mockSignInService },
        { provide: PasswordService, useValue: mockPasswordService },
        { provide: ProfileService, useValue: mockProfileService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    signInService = module.get<SignInService>(SignInService);
    passwordService = module.get<PasswordService>(PasswordService);
    profileService = module.get<ProfileService>(ProfileService);
  });

  describe('signIn', () => {
    it('should successfully sign in a user without 2FA', async () => {
      const expectedResult = {
        requiresTwoFactor: false,
        access_token: 'mock-jwt-token',
        user: {
          id: 'user-123',
          name: 'Test User',
          email: 'test@example.com',
        },
      };

      mockSignInService.execute.mockResolvedValue(expectedResult);

      const result = await service.signIn(
        'test@example.com',
        'password123',
        'test-company',
      );

      expect(result).toEqual(expectedResult);
      expect(mockSignInService.execute).toHaveBeenCalledWith(
        'test@example.com',
        'password123',
        'test-company',
        undefined,
      );
    });

    it('should throw UnauthorizedException if credentials are invalid', async () => {
      mockSignInService.execute.mockRejectedValue(
        new UnauthorizedException('Credenciais inválidas'),
      );

      await expect(
        service.signIn('test@example.com', 'wrongpassword', 'test-company'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should require 2FA token when enabled', async () => {
      const expectedResult = {
        requiresTwoFactor: true,
        userId: 'user-123',
        message: 'Código de autenticação de dois fatores necessário',
      };

      mockSignInService.execute.mockResolvedValue(expectedResult);

      const result = await service.signIn(
        'test@example.com',
        'password123',
        'test-company',
      );

      expect(result).toEqual(expectedResult);
    });

    it('should verify 2FA token when provided', async () => {
      const expectedResult = {
        requiresTwoFactor: false,
        access_token: 'mock-jwt-token',
        user: {
          id: 'user-123',
          name: 'Test User',
          email: 'test@example.com',
        },
      };

      mockSignInService.execute.mockResolvedValue(expectedResult);

      const result = await service.signIn(
        'test@example.com',
        'password123',
        'test-company',
        '123456',
      );

      expect(result.requiresTwoFactor).toBe(false);
      expect(result.access_token).toBe('mock-jwt-token');
      expect(mockSignInService.execute).toHaveBeenCalledWith(
        'test@example.com',
        'password123',
        'test-company',
        '123456',
      );
    });

    it('should throw UnauthorizedException if 2FA token is invalid', async () => {
      mockSignInService.execute.mockRejectedValue(
        new UnauthorizedException('Código de autenticação inválido'),
      );

      await expect(
        service.signIn(
          'test@example.com',
          'password123',
          'test-company',
          'invalid-token',
        ),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('getUserById', () => {
    it('should return user data', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        avatar: 'https://example.com/avatar.jpg',
        isActive: true,
      };

      mockProfileService.getProfile.mockResolvedValue(mockUser);

      const result = await service.getUserById('user-123');

      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundException if user not found', async () => {
      mockProfileService.getProfile.mockRejectedValue(
        new NotFoundException('Usuário não encontrado'),
      );

      await expect(service.getUserById('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('changePassword', () => {
    it('should change password successfully', async () => {
      const expectedResult = { message: 'Senha alterada com sucesso' };
      mockPasswordService.changePassword.mockResolvedValue(expectedResult);

      const result = await service.changePassword(
        'user-123',
        'oldPassword',
        'newPassword',
      );

      expect(result).toEqual(expectedResult);
      expect(mockPasswordService.changePassword).toHaveBeenCalledWith(
        'user-123',
        'oldPassword',
        'newPassword',
      );
    });

    it('should throw NotFoundException if user not found', async () => {
      mockPasswordService.changePassword.mockRejectedValue(
        new NotFoundException('Usuário não encontrado'),
      );

      await expect(
        service.changePassword('invalid-id', 'oldPassword', 'newPassword'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw UnauthorizedException if current password is wrong', async () => {
      mockPasswordService.changePassword.mockRejectedValue(
        new UnauthorizedException('Senha atual inválida'),
      );

      await expect(
        service.changePassword('user-123', 'wrongPassword', 'newPassword'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('refreshToken', () => {
    it('should generate new token', async () => {
      const expectedResult = { access_token: 'new-jwt-token' };
      mockSignInService.refreshToken.mockResolvedValue(expectedResult);

      const result = await service.refreshToken('user-123');

      expect(result).toEqual(expectedResult);
    });

    it('should throw UnauthorizedException if user is inactive', async () => {
      mockSignInService.refreshToken.mockRejectedValue(
        new UnauthorizedException('Usuário inválido ou inativo'),
      );

      await expect(service.refreshToken('user-123')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('getProfileWithPlan', () => {
    it('should return subscription with plan', async () => {
      const mockSubscription = {
        id: 'sub-123',
        tenantId: 'tenant-123',
        plan: {
          id: 'plan-123',
          name: 'PROFESSIONAL',
          price: 99,
        },
      };

      mockProfileService.getProfileWithPlan.mockResolvedValue(mockSubscription);

      const result = await service.getProfileWithPlan('tenant-123');

      expect(result).toEqual(mockSubscription);
    });
  });

  describe('forgotPassword', () => {
    it('should send password reset email', async () => {
      const expectedResult = {
        message:
          'Se o email existir em nossa base, você receberá instruções para redefinir sua senha.',
      };
      mockPasswordService.forgotPassword.mockResolvedValue(expectedResult);

      const result = await service.forgotPassword(
        'test@example.com',
        'tenant-123',
      );

      expect(result).toEqual(expectedResult);
    });
  });

  describe('resetPassword', () => {
    it('should reset password with valid token', async () => {
      const expectedResult = { message: 'Senha redefinida com sucesso' };
      mockPasswordService.resetPassword.mockResolvedValue(expectedResult);

      const result = await service.resetPassword('valid-token', 'newPassword');

      expect(result).toEqual(expectedResult);
    });
  });

  describe('uploadAvatar', () => {
    it('should upload avatar successfully', async () => {
      const expectedUrl = 'https://cloudinary.com/avatar.jpg';
      mockProfileService.uploadAvatar.mockResolvedValue(expectedUrl);

      const mockFile = { buffer: Buffer.from('test') } as Express.Multer.File;
      const result = await service.uploadAvatar('user-123', mockFile);

      expect(result).toBe(expectedUrl);
    });
  });
});
