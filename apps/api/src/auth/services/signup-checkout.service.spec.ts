import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { SignupCheckoutService } from './signup-checkout.service';
import { AuthRepository } from '../repositories/auth.repository';
import { PrismaService } from '@/libs/prisma/prisma.service';
import { StripeService } from '@/stripe/services/stripe.service';
import { EmailService } from '@/email/services/email.service';
import { RolesRepository } from '@/roles/repositories/roles.repository';
import { CandidatePlanType } from '../dto/signup-candidate.dto';
import { CompanyPlanType } from '../dto/signup-company.dto';

// Mock @prisma/client to provide enums
vi.mock('@prisma/client', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@prisma/client')>();
  return {
    ...actual,
    TenantType: {
      CANDIDATE: 'CANDIDATE',
      COMPANY: 'COMPANY',
    },
    RoleType: {
      OWNER: 'OWNER',
      ADMIN: 'ADMIN',
      MANAGER: 'MANAGER',
      MEMBER: 'MEMBER',
      VIEWER: 'VIEWER',
    },
  };
});

describe('SignupCheckoutService', () => {
  let service: SignupCheckoutService;

  const mockAuthRepository = {
    findTenantBySlug: vi.fn(),
    findUserByEmail: vi.fn(),
    createSubscription: vi.fn(),
  };

  const mockPrismaService = {
    plan: {
      findFirst: vi.fn(),
      findUnique: vi.fn(),
    },
    tenant: {
      create: vi.fn(),
    },
    user: {
      create: vi.fn(),
    },
    subscription: {
      update: vi.fn(),
    },
    stripeCheckoutSession: {
      create: vi.fn(),
      update: vi.fn(),
      findFirst: vi.fn(),
      deleteMany: vi.fn(),
    },
  };

  const mockStripeService = {
    createCustomer: vi.fn(),
    createCheckoutSession: vi.fn(),
  };

  const mockEmailService = {
    sendWelcome: vi.fn(),
  };

  const mockRolesRepository = {
    findRoleByName: vi.fn(),
    assignRoleToUser: vi.fn(),
  };

  const mockJwtService = {
    sign: vi.fn(),
  };

  const mockConfigService = {
    get: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SignupCheckoutService,
        { provide: AuthRepository, useValue: mockAuthRepository },
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: StripeService, useValue: mockStripeService },
        { provide: EmailService, useValue: mockEmailService },
        { provide: RolesRepository, useValue: mockRolesRepository },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<SignupCheckoutService>(SignupCheckoutService);
  });

  describe('signupCandidate', () => {
    const candidateDto = {
      name: 'John Doe',
      email: 'john@example.com',
      plan: CandidatePlanType.FREE,
    };

    const mockPlan = {
      id: 'plan-1',
      name: 'FREE',
      price: 0,
      currency: 'BRL',
      billingPeriodDays: 0,
    };

    it('should throw ConflictException if email is already registered', async () => {
      mockAuthRepository.findTenantBySlug.mockResolvedValue({ id: 'existing' });

      await expect(service.signupCandidate(candidateDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should throw NotFoundException if plan is not found', async () => {
      mockAuthRepository.findTenantBySlug.mockResolvedValue(null);
      mockPrismaService.plan.findFirst.mockResolvedValue(null);

      await expect(service.signupCandidate(candidateDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should create FREE candidate account successfully', async () => {
      mockAuthRepository.findTenantBySlug.mockResolvedValue(null);
      mockPrismaService.plan.findFirst.mockResolvedValue(mockPlan);
      mockPrismaService.tenant.create.mockResolvedValue({
        id: 'tenant-1',
        name: 'John Doe',
        slug: 'candidate-abc123',
        type: 'CANDIDATE',
      });
      mockPrismaService.user.create.mockResolvedValue({
        id: 'user-1',
        name: 'John Doe',
        email: 'john@example.com',
        tenantId: 'tenant-1',
      });
      mockAuthRepository.createSubscription.mockResolvedValue({});
      mockJwtService.sign.mockReturnValue('jwt-token');
      mockConfigService.get.mockReturnValue('http://localhost:3000');
      mockEmailService.sendWelcome.mockResolvedValue(undefined);

      const result = await service.signupCandidate(candidateDto);

      expect(result.success).toBe(true);
      expect(result.tenantType).toBe('CANDIDATE');
      expect(result.isFree).toBe(true);
      expect(result.token).toBe('jwt-token');
    });

    it('should create checkout session for PRO plan', async () => {
      const proDto = { ...candidateDto, plan: CandidatePlanType.PRO };
      const proPlan = {
        ...mockPlan,
        name: 'PRO',
        price: 2900,
        stripePriceId: 'price_pro',
      };

      mockAuthRepository.findTenantBySlug.mockResolvedValue(null);
      mockPrismaService.plan.findFirst.mockResolvedValue(proPlan);
      mockStripeService.createCustomer.mockResolvedValue({ id: 'cus_123' });
      mockPrismaService.stripeCheckoutSession.create.mockResolvedValue({});
      mockStripeService.createCheckoutSession.mockResolvedValue({
        url: 'https://checkout.stripe.com/session',
        id: 'cs_123',
      });
      mockPrismaService.stripeCheckoutSession.update.mockResolvedValue({});
      mockConfigService.get.mockReturnValue('http://localhost:3000');

      const result = await service.signupCandidate(proDto);

      expect(result.success).toBe(true);
      expect(result.checkoutUrl).toBeDefined();
    });
  });

  describe('signupCompany', () => {
    const companyDto = {
      companyName: 'Acme Inc',
      domain: 'acme-inc',
      contactName: 'Jane Doe',
      contactEmail: 'jane@acme.com',
      plan: CompanyPlanType.STARTUP,
    };

    const mockPlan = {
      id: 'plan-1',
      name: 'STARTUP',
      price: 9900,
      currency: 'BRL',
      billingPeriodDays: 30,
      stripePriceId: 'price_startup',
    };

    it('should throw ConflictException if domain already exists', async () => {
      mockAuthRepository.findTenantBySlug.mockResolvedValue({ id: 'existing' });

      await expect(service.signupCompany(companyDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should throw ConflictException if email already exists', async () => {
      mockAuthRepository.findTenantBySlug.mockResolvedValue(null);
      mockAuthRepository.findUserByEmail.mockResolvedValue({ id: 'existing' });

      await expect(service.signupCompany(companyDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should throw NotFoundException if plan is not found', async () => {
      mockAuthRepository.findTenantBySlug.mockResolvedValue(null);
      mockAuthRepository.findUserByEmail.mockResolvedValue(null);
      mockPrismaService.plan.findFirst.mockResolvedValue(null);

      await expect(service.signupCompany(companyDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should create checkout session for STARTUP plan', async () => {
      mockAuthRepository.findTenantBySlug.mockResolvedValue(null);
      mockAuthRepository.findUserByEmail.mockResolvedValue(null);
      mockPrismaService.plan.findFirst.mockResolvedValue(mockPlan);
      mockStripeService.createCustomer.mockResolvedValue({ id: 'cus_123' });
      mockPrismaService.stripeCheckoutSession.create.mockResolvedValue({});
      mockStripeService.createCheckoutSession.mockResolvedValue({
        url: 'https://checkout.stripe.com/session',
        id: 'cs_123',
      });
      mockPrismaService.stripeCheckoutSession.update.mockResolvedValue({});
      mockConfigService.get.mockReturnValue('http://localhost:3000');

      const result = await service.signupCompany(companyDto);

      expect(result.success).toBe(true);
      expect(result.checkoutUrl).toBeDefined();
    });

    it('should handle ENTERPRISE plan as commercial request', async () => {
      const enterpriseDto = { ...companyDto, plan: CompanyPlanType.ENTERPRISE };
      const enterprisePlan = { ...mockPlan, name: 'ENTERPRISE', price: 0 };

      mockAuthRepository.findTenantBySlug.mockResolvedValue(null);
      mockAuthRepository.findUserByEmail.mockResolvedValue(null);
      mockPrismaService.plan.findFirst.mockResolvedValue(enterprisePlan);
      mockPrismaService.tenant.create.mockResolvedValue({
        id: 'tenant-1',
        name: 'Acme Inc',
        slug: 'acme-inc',
        type: 'COMPANY',
      });
      mockPrismaService.user.create.mockResolvedValue({
        id: 'user-1',
        name: 'Jane Doe',
        email: 'jane@acme.com',
        tenantId: 'tenant-1',
      });
      mockRolesRepository.findRoleByName.mockResolvedValue({
        id: 'role-owner',
        name: 'OWNER',
      });
      mockRolesRepository.assignRoleToUser.mockResolvedValue({});
      mockAuthRepository.createSubscription.mockResolvedValue({});

      const result = await service.signupCompany(enterpriseDto);

      expect(result.success).toBe(true);
      expect(result.message).toContain('Nossa equipe entrará em contato');
    });
  });

  describe('handleCheckoutCompleted', () => {
    const mockCheckoutData = {
      id: 'checkout-1',
      sessionId: 'cs_123',
      stripeCustomerId: 'cus_123',
      companyName: 'Acme Inc',
      contactName: 'Jane Doe',
      contactEmail: 'jane@acme.com',
      domain: 'acme-inc',
      planId: 'plan-1',
      planName: 'STARTUP',
      completed: false,
    };

    it('should skip if checkout session not found', async () => {
      mockPrismaService.stripeCheckoutSession.findFirst.mockResolvedValue(null);

      await service.handleCheckoutCompleted('cs_unknown');

      expect(mockPrismaService.tenant.create).not.toHaveBeenCalled();
    });

    it('should skip if checkout already completed', async () => {
      mockPrismaService.stripeCheckoutSession.findFirst.mockResolvedValue({
        ...mockCheckoutData,
        completed: true,
      });

      await service.handleCheckoutCompleted('cs_123');

      expect(mockPrismaService.tenant.create).not.toHaveBeenCalled();
    });

    it('should process company checkout successfully', async () => {
      mockPrismaService.stripeCheckoutSession.findFirst.mockResolvedValue(
        mockCheckoutData,
      );
      mockPrismaService.plan.findUnique.mockResolvedValue({
        id: 'plan-1',
        name: 'STARTUP',
        price: 9900,
        billingPeriodDays: 30,
      });
      mockPrismaService.tenant.create.mockResolvedValue({
        id: 'tenant-1',
        name: 'Acme Inc',
        slug: 'acme-inc',
        type: 'COMPANY',
      });
      mockPrismaService.user.create.mockResolvedValue({
        id: 'user-1',
        name: 'Jane Doe',
        email: 'jane@acme.com',
      });
      mockRolesRepository.findRoleByName.mockResolvedValue({
        id: 'role-owner',
        name: 'OWNER',
      });
      mockRolesRepository.assignRoleToUser.mockResolvedValue({});
      mockAuthRepository.createSubscription.mockResolvedValue({});
      mockPrismaService.subscription.update.mockResolvedValue({});
      mockPrismaService.stripeCheckoutSession.update.mockResolvedValue({});
      mockConfigService.get.mockReturnValue('http://localhost:3000');
      mockEmailService.sendWelcome.mockResolvedValue(undefined);

      await service.handleCheckoutCompleted('cs_123');

      expect(mockPrismaService.tenant.create).toHaveBeenCalled();
      expect(mockRolesRepository.assignRoleToUser).toHaveBeenCalled();
    });

    it('should process candidate checkout successfully', async () => {
      const candidateCheckoutData = {
        ...mockCheckoutData,
        domain: 'candidate-abc123',
        companyName: null,
        contactName: 'John Doe',
        contactEmail: 'john@example.com',
      };

      mockPrismaService.stripeCheckoutSession.findFirst.mockResolvedValue(
        candidateCheckoutData,
      );
      mockPrismaService.plan.findUnique.mockResolvedValue({
        id: 'plan-1',
        name: 'PRO',
        price: 2900,
        billingPeriodDays: 30,
      });
      mockAuthRepository.findTenantBySlug.mockResolvedValue(null);
      mockPrismaService.tenant.create.mockResolvedValue({
        id: 'tenant-1',
        name: 'John Doe',
        slug: 'candidate-abc123',
        type: 'CANDIDATE',
      });
      mockPrismaService.user.create.mockResolvedValue({
        id: 'user-1',
        name: 'John Doe',
        email: 'john@example.com',
      });
      mockAuthRepository.createSubscription.mockResolvedValue({});
      mockPrismaService.subscription.update.mockResolvedValue({});
      mockPrismaService.stripeCheckoutSession.update.mockResolvedValue({});
      mockConfigService.get.mockReturnValue('http://localhost:3000');
      mockEmailService.sendWelcome.mockResolvedValue(undefined);

      await service.handleCheckoutCompleted('cs_123');

      expect(mockPrismaService.tenant.create).toHaveBeenCalled();
    });
  });
});
