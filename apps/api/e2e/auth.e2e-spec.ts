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
import { SignupCheckoutService } from '@/auth/services/signup-checkout.service';
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

  const mockSignupCheckoutService = {
    signupCandidate: vi.fn(),
    signupCompany: vi.fn(),
    handleCheckoutCompleted: vi.fn(),
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
        { provide: SignupCheckoutService, useValue: mockSignupCheckoutService },
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
        });

      expect(response.status).toBe(400);
    });

    it('should call signIn service with valid data (auto-detect tenant type)', async () => {
      mockAuthService.signIn.mockResolvedValue({
        requiresTwoFactor: false,
        access_token: 'mock-token',
        tenantType: 'CANDIDATE',
        user: { id: '1', email: 'test@example.com' },
      });

      const response = await request(app.getHttpServer())
        .post('/auth/signin')
        .send({
          email: 'test@example.com',
          password: 'Password@123',
        });

      expect(response.status).toBe(200);
      expect(response.body.tenantType).toBe('CANDIDATE');
      expect(mockAuthService.signIn).toHaveBeenCalledWith(
        'test@example.com',
        'Password@123',
        undefined,
      );
    });

    it('should return COMPANY tenantType for company users', async () => {
      mockAuthService.signIn.mockResolvedValue({
        requiresTwoFactor: false,
        access_token: 'mock-token',
        tenantType: 'COMPANY',
        user: { id: '1', email: 'admin@company.com' },
      });

      const response = await request(app.getHttpServer())
        .post('/auth/signin')
        .send({
          email: 'admin@company.com',
          password: 'Password@123',
        });

      expect(response.status).toBe(200);
      expect(response.body.tenantType).toBe('COMPANY');
    });
  });

  describe('/auth/signup/candidate (POST)', () => {
    it('should return 400 for missing required fields', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/signup/candidate')
        .send({
          name: 'Test User',
        });

      expect(response.status).toBe(400);
    });

    it('should validate email format', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/signup/candidate')
        .send({
          name: 'Test User',
          email: 'invalid-email',
          plan: 'FREE',
        });

      expect(response.status).toBe(400);
    });

    it('should call signupCandidate service with valid data', async () => {
      mockSignupCheckoutService.signupCandidate.mockResolvedValue({
        success: true,
        message: 'Account created',
        plan: { id: '1', name: 'FREE', price: 0, currency: 'BRL' },
        isFree: true,
      });

      const response = await request(app.getHttpServer())
        .post('/auth/signup/candidate')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          plan: 'FREE',
        });

      expect(response.status).toBe(201);
      expect(mockSignupCheckoutService.signupCandidate).toHaveBeenCalled();
    });
  });

  describe('/auth/signup/company (POST)', () => {
    it('should return 400 for missing required fields', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/signup/company')
        .send({
          companyName: 'Test Company',
        });

      expect(response.status).toBe(400);
    });

    it('should validate email format', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/signup/company')
        .send({
          companyName: 'Test Company',
          domain: 'test-company',
          contactName: 'Test User',
          contactEmail: 'invalid-email',
          plan: 'STARTUP',
        });

      expect(response.status).toBe(400);
    });

    it('should call signupCompany service with valid data', async () => {
      mockSignupCheckoutService.signupCompany.mockResolvedValue({
        success: true,
        message: 'Redirecting to checkout...',
        checkoutUrl: 'https://checkout.stripe.com/test',
        plan: {
          id: '1',
          name: 'STARTUP',
          price: 299,
          currency: 'BRL',
          billingPeriodDays: 30,
        },
      });

      const response = await request(app.getHttpServer())
        .post('/auth/signup/company')
        .send({
          companyName: 'Test Company',
          domain: 'test-company',
          contactName: 'Test User',
          contactEmail: 'test@example.com',
          plan: 'STARTUP',
        });

      expect(response.status).toBe(201);
      expect(mockSignupCheckoutService.signupCompany).toHaveBeenCalled();
    });
  });

  describe('/auth/forgot-password (POST)', () => {
    it('should return 400 for missing email', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/forgot-password')
        .send({});

      expect(response.status).toBe(400);
    });

    it('should call forgotPassword service with email only (auto-detect tenant)', async () => {
      mockAuthService.forgotPassword.mockResolvedValue({
        success: true,
        message: 'Email sent if exists',
      });

      const response = await request(app.getHttpServer())
        .post('/auth/forgot-password')
        .send({
          email: 'test@example.com',
        });

      expect(response.status).toBe(200);
      expect(mockAuthService.forgotPassword).toHaveBeenCalledWith(
        'test@example.com',
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
