import {
  Injectable,
  ConflictException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { hash } from 'bcrypt';
import { SubStatus, TenantType } from '@prisma/client';
import { AuthRepository } from '../repositories/auth.repository';
import { PrismaService } from '@/libs/prisma/prisma.service';
import { StripeService } from '@/stripe/services/stripe.service';
import { EmailService } from '@/email/services/email.service';
import {
  SignupCandidateDto,
  SignupCandidateResponseDto,
  CandidatePlanType,
} from '../dto/signup-candidate.dto';
import {
  SignupCompanyDto,
  SignupCompanyResponseDto,
  CompanyPlanType,
} from '../dto/signup-company.dto';

/**
 * Service responsável pelo cadastro com integração Stripe
 *
 * Fluxo de Candidatos:
 * - FREE: Cria conta imediatamente e envia email
 * - PRO/PREMIUM: Salva dados temporários, cria checkout Stripe
 *
 * Fluxo de Empresas:
 * - STARTUP/BUSINESS: Salva dados temporários, cria checkout Stripe
 * - ENTERPRISE: Notifica time de vendas
 */
@Injectable()
export class SignupCheckoutService {
  private readonly logger = new Logger(SignupCheckoutService.name);
  private readonly CANDIDATES_TENANT_SLUG = 'candidates';

  constructor(
    private readonly configService: ConfigService,
    private readonly authRepository: AuthRepository,
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly stripeService: StripeService,
    private readonly emailService: EmailService,
  ) {}

  // =============================================
  // SIGNUP DE CANDIDATO
  // =============================================

  async signupCandidate(
    dto: SignupCandidateDto,
  ): Promise<SignupCandidateResponseDto> {
    this.logger.log('🚀 Starting candidate signup', { email: dto.email });

    // Buscar ou criar o tenant de candidatos
    let candidatesTenant = await this.authRepository.findTenantBySlug(
      this.CANDIDATES_TENANT_SLUG,
    );

    if (!candidatesTenant) {
      this.logger.log('Creating candidates tenant...');
      candidatesTenant = await this.prisma.tenant.create({
        data: {
          name: 'Candidatos',
          slug: this.CANDIDATES_TENANT_SLUG,
          type: TenantType.CANDIDATE,
        },
      });
    }

    // Verificar se já existe um usuário com este email
    const existingUser = await this.prisma.user.findUnique({
      where: {
        tenantId_email: {
          tenantId: candidatesTenant.id,
          email: dto.email,
        },
      },
    });

    if (existingUser) {
      throw new ConflictException('Este email já está cadastrado');
    }

    // Buscar o plano escolhido
    const plan = await this.prisma.plan.findFirst({
      where: {
        name: {
          equals: dto.plan,
          mode: 'insensitive',
        },
      },
    });

    if (!plan) {
      throw new NotFoundException(`Plano ${dto.plan} não encontrado`);
    }

    // =============================================
    // PLANO FREE - Criar conta diretamente
    // =============================================
    if (dto.plan === CandidatePlanType.FREE) {
      return this.createFreeCandidateAccount(dto, candidatesTenant.id, plan);
    }

    // =============================================
    // PLANOS PAGOS (PRO, PREMIUM) - Redirecionar para Stripe
    // =============================================
    return this.createCandidateCheckoutSession(dto, candidatesTenant.id, plan);
  }

  /**
   * Cria conta de candidato FREE diretamente
   */
  private async createFreeCandidateAccount(
    dto: SignupCandidateDto,
    tenantId: string,
    plan: any,
  ): Promise<SignupCandidateResponseDto> {
    const temporaryPassword = this.generateTemporaryPassword();
    const hashedPassword = await hash(temporaryPassword, 10);

    const user = await this.prisma.user.create({
      data: {
        tenantId,
        name: dto.name,
        email: dto.email,
        password: hashedPassword,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        tenantId: true,
      },
    });

    // Garantir subscription do tenant
    await this.ensureCandidateSubscription(tenantId, plan.id);

    // Gerar token JWT
    const token = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      tenantId,
      tenantType: TenantType.CANDIDATE,
    });

    // Enviar email de boas-vindas com credenciais
    try {
      const appUrl =
        this.configService.get<string>('APP_URL') || 'http://localhost:3000';
      await this.emailService.sendWelcome({
        to: dto.email,
        userName: dto.name,
        email: dto.email,
        password: temporaryPassword,
        planName: plan.name,
        loginUrl: `${appUrl}/auth/sign-in`,
      });
      this.logger.log('✅ Welcome email sent to candidate', {
        email: dto.email,
      });
    } catch (error) {
      this.logger.error('Failed to send welcome email', error);
      // Não falha o signup se o email não for enviado
    }

    this.logger.log('✅ Candidate FREE account created', { userId: user.id });

    return {
      success: true,
      message: 'Conta criada com sucesso! Verifique seu email para acessar.',
      tenantId,
      tenantType: 'CANDIDATE',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      plan: {
        id: plan.id,
        name: plan.name,
        price: plan.price,
        currency: plan.currency,
      },
      isFree: true,
      token,
    };
  }

  /**
   * Cria sessão de checkout Stripe para candidato com plano pago
   */
  private async createCandidateCheckoutSession(
    dto: SignupCandidateDto,
    tenantId: string,
    plan: any,
  ): Promise<SignupCandidateResponseDto> {
    // Verificar se o plano tem priceId do Stripe configurado
    if (!plan.stripePriceId) {
      throw new NotFoundException(
        `Plano ${plan.name} não está configurado para pagamento`,
      );
    }

    // Deletar sessões de checkout antigas não completadas para este email
    await this.prisma.stripeCheckoutSession.deleteMany({
      where: {
        contactEmail: dto.email,
        completed: false,
      },
    });

    // Criar cliente no Stripe
    const customer = await this.stripeService.createCustomer({
      email: dto.email,
      name: dto.name,
      tenantId,
    });

    // Salvar dados do checkout temporariamente
    const appUrl =
      this.configService.get<string>('APP_URL') || 'http://localhost:3000';
    const successToken = this.generateSuccessToken();

    await this.prisma.stripeCheckoutSession.create({
      data: {
        sessionId: '', // Será atualizado após criar a session
        stripeCustomerId: customer.id,
        companyName: dto.name, // Para candidato, usamos o nome
        contactName: dto.name,
        contactEmail: dto.email,
        domain: null, // Não usado para candidatos
        planId: plan.id,
        planName: plan.name,
        successToken,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 horas
      },
    });

    // Criar sessão de checkout
    const { url, id: sessionId } =
      await this.stripeService.createCheckoutSession(
        plan.stripePriceId,
        customer.id,
        `${appUrl}/auth/success?token=${successToken}`,
        `${appUrl}/auth/sign-up?canceled=true`,
      );

    // Atualizar com o sessionId
    await this.prisma.stripeCheckoutSession.update({
      where: { successToken },
      data: { sessionId },
    });

    this.logger.log('✅ Checkout session created for candidate', {
      email: dto.email,
      plan: plan.name,
    });

    return {
      success: true,
      message: 'Redirecionando para pagamento...',
      checkoutUrl: url,
      plan: {
        id: plan.id,
        name: plan.name,
        price: plan.price,
        currency: plan.currency,
      },
    };
  }

  // =============================================
  // SIGNUP DE EMPRESA
  // =============================================

  async signupCompany(
    dto: SignupCompanyDto,
  ): Promise<SignupCompanyResponseDto> {
    this.logger.log('🚀 Starting company signup', { domain: dto.domain });

    // Verificar se o domínio já existe
    const existingTenant = await this.authRepository.findTenantBySlug(
      dto.domain,
    );
    if (existingTenant) {
      throw new ConflictException('Este domínio já está em uso');
    }

    // Verificar se já existe um usuário com este email
    const existingUser = await this.authRepository.findUserByEmail(
      dto.contactEmail,
    );
    if (existingUser) {
      throw new ConflictException('Este email já está cadastrado');
    }

    // Buscar o plano escolhido
    const plan = await this.prisma.plan.findFirst({
      where: {
        name: {
          equals: dto.plan,
          mode: 'insensitive',
        },
      },
    });

    if (!plan) {
      throw new NotFoundException(`Plano ${dto.plan} não encontrado`);
    }

    // =============================================
    // ENTERPRISE - Contato comercial
    // =============================================
    if (dto.plan === CompanyPlanType.ENTERPRISE) {
      return this.handleEnterpriseRequest(dto, plan);
    }

    // =============================================
    // STARTUP/BUSINESS - Redirecionar para Stripe
    // =============================================
    return this.createCompanyCheckoutSession(dto, plan);
  }

  /**
   * Processa solicitação de plano Enterprise (contato comercial)
   */
  private async handleEnterpriseRequest(
    dto: SignupCompanyDto,
    plan: any,
  ): Promise<SignupCompanyResponseDto> {
    // Criar tenant e usuário para Enterprise (será ativado após contato)
    const tenant = await this.prisma.tenant.create({
      data: {
        name: dto.companyName,
        slug: dto.domain,
        type: TenantType.COMPANY,
      },
    });

    const temporaryPassword = this.generateTemporaryPassword();
    const hashedPassword = await hash(temporaryPassword, 10);

    const user = await this.prisma.user.create({
      data: {
        tenantId: tenant.id,
        name: dto.contactName,
        email: dto.contactEmail,
        password: hashedPassword,
        isActive: false, // Será ativado após contato comercial
      },
      select: {
        id: true,
        name: true,
        email: true,
        tenantId: true,
      },
    });

    // Criar subscription PENDING
    await this.authRepository.createSubscription({
      tenantId: tenant.id,
      planId: plan.id,
      status: SubStatus.PENDING,
      startedAt: new Date(),
      expiresAt: null,
    });

    // TODO: Notificar time de vendas por email

    this.logger.log('✅ Enterprise request created', {
      tenantId: tenant.id,
      companyName: dto.companyName,
    });

    return {
      success: true,
      message:
        'Solicitação recebida! Nossa equipe entrará em contato em até 24 horas.',
      tenantId: tenant.id,
      tenantType: 'COMPANY',
      tenant: {
        id: tenant.id,
        name: tenant.name,
        slug: tenant.slug,
        type: 'COMPANY',
      },
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: 'ADMIN',
      },
      plan: {
        id: plan.id,
        name: plan.name,
        price: plan.price,
        currency: plan.currency,
        billingPeriodDays: plan.billingPeriodDays,
      },
    };
  }

  /**
   * Cria sessão de checkout Stripe para empresa
   */
  private async createCompanyCheckoutSession(
    dto: SignupCompanyDto,
    plan: any,
  ): Promise<SignupCompanyResponseDto> {
    // Verificar se o plano tem priceId do Stripe configurado
    if (!plan.stripePriceId) {
      throw new NotFoundException(
        `Plano ${plan.name} não está configurado para pagamento`,
      );
    }

    // Criar cliente no Stripe
    const customer = await this.stripeService.createCustomer({
      email: dto.contactEmail,
      name: dto.companyName,
      tenantId: dto.domain, // Usar domain como identificador temporário
    });

    // Salvar dados do checkout temporariamente
    const appUrl =
      this.configService.get<string>('APP_URL') || 'http://localhost:3000';
    const successToken = this.generateSuccessToken();

    await this.prisma.stripeCheckoutSession.create({
      data: {
        sessionId: '', // Será atualizado após criar a session
        stripeCustomerId: customer.id,
        companyName: dto.companyName,
        contactName: dto.contactName,
        contactEmail: dto.contactEmail,
        domain: dto.domain,
        planId: plan.id,
        planName: plan.name,
        successToken,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 horas
      },
    });

    // Criar sessão de checkout
    const { url, id: sessionId } =
      await this.stripeService.createCheckoutSession(
        plan.stripePriceId,
        customer.id,
        `${appUrl}/auth/success?token=${successToken}`,
        `${appUrl}/auth/sign-up?canceled=true`,
      );

    // Atualizar com o sessionId
    await this.prisma.stripeCheckoutSession.update({
      where: { successToken },
      data: { sessionId },
    });

    this.logger.log('✅ Checkout session created for company', {
      domain: dto.domain,
      plan: plan.name,
    });

    return {
      success: true,
      message: 'Redirecionando para pagamento...',
      checkoutUrl: url,
      plan: {
        id: plan.id,
        name: plan.name,
        price: plan.price,
        currency: plan.currency,
        billingPeriodDays: plan.billingPeriodDays,
      },
    };
  }

  // =============================================
  // WEBHOOK - Processar pagamento concluído
  // =============================================

  /**
   * Processa checkout completado (chamado pelo webhook)
   */
  async handleCheckoutCompleted(sessionId: string): Promise<void> {
    this.logger.log('Processing checkout completed', { sessionId });

    // Buscar dados da sessão salva
    const checkoutData = await this.prisma.stripeCheckoutSession.findFirst({
      where: { sessionId },
    });

    if (!checkoutData) {
      this.logger.error('Checkout session not found', { sessionId });
      return;
    }

    if (checkoutData.completed) {
      this.logger.log('Checkout already processed', { sessionId });
      return;
    }

    // Buscar plano
    const plan = await this.prisma.plan.findUnique({
      where: { id: checkoutData.planId },
    });

    if (!plan) {
      this.logger.error('Plan not found', { planId: checkoutData.planId });
      return;
    }

    // Verificar se é candidato ou empresa
    // Candidatos têm domain null ou igual ao slug de candidatos
    const isCandidate =
      !checkoutData.domain ||
      checkoutData.domain === this.CANDIDATES_TENANT_SLUG;

    this.logger.log('Processing signup', {
      isCandidate,
      domain: checkoutData.domain,
      email: checkoutData.contactEmail,
    });

    if (isCandidate) {
      await this.completeCandidateSignup(checkoutData, plan);
    } else {
      await this.completeCompanySignup(checkoutData, plan);
    }

    // Marcar como completado
    await this.prisma.stripeCheckoutSession.update({
      where: { id: checkoutData.id },
      data: {
        completed: true,
        completedAt: new Date(),
      },
    });

    this.logger.log('✅ Checkout completed and account created', { sessionId });
  }

  /**
   * Completa signup de candidato após pagamento
   */
  private async completeCandidateSignup(
    checkoutData: any,
    plan: any,
  ): Promise<void> {
    // Buscar tenant de candidatos
    let candidatesTenant = await this.authRepository.findTenantBySlug(
      this.CANDIDATES_TENANT_SLUG,
    );

    if (!candidatesTenant) {
      candidatesTenant = await this.prisma.tenant.create({
        data: {
          name: 'Candidatos',
          slug: this.CANDIDATES_TENANT_SLUG,
          type: TenantType.CANDIDATE,
        },
      });
    }

    // Criar usuário
    const temporaryPassword = this.generateTemporaryPassword();
    const hashedPassword = await hash(temporaryPassword, 10);

    const user = await this.prisma.user.create({
      data: {
        tenantId: candidatesTenant.id,
        name: checkoutData.contactName,
        email: checkoutData.contactEmail,
        password: hashedPassword,
        isActive: true,
      },
    });

    // Atualizar/criar subscription
    const existingSubscription = await this.prisma.subscription.findUnique({
      where: { tenantId: candidatesTenant.id },
    });

    if (existingSubscription) {
      await this.prisma.subscription.update({
        where: { tenantId: candidatesTenant.id },
        data: {
          planId: plan.id,
          stripeCustomerId: checkoutData.stripeCustomerId,
          status: SubStatus.ACTIVE,
        },
      });
    } else {
      // Calcular data de expiração baseado no billingPeriodDays do plano
      const expiresAt =
        plan.billingPeriodDays > 0
          ? new Date(Date.now() + plan.billingPeriodDays * 24 * 60 * 60 * 1000)
          : null; // FREE plans don't expire

      await this.authRepository.createSubscription({
        tenantId: candidatesTenant.id,
        planId: plan.id,
        status: SubStatus.ACTIVE,
        startedAt: new Date(),
        expiresAt,
      });
    }

    // Enviar email com credenciais
    try {
      const appUrl =
        this.configService.get<string>('APP_URL') || 'http://localhost:3000';
      await this.emailService.sendWelcome({
        to: checkoutData.contactEmail,
        userName: checkoutData.contactName,
        email: checkoutData.contactEmail,
        password: temporaryPassword,
        planName: plan.name,
        loginUrl: `${appUrl}/auth/sign-in`,
      });
    } catch (error) {
      this.logger.error('Failed to send welcome email', error);
    }

    this.logger.log('✅ Candidate account created after payment', {
      userId: user.id,
      email: checkoutData.contactEmail,
    });
  }

  /**
   * Completa signup de empresa após pagamento
   */
  private async completeCompanySignup(
    checkoutData: any,
    plan: any,
  ): Promise<void> {
    // Criar tenant
    const tenant = await this.prisma.tenant.create({
      data: {
        name: checkoutData.companyName,
        slug: checkoutData.domain,
        type: TenantType.COMPANY,
      },
    });

    // Criar usuário admin
    const temporaryPassword = this.generateTemporaryPassword();
    const hashedPassword = await hash(temporaryPassword, 10);

    await this.prisma.user.create({
      data: {
        tenantId: tenant.id,
        name: checkoutData.contactName,
        email: checkoutData.contactEmail,
        password: hashedPassword,
        isActive: true,
      },
    });

    // Calcular data de expiração baseado no billingPeriodDays do plano
    const expiresAt =
      plan.billingPeriodDays > 0
        ? new Date(Date.now() + plan.billingPeriodDays * 24 * 60 * 60 * 1000)
        : null;

    // Criar subscription
    await this.authRepository.createSubscription({
      tenantId: tenant.id,
      planId: plan.id,
      status: SubStatus.ACTIVE,
      startedAt: new Date(),
      expiresAt,
    });

    // Atualizar subscription com dados do Stripe
    await this.prisma.subscription.update({
      where: { tenantId: tenant.id },
      data: {
        stripeCustomerId: checkoutData.stripeCustomerId,
      },
    });

    // Enviar email com credenciais
    try {
      const appUrl =
        this.configService.get<string>('APP_URL') || 'http://localhost:3000';
      await this.emailService.sendWelcome({
        to: checkoutData.contactEmail,
        userName: checkoutData.contactName,
        email: checkoutData.contactEmail,
        password: temporaryPassword,
        planName: plan.name,
        loginUrl: `${appUrl}/auth/sign-in?tenant=${checkoutData.domain}`,
        companyName: checkoutData.companyName,
        tenantId: checkoutData.domain,
      });
    } catch (error) {
      this.logger.error('Failed to send welcome email', error);
    }

    this.logger.log('✅ Company account created after payment', {
      tenantId: tenant.id,
      companyName: checkoutData.companyName,
    });
  }

  // =============================================
  // HELPERS
  // =============================================

  private async ensureCandidateSubscription(
    tenantId: string,
    planId: string,
  ): Promise<void> {
    const existingSubscription = await this.prisma.subscription.findUnique({
      where: { tenantId },
    });

    if (!existingSubscription) {
      await this.authRepository.createSubscription({
        tenantId,
        planId,
        status: SubStatus.ACTIVE,
        startedAt: new Date(),
        expiresAt: null,
      });
    }
  }

  private generateTemporaryPassword(): string {
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const symbols = '!@#$%&*';

    let password = '';
    password += uppercase.charAt(Math.floor(Math.random() * uppercase.length));
    password += lowercase.charAt(Math.floor(Math.random() * lowercase.length));
    password += numbers.charAt(Math.floor(Math.random() * numbers.length));
    password += symbols.charAt(Math.floor(Math.random() * symbols.length));

    const allChars = uppercase + lowercase + numbers + symbols;
    for (let i = password.length; i < 12; i++) {
      password += allChars.charAt(Math.floor(Math.random() * allChars.length));
    }

    return password
      .split('')
      .sort(() => Math.random() - 0.5)
      .join('');
  }

  private generateSuccessToken(): string {
    return `success_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  }
}
