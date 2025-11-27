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
import {
  INestApplication,
  ValidationPipe,
  ExecutionContext,
} from '@nestjs/common';
import request from 'supertest';
import { PlansController } from '@/plans/plans.controller';
import { PlansService } from '@/plans/plans.service';
import { JwtAuthGuard } from '@/libs/common/guards/jwt-auth.guard';

describe('Plans (e2e)', () => {
  let app: INestApplication;

  const mockPlansService = {
    getAllPlans: vi.fn(),
    getCurrentPlan: vi.fn(),
    getCurrentCompany: vi.fn(),
    getPlanUsage: vi.fn(),
    checkUsageLimits: vi.fn(),
    upgradePlan: vi.fn(),
    cancelPlan: vi.fn(),
    reactivateSubscription: vi.fn(),
    getPlanHistory: vi.fn(),
    getPlanHistoryDetailed: vi.fn(),
    createCheckoutSession: vi.fn(),
    createBillingPortalSession: vi.fn(),
    validateSubscription: vi.fn(),
  };

  const mockJwtAuthGuard = {
    canActivate: vi.fn().mockImplementation((context: ExecutionContext) => {
      const req = context.switchToHttp().getRequest();
      req.user = { userId: 'test-user-id', tenantId: 'test-tenant-id' };
      return true;
    }),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [PlansController],
      providers: [{ provide: PlansService, useValue: mockPlansService }],
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
    mockJwtAuthGuard.canActivate.mockImplementation(
      (context: ExecutionContext) => {
        const req = context.switchToHttp().getRequest();
        req.user = { userId: 'test-user-id', tenantId: 'test-tenant-id' };
        return true;
      },
    );
  });

  describe('/plans/available (GET)', () => {
    it('should return available plans', async () => {
      const mockPlans = [
        { id: '1', name: 'STARTER', price: 0 },
        { id: '2', name: 'PROFESSIONAL', price: 99 },
      ];
      mockPlansService.getAllPlans.mockResolvedValue(mockPlans);

      const response = await request(app.getHttpServer()).get(
        '/plans/available',
      );

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockPlans);
    });

    it('should return 403 when guard rejects', async () => {
      mockJwtAuthGuard.canActivate.mockReturnValue(false);

      const response = await request(app.getHttpServer()).get(
        '/plans/available',
      );

      expect(response.status).toBe(403);
    });
  });

  describe('/plans/upgrade (POST)', () => {
    it('should return 400 for missing stripePriceId', async () => {
      const response = await request(app.getHttpServer())
        .post('/plans/upgrade')
        .send({ newPlan: 'PROFESSIONAL' });

      expect(response.status).toBe(400);
    });

    it('should upgrade plan successfully with stripePriceId', async () => {
      mockPlansService.upgradePlan.mockResolvedValue({
        success: true,
        message: 'Plan upgraded',
        newPlan: { name: 'PROFESSIONAL' },
      });

      const response = await request(app.getHttpServer())
        .post('/plans/upgrade')
        .send({
          newPlan: 'PROFESSIONAL',
          stripePriceId: 'price_123456',
        });

      expect(response.status).toBe(200);
      expect(mockPlansService.upgradePlan).toHaveBeenCalled();
    });
  });

  describe('/plans/cancel (POST)', () => {
    it('should cancel plan successfully', async () => {
      mockPlansService.cancelPlan.mockResolvedValue({
        success: true,
        message: 'Plan cancelled',
      });

      const response = await request(app.getHttpServer()).post('/plans/cancel');

      expect(response.status).toBe(200);
      expect(mockPlansService.cancelPlan).toHaveBeenCalledWith(
        'test-tenant-id',
      );
    });
  });

  describe('/plans/reactivate (POST)', () => {
    it('should reactivate subscription successfully', async () => {
      mockPlansService.reactivateSubscription.mockResolvedValue({
        success: true,
        message: 'Subscription reactivated',
      });

      const response = await request(app.getHttpServer()).post(
        '/plans/reactivate',
      );

      expect(response.status).toBe(200);
      expect(mockPlansService.reactivateSubscription).toHaveBeenCalledWith(
        'test-tenant-id',
      );
    });
  });

  describe('/plans/history (GET)', () => {
    it('should return plan history', async () => {
      const mockHistory = {
        currentStatus: 'ACTIVE',
        currentPlan: 'PROFESSIONAL',
        events: [],
      };
      mockPlansService.getPlanHistory.mockResolvedValue(mockHistory);

      const response = await request(app.getHttpServer()).get('/plans/history');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockHistory);
    });
  });

  describe('/plans/subscription/validate (GET)', () => {
    it('should validate subscription', async () => {
      mockPlansService.validateSubscription.mockResolvedValue(true);

      const response = await request(app.getHttpServer()).get(
        '/plans/subscription/validate',
      );

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ isValid: true });
    });
  });

  describe('/plans/checkout-session (POST)', () => {
    it('should create checkout session', async () => {
      mockPlansService.createCheckoutSession.mockResolvedValue(
        'https://checkout.stripe.com/xxx',
      );

      const response = await request(app.getHttpServer())
        .post('/plans/checkout-session')
        .send({
          priceId: 'price_xxx',
          successUrl: 'https://app.com/success',
          cancelUrl: 'https://app.com/cancel',
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('url');
      expect(mockPlansService.createCheckoutSession).toHaveBeenCalledWith(
        'test-tenant-id',
        'price_xxx',
        'https://app.com/success',
        'https://app.com/cancel',
      );
    });
  });

  describe('/plans/billing-portal (POST)', () => {
    it('should create billing portal session', async () => {
      mockPlansService.createBillingPortalSession.mockResolvedValue(
        'https://billing.stripe.com/xxx',
      );

      const response = await request(app.getHttpServer())
        .post('/plans/billing-portal')
        .send({
          returnUrl: 'https://app.com/dashboard',
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('url');
      expect(mockPlansService.createBillingPortalSession).toHaveBeenCalledWith(
        'test-tenant-id',
        'https://app.com/dashboard',
      );
    });
  });

  describe('/plans/info (GET)', () => {
    it('should return tenant subscription info', async () => {
      mockPlansService.getCurrentPlan.mockResolvedValue({
        name: 'PROFESSIONAL',
        price: 99,
      });
      mockPlansService.getCurrentCompany.mockResolvedValue({
        name: 'Test Company',
      });
      mockPlansService.getPlanUsage.mockResolvedValue({
        users: 5,
        storage: 1000,
      });
      mockPlansService.checkUsageLimits.mockResolvedValue({
        usersAtLimit: false,
        storageAtLimit: false,
      });

      const response = await request(app.getHttpServer()).get('/plans/info');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('plan');
      expect(response.body).toHaveProperty('company');
      expect(response.body).toHaveProperty('usage');
      expect(response.body).toHaveProperty('limits');
    });
  });
});
