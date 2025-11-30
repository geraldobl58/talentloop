import {
  Injectable,
  ConflictException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { hash } from 'bcrypt';
import { SubStatus, TenantType } from '@prisma/client';
import { AuthRepository } from '../repositories/auth.repository';
import { PrismaService } from '@/libs/prisma/prisma.service';
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
 * Service responsável pelo cadastro de candidatos e empresas
 *
 * - Candidatos são registrados no tenant "candidates" (compartilhado)
 * - Empresas criam seu próprio tenant isolado
 * - Senhas são enviadas por email após checkout (Stripe) ou imediatamente (planos free/trial)
 */
@Injectable()
export class SignupTenantService {
  private readonly logger = new Logger(SignupTenantService.name);

  // Tenant compartilhado para todos os candidatos
  private readonly CANDIDATES_TENANT_SLUG = 'candidates';

  constructor(
    private readonly authRepository: AuthRepository,
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
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

    // Verificar se já existe um usuário com este email no tenant de candidatos
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

    // Criar o usuário com senha temporária
    const temporaryPassword = this.generateTemporaryPassword();
    const hashedPassword = await hash(temporaryPassword, 10);

    const user = await this.prisma.user.create({
      data: {
        tenantId: candidatesTenant.id,
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

    // Para planos FREE, criar subscription e retornar token
    if (dto.plan === CandidatePlanType.FREE) {
      // Criar ou atualizar subscription do tenant de candidatos
      await this.ensureCandidateSubscription(candidatesTenant.id, plan.id);

      // Gerar token JWT
      const token = this.jwtService.sign({
        sub: user.id,
        email: user.email,
        tenantId: candidatesTenant.id,
        tenantType: TenantType.CANDIDATE,
      });

      this.logger.log('✅ Candidate signup completed (FREE plan)', {
        userId: user.id,
      });

      // TODO: Enviar email de boas-vindas com link para definir senha

      return {
        success: true,
        message: 'Conta criada com sucesso!',
        tenantId: candidatesTenant.id,
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

    // Para planos pagos (PRO, PREMIUM), redirecionar para Stripe
    // TODO: Implementar integração com Stripe checkout
    // Por enquanto, criar com trial de 7 dias

    // Criar ou atualizar subscription
    await this.ensureCandidateSubscription(candidatesTenant.id, plan.id);

    // Gerar token JWT para trial
    const token = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      tenantId: candidatesTenant.id,
      tenantType: TenantType.CANDIDATE,
    });

    this.logger.log('✅ Candidate signup completed (trial)', {
      userId: user.id,
    });

    return {
      success: true,
      message: 'Conta criada com 7 dias de trial!',
      tenantId: candidatesTenant.id,
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
      isFree: false,
      token,
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

    // Verificar se já existe um usuário com este email em qualquer tenant
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

    // Criar o tenant da empresa
    const tenant = await this.prisma.tenant.create({
      data: {
        name: dto.companyName,
        slug: dto.domain,
        type: TenantType.COMPANY,
      },
    });

    // Criar o usuário administrador com senha temporária
    const temporaryPassword = this.generateTemporaryPassword();
    const hashedPassword = await hash(temporaryPassword, 10);

    const user = await this.prisma.user.create({
      data: {
        tenantId: tenant.id,
        name: dto.contactName,
        email: dto.contactEmail,
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

    // Calcular data de expiração do trial (14 dias para empresas)
    const trialDays = 14;
    const expiresAt = new Date(Date.now() + trialDays * 24 * 60 * 60 * 1000);

    // Criar subscription com status ACTIVE (trial)
    await this.authRepository.createSubscription({
      tenantId: tenant.id,
      planId: plan.id,
      status: SubStatus.ACTIVE,
      startedAt: new Date(),
      expiresAt,
    });

    // Para ENTERPRISE, não gerar token - vendedor entrará em contato
    if (dto.plan === CompanyPlanType.ENTERPRISE) {
      this.logger.log(
        '✅ Company signup completed (ENTERPRISE - contact sales)',
        { tenantId: tenant.id },
      );

      // TODO: Notificar time de vendas

      return {
        success: true,
        message:
          'Solicitação recebida! Nossa equipe entrará em contato em breve.',
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
        },
        isTrial: false,
      };
    }

    // Para outros planos (STARTUP, BUSINESS), criar trial e retornar token
    const token = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      tenantId: tenant.id,
      tenantType: TenantType.COMPANY,
    });

    this.logger.log('✅ Company signup completed (trial)', {
      tenantId: tenant.id,
      userId: user.id,
    });

    // TODO: Enviar email de boas-vindas com link para definir senha

    return {
      success: true,
      message: `Conta criada com ${trialDays} dias de trial!`,
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
      },
      isTrial: true,
      token,
    };
  }

  // =============================================
  // HELPERS
  // =============================================

  /**
   * Garante que existe uma subscription para o tenant de candidatos
   */
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
        expiresAt: null, // FREE não expira
      });
    }
  }

  /**
   * Gera uma senha temporária segura
   */
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
}
