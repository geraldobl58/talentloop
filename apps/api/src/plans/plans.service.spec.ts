import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { PlansService } from './plans.service';
import { PrismaService } from '@/libs/prisma/prisma.service';
import { StripeService } from '@/stripe/services/stripe.service';
import { EmailService } from '@/email/services/email.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';

// Mock @prisma/client to provide the enums
vi.mock('@prisma/client', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    SubStatus: {
      ACTIVE: 'ACTIVE',
      CANCELED: 'CANCELED',
      EXPIRED: 'EXPIRED',
      TRIALING: 'TRIALING',
      PAST_DUE: 'PAST_DUE',
    },
    SubscriptionAction: {
      CREATED: 'CREATED',
      UPGRADED: 'UPGRADED',
      DOWNGRADED: 'DOWNGRADED',
      RENEWED: 'RENEWED',
      CANCELED: 'CANCELED',
      REACTIVATED: 'REACTIVATED',
      EXPIRED: 'EXPIRED',
    },
  };
});

// Define enums locally to use in test data
const SubStatus = {
  ACTIVE: 'ACTIVE',
  CANCELED: 'CANCELED',
  EXPIRED: 'EXPIRED',
  TRIALING: 'TRIALING',
  PAST_DUE: 'PAST_DUE',
} as const;

const SubscriptionAction = {
  CREATED: 'CREATED',
  UPGRADED: 'UPGRADED',
  DOWNGRADED: 'DOWNGRADED',
  RENEWED: 'RENEWED',
  CANCELED: 'CANCELED',
  REACTIVATED: 'REACTIVATED',
  EXPIRED: 'EXPIRED',
} as const;

