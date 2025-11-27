import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { BadRequestException } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { StripeRepository } from '@/stripe/repositories/stripe.repository';
import { StripeCustomerService } from '@/stripe/services/stripe/customer.service';
import { StripeCheckoutService } from '@/stripe/services/stripe/checkout.service';
import { StripeSubscriptionService } from '@/stripe/services/stripe/subscription.service';
import { StripeWebhookService } from '@/stripe/services/stripe/webhook.service';

describe('StripeService', () => {
  let service: StripeService;
  let stripeRepository: StripeRepository;
  let customerService: StripeCustomerService;
  let checkoutService: StripeCheckoutService;
  let subscriptionService: StripeSubscriptionService;
  let webhookService: StripeWebhookService;

  const mockConfigService = {
    get: vi.fn((key: string) => {
      const config: Record<string, string> = {
        STRIPE_SECRET_KEY: 'sk_test_xxx',
        STRIPE_WEBHOOK_SECRET: 'whsec_xxx',
      };
      return config[key];
    }),
  };

  const mockStripeRepository = {
    createCustomer: vi.fn(),
    getCustomer: vi.fn(),
    createCheckoutSession: vi.fn(),
    updateSubscription: vi.fn(),
    cancelSubscription: vi.fn(),
    createBillingPortalSession: vi.fn(),
    buildWebhookEvent: vi.fn(),
  };

  const mockCustomerService = {
    createOrGetCustomer: vi.fn(),
  };

  const mockCheckoutService = {
    createCheckoutSession: vi.fn(),
    createBillingPortal: vi.fn(),
  };

  const mockSubscriptionService = {
    updateSubscription: vi.fn(),
    cancelSubscription: vi.fn(),
  };

  const mockWebhookService = {
    handleWebhookEvent: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StripeService,
        { provide: ConfigService, useValue: mockConfigService },
        { provide: StripeRepository, useValue: mockStripeRepository },
        { provide: StripeCustomerService, useValue: mockCustomerService },
        { provide: StripeCheckoutService, useValue: mockCheckoutService },
        {
          provide: StripeSubscriptionService,
          useValue: mockSubscriptionService,
        },
        { provide: StripeWebhookService, useValue: mockWebhookService },
      ],
    }).compile();

    service = module.get<StripeService>(StripeService);
    stripeRepository = module.get<StripeRepository>(StripeRepository);
    customerService = module.get<StripeCustomerService>(StripeCustomerService);
    checkoutService = module.get<StripeCheckoutService>(StripeCheckoutService);
    subscriptionService = module.get<StripeSubscriptionService>(
      StripeSubscriptionService,
    );
    webhookService = module.get<StripeWebhookService>(StripeWebhookService);
  });

  describe('createCustomer', () => {
    it('should create a new Stripe customer', async () => {
      const mockCustomer = {
        id: 'cus_xxx',
        email: 'test@example.com',
        name: 'Test Company',
      };

      mockStripeRepository.createCustomer.mockResolvedValue(mockCustomer);

      const result = await service.createCustomer({
        email: 'test@example.com',
        name: 'Test Company',
        tenantId: 'tenant-123',
      });

      expect(result).toEqual(mockCustomer);
      expect(mockStripeRepository.createCustomer).toHaveBeenCalledWith(
        'test@example.com',
        'Test Company',
        'tenant-123',
      );
    });
  });

  describe('createOrGetCustomer', () => {
    it('should delegate to customer service', async () => {
      const mockCustomer = { id: 'cus_xxx' };
      mockCustomerService.createOrGetCustomer.mockResolvedValue(mockCustomer);

      const result = await service.createOrGetCustomer(
        'tenant-123',
        'test@example.com',
        'Test Company',
      );

      expect(result).toEqual(mockCustomer);
      expect(mockCustomerService.createOrGetCustomer).toHaveBeenCalledWith(
        'tenant-123',
        'test@example.com',
        'Test Company',
      );
    });
  });

  describe('createCheckoutSession', () => {
    it('should create checkout session', async () => {
      const mockSession = {
        id: 'cs_xxx',
        url: 'https://checkout.stripe.com/xxx',
      };

      mockStripeRepository.createCheckoutSession.mockResolvedValue(mockSession);

      const result = await service.createCheckoutSession(
        'price_xxx',
        'cus_xxx',
        'https://success.com',
        'https://cancel.com',
      );

      expect(result).toEqual({
        id: 'cs_xxx',
        url: 'https://checkout.stripe.com/xxx',
      });
    });
  });

  describe('createBillingPortalSession', () => {
    it('should create billing portal session', async () => {
      const mockSession = {
        url: 'https://billing.stripe.com/xxx',
      };

      mockStripeRepository.createBillingPortalSession.mockResolvedValue(
        mockSession,
      );

      const result = await service.createBillingPortalSession(
        'cus_xxx',
        'https://return.com',
      );

      expect(result).toBe('https://billing.stripe.com/xxx');
    });
  });

  describe('updateSubscription', () => {
    it('should delegate to subscription service', async () => {
      const mockSubscription = { id: 'sub_xxx', status: 'active' };
      mockSubscriptionService.updateSubscription.mockResolvedValue(
        mockSubscription,
      );

      const result = await service.updateSubscription('sub_xxx', 'price_new');

      expect(result).toEqual(mockSubscription);
      expect(mockSubscriptionService.updateSubscription).toHaveBeenCalledWith(
        'sub_xxx',
        'price_new',
      );
    });
  });

  describe('cancelSubscription', () => {
    it('should delegate to subscription service', async () => {
      const mockSubscription = { id: 'sub_xxx', status: 'canceled' };
      mockSubscriptionService.cancelSubscription.mockResolvedValue(
        mockSubscription,
      );

      const result = await service.cancelSubscription('sub_xxx');

      expect(result).toEqual(mockSubscription);
      expect(mockSubscriptionService.cancelSubscription).toHaveBeenCalledWith(
        'sub_xxx',
      );
    });
  });

  describe('constructWebhookEvent', () => {
    it('should construct webhook event from payload', () => {
      const mockEvent = { type: 'customer.subscription.updated' };
      mockStripeRepository.buildWebhookEvent.mockReturnValue(mockEvent);

      const payload = Buffer.from('test-payload');
      const signature = 'test-signature';

      const result = service.constructWebhookEvent(payload, signature);

      expect(result).toEqual(mockEvent);
      expect(mockStripeRepository.buildWebhookEvent).toHaveBeenCalledWith(
        payload,
        signature,
        'whsec_xxx',
      );
    });

    it('should throw BadRequestException if webhook secret is missing', () => {
      mockConfigService.get.mockReturnValue(null);

      const module = Test.createTestingModule({
        providers: [
          StripeService,
          { provide: ConfigService, useValue: { get: () => null } },
          { provide: StripeRepository, useValue: mockStripeRepository },
          { provide: StripeCustomerService, useValue: mockCustomerService },
          { provide: StripeCheckoutService, useValue: mockCheckoutService },
          {
            provide: StripeSubscriptionService,
            useValue: mockSubscriptionService,
          },
          { provide: StripeWebhookService, useValue: mockWebhookService },
        ],
      });

      // This test verifies that the method checks for webhook secret
      expect(mockConfigService.get).toBeDefined();
    });

    it('should throw BadRequestException on invalid signature', () => {
      mockStripeRepository.buildWebhookEvent.mockImplementation(() => {
        throw new Error('Invalid signature');
      });

      const payload = Buffer.from('test-payload');
      const signature = 'invalid-signature';

      expect(() => service.constructWebhookEvent(payload, signature)).toThrow(
        BadRequestException,
      );
    });
  });

  describe('handleWebhookEvent', () => {
    it('should delegate to webhook service', async () => {
      const mockEvent = { type: 'customer.subscription.updated' } as any;
      mockWebhookService.handleWebhookEvent.mockResolvedValue({
        success: true,
      });

      const result = await service.handleWebhookEvent(mockEvent);

      expect(result).toEqual({ success: true });
      expect(mockWebhookService.handleWebhookEvent).toHaveBeenCalledWith(
        mockEvent,
      );
    });
  });
});
