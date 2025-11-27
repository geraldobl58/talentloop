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
import { AuthController } from '@/auth/auth.controller';
import { AuthService } from '@/auth/services/auth.service';
import { SignupService } from '@/auth/services/signup.service';
import { JwtAuthGuard } from '@/libs/common/guards/jwt-auth.guard';

describe('Auth (e2e)', () => {
  let app: INestApplication;

  const mockAuthService = {
    signIn: vi.fn(),
    forgotPassword: vi.fn(),
    resetPassword: vi.fn(),
    changePassword: vi.fn(),
    refreshToken: vi.fn(),
    uploadAvatar: vi.fn(),
    getUserById: vi.fn(),
    getProfileWithPlan: vi.fn(),
  };

  const mockSignupService = {
    signup: vi.fn(),
  };

  const mockJwtAuthGuard = {
    canActivate: vi.fn().mockImplementation((context) => {
      const req = context.switchToHttp().getRequest();
      req.user = { userId: 'test-user-id', tenantId: 'test-tenant-id' };
      return true;
    }),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: SignupService, useValue: mockSignupService },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtAuthGuard)
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

  describe('/auth/signin (POST)', () => {
    it('should return 400 for missing fields', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/signin')
        .send({
          email: 'test@example.com',
        });

      expect(response.status).toBe(400);
    });

    it('should return 400 for invalid password format', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/signin')
        .send({
          email: 'test@example.com',
          password: 'weak',
          tenantId: 'test-tenant',
        });

      expect(response.status).toBe(400);
    });

    it('should call signIn service with valid data', async () => {
      mockAuthService.signIn.mockResolvedValue({
        access_token: 'mock-token',
        user: { id: '1', email: 'test@example.com' },
      });

      const response = await request(app.getHttpServer())
        .post('/auth/signin')
        .send({
          email: 'test@example.com',
          password: 'Password@123',
          tenantId: 'test-tenant',
        });

      expect(response.status).toBe(200);
      expect(mockAuthService.signIn).toHaveBeenCalledWith(
        'test@example.com',
        'Password@123',
        'test-tenant',
        undefined,
      );
    });
  });

  describe('/auth/signup (POST)', () => {
    it('should return 400 for missing required fields', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/signup')
        .send({
          companyName: 'Test Company',
        });

      expect(response.status).toBe(400);
    });

    it('should validate email format', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/signup')
        .send({
          companyName: 'Test Company',
          domain: 'test-company',
          contactName: 'Test User',
          contactEmail: 'invalid-email',
          plan: 'STARTER',
        });

      expect(response.status).toBe(400);
    });

    it('should call signup service with valid data', async () => {
      mockSignupService.signup.mockResolvedValue({
        success: true,
        message: 'Company created',
        tenantId: 'new-tenant-id',
        plan: { id: '1', name: 'STARTER', price: 0, currency: 'BRL' },
      });

      const response = await request(app.getHttpServer())
        .post('/auth/signup')
        .send({
          companyName: 'Test Company',
          domain: 'test-company',
          contactName: 'Test User',
          contactEmail: 'test@example.com',
          plan: 'STARTER',
        });

      expect(response.status).toBe(201);
      expect(mockSignupService.signup).toHaveBeenCalled();
    });
  });

  describe('/auth/forgot-password (POST)', () => {
    it('should return 400 for missing email', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/forgot-password')
        .send({
          tenantId: 'test-tenant',
        });

      expect(response.status).toBe(400);
    });

    it('should call forgotPassword service', async () => {
      mockAuthService.forgotPassword.mockResolvedValue({
        message: 'Email sent if exists',
      });

      const response = await request(app.getHttpServer())
        .post('/auth/forgot-password')
        .send({
          email: 'test@example.com',
          tenantId: 'test-tenant',
        });

      expect(response.status).toBe(200);
      expect(mockAuthService.forgotPassword).toHaveBeenCalledWith(
        'test@example.com',
        'test-tenant',
      );
    });
  });

  describe('/auth/reset-password (POST)', () => {
    it('should return 400 for missing token', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/reset-password')
        .send({
          newPassword: 'NewPassword@123',
        });

      expect(response.status).toBe(400);
    });

    it('should call resetPassword service', async () => {
      mockAuthService.resetPassword.mockResolvedValue({
        message: 'Password reset successfully',
      });

      const response = await request(app.getHttpServer())
        .post('/auth/reset-password')
        .send({
          token: 'valid-token',
          newPassword: 'NewPassword@123',
        });

      expect(response.status).toBe(200);
      expect(mockAuthService.resetPassword).toHaveBeenCalledWith(
        'valid-token',
        'NewPassword@123',
      );
    });
  });

  describe('/auth/profile (GET)', () => {
    it('should return user profile', async () => {
      mockAuthService.getUserById.mockResolvedValue({
        id: 'test-user-id',
        email: 'test@example.com',
        name: 'Test User',
        avatar: null,
      });
      mockAuthService.getProfileWithPlan.mockResolvedValue({
        plan: { name: 'STARTER' },
        expiresAt: null,
      });

      const response = await request(app.getHttpServer()).get('/auth/profile');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('userId');
      expect(response.body).toHaveProperty('email');
    });
  });
});
