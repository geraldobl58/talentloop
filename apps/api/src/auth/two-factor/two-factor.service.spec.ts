import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { TwoFactorService } from '../services/two-factor.service';
import { TwoFactorRepository } from '../repositories/two-factor.repository';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { authenticator } from 'otplib';

// Mock otplib
vi.mock('otplib', () => ({
  authenticator: {
    options: {},
    generateSecret: vi.fn(),
    keyuri: vi.fn(),
    verify: vi.fn(),
  },
}));

// Mock qrcode
vi.mock('qrcode', () => ({
  toDataURL: vi.fn().mockResolvedValue('data:image/png;base64,mockQrCode'),
}));

describe('TwoFactorService', () => {
  let service: TwoFactorService;

  const mockTwoFactorRepository = {
    getTwoFactorData: vi.fn(),
    saveTwoFactorSecret: vi.fn(),
    enableTwoFactor: vi.fn(),
    disableTwoFactor: vi.fn(),
    updateBackupCodes: vi.fn(),
    removeUsedBackupCode: vi.fn(),
    isTwoFactorEnabled: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TwoFactorService,
        { provide: TwoFactorRepository, useValue: mockTwoFactorRepository },
      ],
    }).compile();

    service = module.get<TwoFactorService>(TwoFactorService);
  });

  describe('generateTwoFactorSecret', () => {
    it('should generate secret and QR code for user', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        twoFactorEnabled: false,
        name: 'Test User',
        twoFactorSecret: null,
        twoFactorBackupCodes: [],
      };
      mockTwoFactorRepository.getTwoFactorData.mockResolvedValue(mockUser);
      mockTwoFactorRepository.saveTwoFactorSecret.mockResolvedValue(undefined);
      vi.mocked(authenticator.generateSecret).mockReturnValue(
        'JBSWY3DPEHPK3PXP',
      );
      vi.mocked(authenticator.keyuri).mockReturnValue(
        'otpauth://totp/sass-multitenant:test@example.com?secret=JBSWY3DPEHPK3PXP',
      );

      const result = await service.generateTwoFactorSecret('user-1');

      expect(result.secret).toBe('JBSWY3DPEHPK3PXP');
      expect(result.qrCode).toContain('data:image/png;base64');
      expect(mockTwoFactorRepository.saveTwoFactorSecret).toHaveBeenCalledWith(
        'user-1',
        'JBSWY3DPEHPK3PXP',
      );
    });

    it('should throw UnauthorizedException if user not found', async () => {
      mockTwoFactorRepository.getTwoFactorData.mockResolvedValue(null);

      await expect(service.generateTwoFactorSecret('user-1')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw BadRequestException if 2FA already enabled', async () => {
      mockTwoFactorRepository.getTwoFactorData.mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
        twoFactorEnabled: true,
        twoFactorSecret: 'secret',
        twoFactorBackupCodes: [],
      });

      await expect(service.generateTwoFactorSecret('user-1')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('enableTwoFactor', () => {
    it('should enable 2FA with valid token', async () => {
      mockTwoFactorRepository.getTwoFactorData.mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
        twoFactorSecret: 'JBSWY3DPEHPK3PXP',
        twoFactorEnabled: false,
        twoFactorBackupCodes: [],
      });
      vi.mocked(authenticator.verify).mockReturnValue(true);
      mockTwoFactorRepository.enableTwoFactor.mockResolvedValue(undefined);

      const result = await service.enableTwoFactor('user-1', '123456');

      expect(result.success).toBe(true);
      expect(result.backupCodes).toHaveLength(8);
      expect(mockTwoFactorRepository.enableTwoFactor).toHaveBeenCalled();
    });

    it('should throw BadRequestException for invalid token', async () => {
      mockTwoFactorRepository.getTwoFactorData.mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
        twoFactorSecret: 'JBSWY3DPEHPK3PXP',
        twoFactorEnabled: false,
        twoFactorBackupCodes: [],
      });
      vi.mocked(authenticator.verify).mockReturnValue(false);

      await expect(service.enableTwoFactor('user-1', '000000')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if no secret generated', async () => {
      mockTwoFactorRepository.getTwoFactorData.mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
        twoFactorSecret: null,
        twoFactorEnabled: false,
        twoFactorBackupCodes: [],
      });

      await expect(service.enableTwoFactor('user-1', '123456')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('disableTwoFactor', () => {
    it('should disable 2FA with valid token', async () => {
      mockTwoFactorRepository.getTwoFactorData.mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
        twoFactorSecret: 'JBSWY3DPEHPK3PXP',
        twoFactorEnabled: true,
        twoFactorBackupCodes: [],
      });
      vi.mocked(authenticator.verify).mockReturnValue(true);
      mockTwoFactorRepository.disableTwoFactor.mockResolvedValue(undefined);

      const result = await service.disableTwoFactor('user-1', '123456');

      expect(result.success).toBe(true);
      expect(mockTwoFactorRepository.disableTwoFactor).toHaveBeenCalledWith(
        'user-1',
      );
    });

    it('should throw BadRequestException if 2FA not enabled', async () => {
      mockTwoFactorRepository.getTwoFactorData.mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
        twoFactorSecret: 'JBSWY3DPEHPK3PXP',
        twoFactorEnabled: false,
        twoFactorBackupCodes: [],
      });

      await expect(
        service.disableTwoFactor('user-1', '123456'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('verifyTwoFactorToken', () => {
    it('should return true for valid TOTP token', async () => {
      mockTwoFactorRepository.getTwoFactorData.mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
        twoFactorSecret: 'JBSWY3DPEHPK3PXP',
        twoFactorEnabled: true,
        twoFactorBackupCodes: [],
      });
      vi.mocked(authenticator.verify).mockReturnValue(true);

      const result = await service.verifyTwoFactorToken('user-1', '123456');

      expect(result).toBe(true);
    });

    it('should return true for valid backup code', async () => {
      mockTwoFactorRepository.getTwoFactorData.mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
        twoFactorSecret: 'JBSWY3DPEHPK3PXP',
        twoFactorEnabled: true,
        twoFactorBackupCodes: ['ABCD1234', 'EFGH5678'],
      });
      mockTwoFactorRepository.removeUsedBackupCode.mockResolvedValue(undefined);

      const result = await service.verifyTwoFactorToken('user-1', 'ABCD1234');

      expect(result).toBe(true);
      expect(mockTwoFactorRepository.removeUsedBackupCode).toHaveBeenCalledWith(
        'user-1',
        'ABCD1234',
        ['ABCD1234', 'EFGH5678'],
      );
    });

    it('should return false for invalid token', async () => {
      mockTwoFactorRepository.getTwoFactorData.mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
        twoFactorSecret: 'JBSWY3DPEHPK3PXP',
        twoFactorEnabled: true,
        twoFactorBackupCodes: [],
      });
      vi.mocked(authenticator.verify).mockReturnValue(false);

      const result = await service.verifyTwoFactorToken('user-1', '000000');

      expect(result).toBe(false);
    });

    it('should return false if user not found', async () => {
      mockTwoFactorRepository.getTwoFactorData.mockResolvedValue(null);

      const result = await service.verifyTwoFactorToken('user-1', '123456');

      expect(result).toBe(false);
    });

    it('should return false if 2FA not enabled', async () => {
      mockTwoFactorRepository.getTwoFactorData.mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
        twoFactorSecret: 'JBSWY3DPEHPK3PXP',
        twoFactorEnabled: false,
        twoFactorBackupCodes: [],
      });

      const result = await service.verifyTwoFactorToken('user-1', '123456');

      expect(result).toBe(false);
    });
  });

  describe('regenerateBackupCodes', () => {
    it('should regenerate backup codes with valid token', async () => {
      mockTwoFactorRepository.getTwoFactorData.mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
        twoFactorSecret: 'JBSWY3DPEHPK3PXP',
        twoFactorEnabled: true,
        twoFactorBackupCodes: [],
      });
      vi.mocked(authenticator.verify).mockReturnValue(true);
      mockTwoFactorRepository.updateBackupCodes.mockResolvedValue(undefined);

      const result = await service.regenerateBackupCodes('user-1', '123456');

      expect(result.success).toBe(true);
      expect(result.backupCodes).toHaveLength(8);
      expect(mockTwoFactorRepository.updateBackupCodes).toHaveBeenCalled();
    });

    it('should throw BadRequestException if 2FA not enabled', async () => {
      mockTwoFactorRepository.getTwoFactorData.mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
        twoFactorSecret: 'JBSWY3DPEHPK3PXP',
        twoFactorEnabled: false,
        twoFactorBackupCodes: [],
      });

      await expect(
        service.regenerateBackupCodes('user-1', '123456'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for invalid token', async () => {
      mockTwoFactorRepository.getTwoFactorData.mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
        twoFactorSecret: 'JBSWY3DPEHPK3PXP',
        twoFactorEnabled: true,
        twoFactorBackupCodes: [],
      });
      vi.mocked(authenticator.verify).mockReturnValue(false);

      await expect(
        service.regenerateBackupCodes('user-1', '000000'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('isTwoFactorEnabled', () => {
    it('should return true if 2FA is enabled', async () => {
      mockTwoFactorRepository.isTwoFactorEnabled.mockResolvedValue(true);

      const result = await service.isTwoFactorEnabled('user-1');

      expect(result).toBe(true);
    });

    it('should return false if 2FA is disabled', async () => {
      mockTwoFactorRepository.isTwoFactorEnabled.mockResolvedValue(false);

      const result = await service.isTwoFactorEnabled('user-1');

      expect(result).toBe(false);
    });
  });
});