describe('PlansService', () => {
  let service: PlansService;

  const mockPrismaService = {
    plan: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      findFirst: vi.fn(),
    },
    subscription: {
      findUnique: vi.fn(),
      update: vi.fn(),
      create: vi.fn(),
    },
    tenant: {
      findUnique: vi.fn(),
    },
    user: {
      findFirst: vi.fn(),
      count: vi.fn(),
    },
    subscriptionHistory: {
      create: vi.fn(),
    },
  };

  const mockStripeService = {
    createCustomer: vi.fn(),
    createCheckoutSession: vi.fn(),
    cancelSubscription: vi.fn(),
    updateSubscription: vi.fn(),
    createBillingPortalSession: vi.fn(),
  };

  const mockEmailService = {
    sendCancellationEmail: vi.fn(),
    sendUpgradeEmail: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PlansService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: StripeService, useValue: mockStripeService },
        { provide: EmailService, useValue: mockEmailService },
      ],
    }).compile();

    service = module.get<PlansService>(PlansService);
  });

  describe('getAllPlans', () => {
    it('should return all plans ordered by price', async () => {
      const mockPlans = [
        { id: '1', name: 'STARTER', price: 0 },
        { id: '2', name: 'PROFESSIONAL', price: 99 },
        { id: '3', name: 'ENTERPRISE', price: 299 },
      ];
      mockPrismaService.plan.findMany.mockResolvedValue(mockPlans);

      const result = await service.getAllPlans();

      expect(result).toEqual(mockPlans);
      expect(mockPrismaService.plan.findMany).toHaveBeenCalledWith({
        orderBy: { price: 'asc' },
      });
    });
  });

  describe('getCurrentPlan', () => {
    it('should return current plan info', async () => {
      const mockSubscription = {
        id: 'sub-1',
        tenantId: 'tenant-1',
        status: SubStatus.ACTIVE,
        expiresAt: new Date('2025-12-31'),
        startedAt: new Date('2025-01-01'),
        plan: {
          id: 'plan-1',
          name: 'PROFESSIONAL',
          price: 99,
          currency: 'BRL',
          maxUsers: 10,
          maxContacts: 1000,
          hasAPI: true,
          description: 'Plan description',
        },
      };
      mockPrismaService.subscription.findUnique.mockResolvedValue(
        mockSubscription,
      );

      const result = await service.getCurrentPlan('tenant-1');

      expect(result.name).toBe('PROFESSIONAL');
      expect(result.price).toBe(99);
      expect(result.status).toBe('ACTIVE');
    });

    it('should throw NotFoundException if plan not found', async () => {
      mockPrismaService.subscription.findUnique.mockResolvedValue(null);

      await expect(service.getCurrentPlan('tenant-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('cancelPlan', () => {
    it('should cancel plan successfully', async () => {
      const mockSubscription = {
        id: 'sub-1',
        tenantId: 'tenant-1',
        status: SubStatus.ACTIVE,
        stripeSubscriptionId: 'stripe-sub-1',
        plan: { id: 'plan-1', name: 'PROFESSIONAL', price: 99 },
      };
      mockPrismaService.subscription.findUnique.mockResolvedValue(
        mockSubscription,
      );
      mockPrismaService.subscription.update.mockResolvedValue({
        ...mockSubscription,
        status: SubStatus.CANCELED,
      });
      mockStripeService.cancelSubscription.mockResolvedValue({});
      mockPrismaService.tenant.findUnique.mockResolvedValue({
        id: 'tenant-1',
        name: 'Test Company',
      });
      mockPrismaService.user.findFirst.mockResolvedValue({
        id: 'user-1',
        name: 'Admin User',
        email: 'admin@test.com',
      });
      mockEmailService.sendCancellationEmail.mockResolvedValue({});

      const result = await service.cancelPlan('tenant-1');

      expect(result.success).toBe(true);
      expect(result.message).toBe('Plano cancelado com sucesso');
      expect(mockStripeService.cancelSubscription).toHaveBeenCalledWith(
        'stripe-sub-1',
      );
    });

    it('should throw NotFoundException if subscription not found', async () => {
      mockPrismaService.subscription.findUnique.mockResolvedValue(null);

      await expect(service.cancelPlan('tenant-1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException if already canceled', async () => {
      const mockSubscription = {
        id: 'sub-1',
        tenantId: 'tenant-1',
        status: SubStatus.CANCELED,
        plan: { id: 'plan-1', name: 'PROFESSIONAL', price: 99 },
      };
      mockPrismaService.subscription.findUnique.mockResolvedValue(
        mockSubscription,
      );

      await expect(service.cancelPlan('tenant-1')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('reactivateSubscription', () => {
    it('should reactivate canceled subscription', async () => {
      const mockSubscription = {
        id: 'sub-1',
        tenantId: 'tenant-1',
        status: SubStatus.CANCELED,
        plan: {
          id: 'plan-1',
          name: 'PROFESSIONAL',
          price: 99,
          currency: 'BRL',
          maxUsers: 10,
          maxContacts: 1000,
          hasAPI: true,
          description: 'Professional plan',
        },
        expiresAt: new Date('2025-01-01'),
        startedAt: new Date('2024-01-01'),
      };
      mockPrismaService.subscription.findUnique.mockResolvedValue(
        mockSubscription,
      );
      mockPrismaService.subscription.update.mockResolvedValue({
        ...mockSubscription,
        status: SubStatus.ACTIVE,
        canceledAt: null,
        expiresAt: new Date('2025-12-31'),
        plan: mockSubscription.plan,
      });

      const result = await service.reactivateSubscription('tenant-1');

      expect(result.success).toBe(true);
      expect(result.message).toContain('reativado');
    });

    it('should throw BadRequestException if not canceled', async () => {
      const mockSubscription = {
        id: 'sub-1',
        tenantId: 'tenant-1',
        status: SubStatus.ACTIVE,
        plan: { id: 'plan-1', name: 'PROFESSIONAL', price: 99 },
      };
      mockPrismaService.subscription.findUnique.mockResolvedValue(
        mockSubscription,
      );

      await expect(service.reactivateSubscription('tenant-1')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('validateSubscription', () => {
    it('should return true for active non-expired subscription', async () => {
      const futureDate = new Date();
      futureDate.setMonth(futureDate.getMonth() + 1);

      mockPrismaService.subscription.findUnique.mockResolvedValue({
        status: SubStatus.ACTIVE,
        expiresAt: futureDate,
      });

      const result = await service.validateSubscription('tenant-1');

      expect(result).toBe(true);
    });

    it('should return false for canceled subscription', async () => {
      mockPrismaService.subscription.findUnique.mockResolvedValue({
        status: SubStatus.CANCELED,
        expiresAt: new Date('2025-12-31'),
      });

      const result = await service.validateSubscription('tenant-1');

      expect(result).toBe(false);
    });

    it('should return false for expired subscription', async () => {
      mockPrismaService.subscription.findUnique.mockResolvedValue({
        status: SubStatus.ACTIVE,
        expiresAt: new Date('2020-01-01'),
      });

      const result = await service.validateSubscription('tenant-1');

      expect(result).toBe(false);
    });

    it('should return false if subscription not found', async () => {
      mockPrismaService.subscription.findUnique.mockResolvedValue(null);

      const result = await service.validateSubscription('tenant-1');

      expect(result).toBe(false);
    });
  });

  describe('getCurrentCompany', () => {
    it('should return company info', async () => {
      mockPrismaService.tenant.findUnique.mockResolvedValue({
        id: 'tenant-1',
        name: 'Test Company',
        slug: 'test-company',
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-01'),
      });

      const result = await service.getCurrentCompany('tenant-1');

      expect(result.name).toBe('Test Company');
      expect(result.domain).toBe('test-company.sass-multitenant.com');
    });

    it('should throw NotFoundException if tenant not found', async () => {
      mockPrismaService.tenant.findUnique.mockResolvedValue(null);

      await expect(service.getCurrentCompany('tenant-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getPlanUsage', () => {
    it('should return usage statistics', async () => {
      mockPrismaService.user.count.mockResolvedValue(5);
      mockPrismaService.subscription.findUnique.mockResolvedValue({
        plan: { maxUsers: 10 },
      });

      const result = await service.getPlanUsage('tenant-1');

      expect(result.currentUsers).toBe(5);
      expect(result.maxUsers).toBe(10);
    });

    it('should throw NotFoundException if plan not found', async () => {
      mockPrismaService.user.count.mockResolvedValue(5);
      mockPrismaService.subscription.findUnique.mockResolvedValue(null);

      await expect(service.getPlanUsage('tenant-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('createBillingPortalSession', () => {
    it('should create billing portal session', async () => {
      mockPrismaService.subscription.findUnique.mockResolvedValue({
        stripeCustomerId: 'cus_123',
      });
      mockStripeService.createBillingPortalSession.mockResolvedValue(
        'https://billing.stripe.com/xxx',
      );

      const result = await service.createBillingPortalSession(
        'tenant-1',
        'https://app.com/dashboard',
      );

      expect(result).toBe('https://billing.stripe.com/xxx');
      expect(mockStripeService.createBillingPortalSession).toHaveBeenCalledWith(
        'cus_123',
        'https://app.com/dashboard',
      );
    });

    it('should throw BadRequestException if no Stripe customer', async () => {
      mockPrismaService.subscription.findUnique.mockResolvedValue({
        stripeCustomerId: null,
      });

      await expect(
        service.createBillingPortalSession('tenant-1', 'https://app.com'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('checkUsageLimits', () => {
    it('should return usage limits', async () => {
      mockPrismaService.subscription.findUnique.mockResolvedValue({
        plan: {
          maxContacts: 1000,
          hasAPI: true,
        },
      });

      const result = await service.checkUsageLimits('tenant-1');

      expect(result.contacts.limit).toBe(1000);
      expect(result.api.enabled).toBe(true);
    });
  });

  describe('getPlanHistory', () => {
    it('should return plan history with summary', async () => {
      const mockSubscription = {
        status: SubStatus.ACTIVE,
        expiresAt: new Date('2025-12-31'),
        startedAt: new Date('2025-01-01'),
        plan: { name: 'PROFESSIONAL', price: 99 },
        history: [
          {
            id: '1',
            action: SubscriptionAction.UPGRADED,
            previousPlanName: 'STARTER',
            newPlanName: 'PROFESSIONAL',
            previousPlanPrice: 0,
            newPlanPrice: 99,
            reason: 'User upgrade',
            notes: null,
            triggeredBy: 'user',
            createdAt: new Date('2025-06-01'),
          },
        ],
      };
      mockPrismaService.subscription.findUnique.mockResolvedValue(
        mockSubscription,
      );

      const result = await service.getPlanHistory('tenant-1');

      expect(result.currentStatus).toBe('ACTIVE');
      expect(result.currentPlan).toBe('PROFESSIONAL');
      expect(result.summary.totalUpgrades).toBe(1);
      expect(result.events.length).toBe(1);
    });

    it('should throw NotFoundException if subscription not found', async () => {
      mockPrismaService.subscription.findUnique.mockResolvedValue(null);

      await expect(service.getPlanHistory('tenant-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
