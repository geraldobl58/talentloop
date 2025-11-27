import {
  Injectable,
  ConflictException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { hash } from 'bcrypt';
import { SubStatus } from '@prisma/client';
import { AuthRepository } from '../repositories/auth.repository';
import { PrismaService } from '@/libs/prisma/prisma.service';
import { SignupDto, SignupResponseDto } from '../dto/signup.dto';

/**
 * Signup Service
 *
 * Responsabilidades:
 * - Cadastro de novas empresas/tenants
 * - Criação do usuário administrador
 * - Criação da subscription inicial
 *
 * Princípio: Single Responsibility - APENAS signup
 */
@Injectable()
export class SignupService {
  private readonly logger = new Logger(SignupService.name);

  constructor(
    private readonly authRepository: AuthRepository,
    private readonly prisma: PrismaService,
  ) {}

  async signup(dto: SignupDto): Promise<SignupResponseDto> {
    this.logger.log('🚀 Starting signup process', { domain: dto.domain });

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

    return await this.createCompanyDirectly(dto, plan);
  }

  private async createCompanyDirectly(
    dto: SignupDto,
    plan: any,
  ): Promise<SignupResponseDto> {
    // Criar o tenant
    const tenant = await this.authRepository.createTenant({
      name: dto.companyName,
      slug: dto.domain,
    });

    // Criar o usuário administrador
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

    // Calcular data de expiração
    let expiresAt: Date;
    if (plan.name.toUpperCase() === 'TRIAL' && plan.trialDurationHours) {
      expiresAt = new Date(
        Date.now() + plan.trialDurationHours * 60 * 60 * 1000,
      );
    } else {
      expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    }

    // Criar assinatura com status ACTIVE
    await this.authRepository.createSubscription({
      tenantId: tenant.id,
      planId: plan.id,
      status: SubStatus.ACTIVE,
      startedAt: new Date(),
      expiresAt,
    });

    return {
      success: true,
      message:
        'Empresa criada com sucesso. Verifique seu email para acessar sua conta.',
      tenantId: tenant.id,
      tenant: {
        id: tenant.id,
        name: tenant.name,
        slug: tenant.slug,
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
    };
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
    for (let i = password.length; i < 10; i++) {
      password += allChars.charAt(Math.floor(Math.random() * allChars.length));
    }

    return password
      .split('')
      .sort(() => Math.random() - 0.5)
      .join('');
  }
}
