import {
  describe,
  it,
  expect,
  beforeAll,
  afterAll,
  vi,
  beforeEach,
} from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { TwoFactorController } from '@/auth/two-factor/two-factor.controller';
import { TwoFactorService } from '@/auth/services/two-factor.service';
import { AuthGuard } from '@nestjs/passport';

describe('Two-Factor Auth (e2e)', () => {
  let app: INestApplication;

  const mockTwoFactorService = {
    generateTwoFactorSecret: vi.fn(),
    enableTwoFactor: vi.fn(),
    disableTwoFactor: vi.fn(),
    regenerateBackupCodes: vi.fn(),
    isTwoFactorEnabled: vi.fn(),
  };

  const mockAuthGuard = {
    canActivate: vi.fn().mockImplementation((context) => {
      const req = context.switchToHttp().getRequest();
      req.user = { userId: 'test-user-id', tenantId: 'test-tenant-id' };
      return true;
    }),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [TwoFactorController],
      providers: [
        { provide: TwoFactorService, useValue: mockTwoFactorService },
      ],
    })
      .overrideGuard(AuthGuard('jwt'))
      .useValue(mockAuthGuard)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('/auth/2fa/generate (GET)', () => {
    it('should generate 2FA secret and QR code', async () => {
      mockTwoFactorService.generateTwoFactorSecret.mockResolvedValue({
        secret: 'JBSWY3DPEHPK3PXP',
        qrCode: 'data:image/png;base64,xxx',
      });

      const response = await request(app.getHttpServer()).get(
        '/auth/2fa/generate',
      );

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('secret');
      expect(response.body).toHaveProperty('qrCode');
      expect(mockTwoFactorService.generateTwoFactorSecret).toHaveBeenCalledWith(
        'test-user-id',
      );
    });
  });

  describe('/auth/2fa/enable (POST)', () => {
    it('should return 400 for missing token', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/2fa/enable')
        .send({});

      expect(response.status).toBe(400);
    });

    it('should enable 2FA with valid token', async () => {
      mockTwoFactorService.enableTwoFactor.mockResolvedValue({
        success: true,
        backupCodes: ['A1B2C3D4', 'E5F6G7H8'],
        message: '2FA ativado com sucesso',
      });

      const response = await request(app.getHttpServer())
        .post('/auth/2fa/enable')
        .send({ token: '123456' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('backupCodes');
      expect(mockTwoFactorService.enableTwoFactor).toHaveBeenCalledWith(
        'test-user-id',
        '123456',
      );
    });
  });

  describe('/auth/2fa/disable (DELETE)', () => {
    it('should return 400 for missing token', async () => {
      const response = await request(app.getHttpServer())
        .delete('/auth/2fa/disable')
        .send({});

      expect(response.status).toBe(400);
    });

    it('should disable 2FA with valid token', async () => {
      mockTwoFactorService.disableTwoFactor.mockResolvedValue({
        success: true,
        message: '2FA desativado com sucesso',
      });

      const response = await request(app.getHttpServer())
        .delete('/auth/2fa/disable')
        .send({ token: '123456' });

      expect(response.status).toBe(200);
      expect(mockTwoFactorService.disableTwoFactor).toHaveBeenCalledWith(
        'test-user-id',
        '123456',
      );
    });
  });

  describe('/auth/2fa/status (GET)', () => {
    it('should return 2FA status', async () => {
      mockTwoFactorService.isTwoFactorEnabled.mockResolvedValue(true);

      const response = await request(app.getHttpServer()).get(
        '/auth/2fa/status',
      );

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ twoFactorEnabled: true });
    });

    it('should return false when 2FA is disabled', async () => {
      mockTwoFactorService.isTwoFactorEnabled.mockResolvedValue(false);

      const response = await request(app.getHttpServer()).get(
        '/auth/2fa/status',
      );

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ twoFactorEnabled: false });
    });
  });

  describe('/auth/2fa/regenerate-backup-codes (POST)', () => {
    it('should regenerate backup codes', async () => {
      mockTwoFactorService.regenerateBackupCodes.mockResolvedValue({
        success: true,
        backupCodes: ['M4N5O6P7', 'Q8R9S0T1'],
        message: 'Backup codes regenerados com sucesso',
      });

      const response = await request(app.getHttpServer())
        .post('/auth/2fa/regenerate-backup-codes')
        .send({ token: '123456' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('backupCodes');
      expect(mockTwoFactorService.regenerateBackupCodes).toHaveBeenCalledWith(
        'test-user-id',
        '123456',
      );
    });
  });
});
