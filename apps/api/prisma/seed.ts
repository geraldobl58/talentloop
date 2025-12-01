import { PrismaClient, RoleType, TenantType } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// Helper function to hash password
async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

// Helper to generate backup codes
function generateBackupCodes(count: number = 8): string[] {
  const codes: string[] = [];
  for (let i = 0; i < count; i++) {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    codes.push(code);
  }
  return codes;
}

async function main() {
  console.log('🌱 Starting database seed...');

  // Clear existing data (order matters due to foreign keys)
  await prisma.emailLog.deleteMany();
  console.log('Cleared existing email logs');

  await prisma.passwordReset.deleteMany();
  console.log('Cleared existing password resets');

  await prisma.userRole.deleteMany();
  console.log('Cleared existing user roles');

  await prisma.rolePermission.deleteMany();
  console.log('Cleared existing role permissions');

  await prisma.user.deleteMany();
  console.log('Cleared existing users');

  await prisma.subscription.deleteMany();
  console.log('Cleared existing subscriptions');

  await prisma.stripeCheckoutSession.deleteMany();
  console.log('Cleared existing checkout sessions');

  await prisma.tenant.deleteMany();
  console.log('Cleared existing tenants');

  await prisma.plan.deleteMany();
  console.log('Cleared existing plans');

  await prisma.permission.deleteMany();
  console.log('Cleared existing permissions');

  await prisma.role.deleteMany();
  console.log('Cleared existing roles');

  // ============================
  // Create Roles
  // ============================
  const ownerRole = await prisma.role.create({
    data: {
      name: RoleType.OWNER,
      description: 'Proprietário do tenant - acesso total',
      isSystem: true,
    },
  });
  console.log('✅ Created OWNER role:', ownerRole.id);

  const adminRole = await prisma.role.create({
    data: {
      name: RoleType.ADMIN,
      description: 'Administrador - gerencia usuários e configurações',
      isSystem: true,
    },
  });
  console.log('✅ Created ADMIN role:', adminRole.id);

  const managerRole = await prisma.role.create({
    data: {
      name: RoleType.MANAGER,
      description: 'Gerente - acesso a relatórios e configurações limitadas',
      isSystem: true,
    },
  });
  console.log('✅ Created MANAGER role:', managerRole.id);

  const memberRole = await prisma.role.create({
    data: {
      name: RoleType.MEMBER,
      description: 'Membro - acesso básico às funcionalidades',
      isSystem: true,
    },
  });
  console.log('✅ Created MEMBER role:', memberRole.id);

  const viewerRole = await prisma.role.create({
    data: {
      name: RoleType.VIEWER,
      description: 'Visualizador - apenas leitura',
      isSystem: true,
    },
  });
  console.log('✅ Created VIEWER role:', viewerRole.id);

  // ============================
  // Create Permissions
  // ============================
  const permissionsData = [
    // Jobs
    {
      name: 'jobs:read',
      module: 'jobs',
      action: 'read',
      description: 'Visualizar vagas',
    },
    {
      name: 'jobs:write',
      module: 'jobs',
      action: 'write',
      description: 'Criar e editar vagas',
    },
    {
      name: 'jobs:delete',
      module: 'jobs',
      action: 'delete',
      description: 'Excluir vagas',
    },
    // Applications
    {
      name: 'applications:read',
      module: 'applications',
      action: 'read',
      description: 'Visualizar candidaturas',
    },
    {
      name: 'applications:write',
      module: 'applications',
      action: 'write',
      description: 'Criar e editar candidaturas',
    },
    {
      name: 'applications:delete',
      module: 'applications',
      action: 'delete',
      description: 'Excluir candidaturas',
    },
    // Profile
    {
      name: 'profile:read',
      module: 'profile',
      action: 'read',
      description: 'Visualizar perfil',
    },
    {
      name: 'profile:write',
      module: 'profile',
      action: 'write',
      description: 'Editar perfil',
    },
    // Users (team management)
    {
      name: 'users:read',
      module: 'users',
      action: 'read',
      description: 'Visualizar usuários do time',
    },
    {
      name: 'users:write',
      module: 'users',
      action: 'write',
      description: 'Criar e editar usuários',
    },
    {
      name: 'users:delete',
      module: 'users',
      action: 'delete',
      description: 'Remover usuários',
    },
    {
      name: 'users:manage',
      module: 'users',
      action: 'manage',
      description: 'Gerenciar roles de usuários',
    },
    // Settings
    {
      name: 'settings:read',
      module: 'settings',
      action: 'read',
      description: 'Visualizar configurações',
    },
    {
      name: 'settings:write',
      module: 'settings',
      action: 'write',
      description: 'Editar configurações',
    },
    // Subscription/Billing
    {
      name: 'billing:read',
      module: 'billing',
      action: 'read',
      description: 'Visualizar faturamento',
    },
    {
      name: 'billing:manage',
      module: 'billing',
      action: 'manage',
      description: 'Gerenciar assinatura',
    },
    // AutoApply
    {
      name: 'autoapply:read',
      module: 'autoapply',
      action: 'read',
      description: 'Visualizar AutoApply',
    },
    {
      name: 'autoapply:write',
      module: 'autoapply',
      action: 'write',
      description: 'Configurar AutoApply',
    },
    // Recruiter CRM
    {
      name: 'recruiter:read',
      module: 'recruiter',
      action: 'read',
      description: 'Visualizar contatos de recrutadores',
    },
    {
      name: 'recruiter:write',
      module: 'recruiter',
      action: 'write',
      description: 'Gerenciar contatos de recrutadores',
    },
    // Reports
    {
      name: 'reports:read',
      module: 'reports',
      action: 'read',
      description: 'Visualizar relatórios',
    },
    {
      name: 'reports:export',
      module: 'reports',
      action: 'export',
      description: 'Exportar relatórios',
    },
  ];

  const permissions = await Promise.all(
    permissionsData.map((p) => prisma.permission.create({ data: p })),
  );
  console.log(`✅ Created ${permissions.length} permissions`);

  // ============================
  // Assign Permissions to Roles
  // ============================
  const allPermissionIds = permissions.map((p) => p.id);

  // OWNER - todas as permissões
  await prisma.rolePermission.createMany({
    data: allPermissionIds.map((permissionId) => ({
      roleId: ownerRole.id,
      permissionId,
    })),
  });
  console.log('✅ Assigned all permissions to OWNER');

  // ADMIN - todas exceto billing:manage
  const adminPermissions = permissions.filter(
    (p) => p.name !== 'billing:manage',
  );
  await prisma.rolePermission.createMany({
    data: adminPermissions.map((p) => ({
      roleId: adminRole.id,
      permissionId: p.id,
    })),
  });
  console.log('✅ Assigned permissions to ADMIN');

  // MANAGER - read + reports + some write
  const managerPermissions = permissions.filter(
    (p) =>
      p.action === 'read' ||
      p.name.startsWith('reports:') ||
      ['applications:write', 'autoapply:write', 'recruiter:write'].includes(
        p.name,
      ),
  );
  await prisma.rolePermission.createMany({
    data: managerPermissions.map((p) => ({
      roleId: managerRole.id,
      permissionId: p.id,
    })),
  });
  console.log('✅ Assigned permissions to MANAGER');

  // MEMBER - básico (jobs, applications, profile, autoapply, recruiter)
  const memberPermissions = permissions.filter(
    (p) =>
      ['jobs', 'applications', 'profile', 'autoapply', 'recruiter'].includes(
        p.module,
      ) && ['read', 'write'].includes(p.action),
  );
  await prisma.rolePermission.createMany({
    data: memberPermissions.map((p) => ({
      roleId: memberRole.id,
      permissionId: p.id,
    })),
  });
  console.log('✅ Assigned permissions to MEMBER');

  // VIEWER - apenas leitura
  const viewerPermissions = permissions.filter((p) => p.action === 'read');
  await prisma.rolePermission.createMany({
    data: viewerPermissions.map((p) => ({
      roleId: viewerRole.id,
      permissionId: p.id,
    })),
  });
  console.log('✅ Assigned permissions to VIEWER');

  // ============================
  // Create Plans - Candidatos (B2C)
  // ============================
  console.log('\n📋 Creating plans...');

  const freePlan = await prisma.plan.create({
    data: {
      name: 'FREE',
      price: 0,
      currency: 'BRL',
      description: 'Para começar sua busca de emprego',
      maxUsers: 1,
      maxContacts: 10,
      hasAPI: false,
      trialDurationHours: null, // Não tem trial, é grátis para sempre
      maxJobsPerDay: 100,
      maxApplicationsPerDay: 10,
      maxAutoApplyPerDay: 0,
      hasAIMatching: true, // AI Matching básico
      hasAutoApply: false,
      hasRecruiterCRM: false,
      hasPrioritySupport: false,
      stripeProductId: 'prod_TWH5l9Ezml8H6n',
      stripePriceId: 'price_1SZEWvAB7ykXDk2oTeCN16KS',
      stripeLookupKey: 'candidate_free',
    },
  });
  console.log('✅ Created FREE plan:', freePlan.id);

  const proPlan = await prisma.plan.create({
    data: {
      name: 'PRO',
      price: 29,
      currency: 'BRL',
      description: 'Para candidatos que querem se destacar',
      maxUsers: 1,
      maxContacts: 100,
      hasAPI: false,
      trialDurationHours: 168, // 7 dias de trial
      maxJobsPerDay: null, // Ilimitado
      maxApplicationsPerDay: 50,
      maxAutoApplyPerDay: 10,
      hasAIMatching: true,
      hasAutoApply: true,
      hasRecruiterCRM: false,
      hasPrioritySupport: false,
      stripeProductId: 'prod_TWH5l9Ezml8H6n',
      stripePriceId: 'price_1SZEWvAB7ykXDk2oAWvBm0pU',
      stripeLookupKey: 'candidate_pro',
    },
  });
  console.log('✅ Created PRO plan:', proPlan.id);

  const premiumPlan = await prisma.plan.create({
    data: {
      name: 'PREMIUM',
      price: 79,
      currency: 'BRL',
      description: 'Máximo poder na sua busca de emprego',
      maxUsers: 1,
      maxContacts: null, // Ilimitado
      hasAPI: true,
      trialDurationHours: 168, // 7 dias de trial
      maxJobsPerDay: null, // Ilimitado
      maxApplicationsPerDay: null, // Ilimitado
      maxAutoApplyPerDay: 30,
      hasAIMatching: true,
      hasAutoApply: true,
      hasRecruiterCRM: true,
      hasPrioritySupport: true,
      stripeProductId: 'prod_TWH5l9Ezml8H6n',
      stripePriceId: 'price_1SZEWvAB7ykXDk2owzhjQzs0',
      stripeLookupKey: 'candidate_premium',
    },
  });
  console.log('✅ Created PREMIUM plan:', premiumPlan.id);

  // ============================
  // Create Plans - Empresas (B2B)
  // ============================
  const startupPlan = await prisma.plan.create({
    data: {
      name: 'STARTUP',
      price: 299,
      currency: 'BRL',
      description: 'Para startups e pequenas empresas',
      maxUsers: 5,
      maxContacts: 500,
      hasAPI: false,
      trialDurationHours: 336, // 14 dias de trial
      maxJobsPerDay: 100,
      maxApplicationsPerDay: null, // N/A para empresas
      maxAutoApplyPerDay: null, // N/A para empresas
      hasAIMatching: true,
      hasAutoApply: false,
      hasRecruiterCRM: true,
      hasPrioritySupport: false,
      stripeProductId: 'prod_TWH3Ia3hFX25yw',
      stripePriceId: 'price_1SZEUzAB7ykXDk2orH9Sz09y',
      stripeLookupKey: 'company_startup',
    },
  });
  console.log('✅ Created STARTUP plan:', startupPlan.id);

  const businessPlan = await prisma.plan.create({
    data: {
      name: 'BUSINESS',
      price: 799,
      currency: 'BRL',
      description: 'Para empresas em crescimento',
      maxUsers: 20,
      maxContacts: 2000,
      hasAPI: true,
      trialDurationHours: 336, // 14 dias de trial
      maxJobsPerDay: null, // Ilimitado
      maxApplicationsPerDay: null,
      maxAutoApplyPerDay: null,
      hasAIMatching: true,
      hasAutoApply: false,
      hasRecruiterCRM: true,
      hasPrioritySupport: true,
      stripeProductId: 'prod_TWH3Ia3hFX25yw',
      stripePriceId: 'price_1SZEUzAB7ykXDk2oQD2D6rse',
      stripeLookupKey: 'company_business',
    },
  });
  console.log('✅ Created BUSINESS plan:', businessPlan.id);

  const enterprisePlan = await prisma.plan.create({
    data: {
      name: 'ENTERPRISE',
      price: 1399,
      currency: 'BRL',
      description: 'Solução customizada para grandes empresas',
      maxUsers: null, // Ilimitado
      maxContacts: null, // Ilimitado
      hasAPI: true,
      trialDurationHours: null, // Sem trial - contato comercial
      maxJobsPerDay: null,
      maxApplicationsPerDay: null,
      maxAutoApplyPerDay: null,
      hasAIMatching: true,
      hasAutoApply: false,
      hasRecruiterCRM: true,
      hasPrioritySupport: true,
      stripeProductId: 'prod_TWH3Ia3hFX25yw',
      stripePriceId: 'price_1SZEUzAB7ykXDk2oVh6L5gkT',
      stripeLookupKey: 'company_enterprise',
    },
  });
  console.log('✅ Created ENTERPRISE plan:', enterprisePlan.id);

  // Legacy plans for compatibility
  const trialPlan = await prisma.plan.create({
    data: {
      name: 'TRIAL',
      price: 0,
      currency: 'BRL',
      description: 'Experimente grátis por 7 dias (legado)',
      maxUsers: 1,
      maxContacts: 10,
      hasAPI: false,
      trialDurationHours: 168, // 7 dias
      maxJobsPerDay: 20,
      maxApplicationsPerDay: 5,
      maxAutoApplyPerDay: 0,
      hasAIMatching: false,
      hasAutoApply: false,
      hasRecruiterCRM: false,
      hasPrioritySupport: false,
      stripeProductId: null,
      stripePriceId: null,
    },
  });
  console.log('✅ Created TRIAL plan (legacy):', trialPlan.id);

  const starterPlan = await prisma.plan.create({
    data: {
      name: 'STARTER',
      price: 149.99,
      currency: 'BRL',
      description: 'Perfeito para começar sua busca (legado)',
      maxUsers: 1,
      maxContacts: 50,
      hasAPI: false,
      maxJobsPerDay: 50,
      maxApplicationsPerDay: 20,
      maxAutoApplyPerDay: 5,
      hasAIMatching: true,
      hasAutoApply: false,
      hasRecruiterCRM: false,
      hasPrioritySupport: false,
      stripeProductId: 'prod_TClbVFQhJS1ZOD',
      stripePriceId: 'price_1SGM3uAB7ykXDk2oUJravQQK',
    },
  });
  console.log('✅ Created STARTER plan (legacy):', starterPlan.id);

  const professionalPlan = await prisma.plan.create({
    data: {
      name: 'PROFESSIONAL',
      price: 299.99,
      currency: 'BRL',
      description: 'Para quem quer acelerar a carreira (legado)',
      maxUsers: 1,
      maxContacts: 200,
      hasAPI: true,
      maxJobsPerDay: 100,
      maxApplicationsPerDay: 50,
      maxAutoApplyPerDay: 20,
      hasAIMatching: true,
      hasAutoApply: true,
      hasRecruiterCRM: true,
      hasPrioritySupport: false,
      stripeProductId: 'prod_TClbELPL9wiScE',
      stripePriceId: 'price_1SGM4CAB7ykXDk2ow5PfFVyb',
    },
  });
  console.log('✅ Created PROFESSIONAL plan (legacy):', professionalPlan.id);

  // ============================
  // Create Test Tenants & Users
  // ============================

  // ============================
  // CANDIDATOS (Tenant Type: CANDIDATE)
  // ============================
  console.log('\n📝 Creating CANDIDATE tenants...');

  // Candidate Tenant 1: Default candidates tenant (for login without tenantId)
  const candidatesTenant = await prisma.tenant.create({
    data: {
      name: 'Candidatos TalentLoop',
      slug: 'candidates',
      type: TenantType.CANDIDATE,
    },
  });
  console.log('✅ Created Candidates Tenant:', candidatesTenant.id);

  // Candidate 1: Basic user
  const candidate1 = await prisma.user.create({
    data: {
      tenantId: candidatesTenant.id,
      name: 'Felipe Developer',
      email: 'felipe@gmail.com',
      password: await hashPassword('SenhaForte123!@#'),
      isActive: true,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=felipe',
      twoFactorEnabled: false,
    },
  });
  console.log('✅ Created Candidate 1 (Felipe):', candidate1.id);

  await prisma.userRole.create({
    data: {
      userId: candidate1.id,
      roleId: memberRole.id,
      tenantId: candidatesTenant.id,
      assignedBy: 'system',
    },
  });

  // Candidate 2: User with 2FA
  const candidate2 = await prisma.user.create({
    data: {
      tenantId: candidatesTenant.id,
      name: 'Juliana Backend',
      email: 'juliana@hotmail.com',
      password: await hashPassword('SenhaForte123!@#'),
      isActive: true,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=juliana',
      twoFactorEnabled: true,
      twoFactorSecret: 'JBSWY3DPEBLW64TMMQ======',
      twoFactorBackupCodes: generateBackupCodes(),
    },
  });
  console.log('✅ Created Candidate 2 (Juliana with 2FA):', candidate2.id);

  await prisma.userRole.create({
    data: {
      userId: candidate2.id,
      roleId: memberRole.id,
      tenantId: candidatesTenant.id,
      assignedBy: 'system',
    },
  });

  // Candidate 3: Full Stack Developer
  const candidate3 = await prisma.user.create({
    data: {
      tenantId: candidatesTenant.id,
      name: 'Ricardo Frontend',
      email: 'ricardo@yahoo.com',
      password: await hashPassword('SenhaForte123!@#'),
      isActive: true,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ricardo',
      twoFactorEnabled: false,
    },
  });
  console.log('✅ Created Candidate 3 (Ricardo):', candidate3.id);

  await prisma.userRole.create({
    data: {
      userId: candidate3.id,
      roleId: memberRole.id,
      tenantId: candidatesTenant.id,
      assignedBy: 'system',
    },
  });

  // Candidate 4: Inactive candidate
  const candidate4 = await prisma.user.create({
    data: {
      tenantId: candidatesTenant.id,
      name: 'Amanda Designer',
      email: 'amanda@outlook.com',
      password: await hashPassword('SenhaForte123!@#'),
      isActive: false,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=amanda',
      twoFactorEnabled: false,
    },
  });
  console.log('✅ Created Candidate 4 (Amanda - Inactive):', candidate4.id);

  await prisma.userRole.create({
    data: {
      userId: candidate4.id,
      roleId: memberRole.id,
      tenantId: candidatesTenant.id,
      assignedBy: 'system',
    },
  });

  // Subscription for candidates tenant (Trial)
  const candidatesSubscription = await prisma.subscription.create({
    data: {
      tenantId: candidatesTenant.id,
      planId: trialPlan.id,
      status: 'ACTIVE',
      startedAt: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days trial
      stripeCustomerId: null,
      stripeSubscriptionId: null,
    },
  });
  console.log('✅ Created Candidates Subscription:', candidatesSubscription.id);

  // ============================
  // EMPRESAS (Tenant Type: COMPANY)
  // ============================
  console.log('\n🏢 Creating COMPANY tenants...');

  // Company Tenant 1: Startup Company - Active with PROFESSIONAL plan
  const tenant1 = await prisma.tenant.create({
    data: {
      name: 'Tech Startup Co',
      slug: 'tech-startup-co',
      type: TenantType.COMPANY,
    },
  });
  console.log('✅ Created Company Tenant 1:', tenant1.id);

  const user1 = await prisma.user.create({
    data: {
      tenantId: tenant1.id,
      name: 'João Silva',
      email: 'joao@techstartup.com',
      password: await hashPassword('SenhaForte123!@#'),
      isActive: true,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=joao',
      twoFactorEnabled: false,
    },
  });
  console.log('✅ Created User 1 (João):', user1.id);

  // Assign OWNER role to João
  await prisma.userRole.create({
    data: {
      userId: user1.id,
      roleId: ownerRole.id,
      tenantId: tenant1.id,
      assignedBy: 'system',
    },
  });

  const user2 = await prisma.user.create({
    data: {
      tenantId: tenant1.id,
      name: 'Maria Santos',
      email: 'maria@techstartup.com',
      password: await hashPassword('SenhaForte123!@#'),
      isActive: true,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=maria',
      twoFactorEnabled: true,
      twoFactorSecret: 'JBSWY3DPEBLW64TMMQ======',
      twoFactorBackupCodes: generateBackupCodes(),
    },
  });
  console.log('✅ Created User 2 (Maria with 2FA):', user2.id);

  // Assign ADMIN role to Maria
  await prisma.userRole.create({
    data: {
      userId: user2.id,
      roleId: adminRole.id,
      tenantId: tenant1.id,
      assignedBy: user1.id,
    },
  });

  const subscription1 = await prisma.subscription.create({
    data: {
      tenantId: tenant1.id,
      planId: professionalPlan.id,
      status: 'ACTIVE',
      startedAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // 90 days ago
      expiresAt: new Date(Date.now() + 275 * 24 * 60 * 60 * 1000), // 275 days from now
      stripeCustomerId: 'cus_test_startup',
      stripeSubscriptionId: 'sub_test_startup_prof',
    },
  });
  console.log('✅ Created Subscription 1 (Tech Startup):', subscription1.id);

  // Test Tenant 2: Small Business - Active with STARTER plan
  const tenant2 = await prisma.tenant.create({
    data: {
      name: 'Digital Agency',
      slug: 'digital-agency',
      type: TenantType.COMPANY,
    },
  });
  console.log('✅ Created Company Tenant 2:', tenant2.id);

  const user3 = await prisma.user.create({
    data: {
      tenantId: tenant2.id,
      name: 'Carlos Mendes',
      email: 'carlos@digitalagency.com',
      password: await hashPassword('SenhaForte123!@#'),
      isActive: true,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=carlos',
      twoFactorEnabled: false,
    },
  });
  console.log('✅ Created User 3 (Carlos):', user3.id);

  // Assign OWNER role to Carlos
  await prisma.userRole.create({
    data: {
      userId: user3.id,
      roleId: ownerRole.id,
      tenantId: tenant2.id,
      assignedBy: 'system',
    },
  });

  const subscription2 = await prisma.subscription.create({
    data: {
      tenantId: tenant2.id,
      planId: starterPlan.id,
      status: 'ACTIVE',
      startedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      expiresAt: new Date(Date.now() + 335 * 24 * 60 * 60 * 1000), // 335 days from now
      stripeCustomerId: 'cus_test_agency',
      stripeSubscriptionId: 'sub_test_agency_starter',
    },
  });
  console.log('✅ Created Subscription 2 (Digital Agency):', subscription2.id);

  // Test Tenant 3: Enterprise - Active with ENTERPRISE plan
  const tenant3 = await prisma.tenant.create({
    data: {
      name: 'Enterprise Corp',
      slug: 'enterprise-corp',
      type: TenantType.COMPANY,
    },
  });
  console.log('✅ Created Company Tenant 3:', tenant3.id);

  const user4 = await prisma.user.create({
    data: {
      tenantId: tenant3.id,
      name: 'Ana Costa',
      email: 'ana@enterprisecorp.com',
      password: await hashPassword('SenhaForte123!@#'),
      isActive: true,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ana',
      twoFactorEnabled: true,
      twoFactorSecret: 'JBSWY3DPEBLW64TMMQ======',
      twoFactorBackupCodes: generateBackupCodes(),
    },
  });
  console.log('✅ Created User 4 (Ana with 2FA):', user4.id);

  // Assign OWNER role to Ana
  await prisma.userRole.create({
    data: {
      userId: user4.id,
      roleId: ownerRole.id,
      tenantId: tenant3.id,
      assignedBy: 'system',
    },
  });

  const user5 = await prisma.user.create({
    data: {
      tenantId: tenant3.id,
      name: 'Roberto Gomes',
      email: 'roberto@enterprisecorp.com',
      password: await hashPassword('SenhaForte123!@#'),
      isActive: false,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=roberto',
      twoFactorEnabled: false,
    },
  });
  console.log('✅ Created User 5 (Roberto - Inactive):', user5.id);

  // Assign MEMBER role to Roberto
  await prisma.userRole.create({
    data: {
      userId: user5.id,
      roleId: memberRole.id,
      tenantId: tenant3.id,
      assignedBy: user4.id,
    },
  });

  const subscription3 = await prisma.subscription.create({
    data: {
      tenantId: tenant3.id,
      planId: enterprisePlan.id,
      status: 'ACTIVE',
      startedAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000), // 1 year ago
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
      stripeCustomerId: 'cus_test_enterprise',
      stripeSubscriptionId: 'sub_test_enterprise_ent',
    },
  });
  console.log('✅ Created Subscription 3 (Enterprise Corp):', subscription3.id);

  // Test Tenant 4: Past Due - Subscription expired
  const tenant4 = await prisma.tenant.create({
    data: {
      name: 'Overdue Business',
      slug: 'overdue-business',
      type: TenantType.COMPANY,
    },
  });
  console.log('✅ Created Company Tenant 4:', tenant4.id);

  const user6 = await prisma.user.create({
    data: {
      tenantId: tenant4.id,
      name: 'Pedro Oliveira',
      email: 'pedro@overduebiz.com',
      password: await hashPassword('SenhaForte123!@#'),
      isActive: true,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=pedro',
      twoFactorEnabled: false,
    },
  });
  console.log('✅ Created User 6 (Pedro):', user6.id);

  // Assign OWNER role to Pedro
  await prisma.userRole.create({
    data: {
      userId: user6.id,
      roleId: ownerRole.id,
      tenantId: tenant4.id,
      assignedBy: 'system',
    },
  });

  const subscription4 = await prisma.subscription.create({
    data: {
      tenantId: tenant4.id,
      planId: starterPlan.id,
      status: 'PAST_DUE',
      startedAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // 90 days ago
      expiresAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // expired 30 days ago
      stripeCustomerId: 'cus_test_overdue',
      stripeSubscriptionId: 'sub_test_overdue_starter',
    },
  });
  console.log(
    '✅ Created Subscription 4 (Overdue Business):',
    subscription4.id,
  );

  // Test Tenant 5: Canceled Subscription
  const tenant5 = await prisma.tenant.create({
    data: {
      name: 'Former Customer',
      slug: 'former-customer',
      type: TenantType.COMPANY,
    },
  });
  console.log('✅ Created Company Tenant 5:', tenant5.id);

  const user7 = await prisma.user.create({
    data: {
      tenantId: tenant5.id,
      name: 'Lucas Ferreira',
      email: 'lucas@formercustomer.com',
      password: await hashPassword('SenhaForte123!@#'),
      isActive: true,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lucas',
      twoFactorEnabled: false,
    },
  });
  console.log('✅ Created User 7 (Lucas):', user7.id);

  // Assign OWNER role to Lucas
  await prisma.userRole.create({
    data: {
      userId: user7.id,
      roleId: ownerRole.id,
      tenantId: tenant5.id,
      assignedBy: 'system',
    },
  });

  const subscription5 = await prisma.subscription.create({
    data: {
      tenantId: tenant5.id,
      planId: professionalPlan.id,
      status: 'CANCELED',
      startedAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000), // 180 days ago
      canceledAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // canceled 60 days ago
      expiresAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // expired 60 days ago
      stripeCustomerId: 'cus_test_canceled',
      stripeSubscriptionId: 'sub_test_canceled_prof',
    },
  });
  console.log('✅ Created Subscription 5 (Former Customer):', subscription5.id);

  // ============================
  // Create Email Logs
  // ============================
  for (let i = 0; i < 15; i++) {
    await prisma.emailLog.create({
      data: {
        tenantId: tenant1.id,
        type: 'LIMIT_ALERT',
        limitType: 'PROPERTIES',
        sentAt: new Date(Date.now() - i * 7 * 24 * 60 * 60 * 1000), // Weekly alerts
      },
    });
  }
  console.log('✅ Created 15 email logs for Tech Startup');

  // ============================
  // Create Password Reset Tokens (expired)
  // ============================
  await prisma.passwordReset.create({
    data: {
      userId: user1.id,
      token: 'reset_token_expired_' + Date.now(),
      expiresAt: new Date(Date.now() - 1000 * 60 * 60), // Expired 1 hour ago
      usedAt: null,
    },
  });
  console.log('✅ Created expired password reset token');

  console.log('\n🌱 Seed completed successfully!');
  console.log('\n📋 Test Credentials:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  console.log('\n👤 CANDIDATOS (Login sem Tenant ID):');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  console.log('\n1️⃣  Candidato Básico:');
  console.log('   Email: felipe@gmail.com');
  console.log('   Password: SenhaForte123!@#');
  console.log('   Status: ✅ Active, ❌ No 2FA');

  console.log('\n2️⃣  Candidato com 2FA:');
  console.log('   Email: juliana@hotmail.com');
  console.log('   Password: SenhaForte123!@#');
  console.log('   Status: ✅ Active, ✅ 2FA Enabled');

  console.log('\n3️⃣  Candidato Frontend:');
  console.log('   Email: ricardo@yahoo.com');
  console.log('   Password: SenhaForte123!@#');
  console.log('   Status: ✅ Active, ❌ No 2FA');

  console.log('\n4️⃣  Candidato Inativo:');
  console.log('   Email: amanda@outlook.com');
  console.log('   Password: SenhaForte123!@#');
  console.log('   Status: ❌ Inactive');

  console.log('\n\n🏢 EMPRESAS (Login com Tenant ID):');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  console.log('\n1️⃣  Basic User (No 2FA):');
  console.log('   Tenant ID: tech-startup-co');
  console.log('   Email: joao@techstartup.com');
  console.log('   Password: SenhaForte123!@#');
  console.log('   Status: ✅ Active, ❌ No 2FA');

  console.log('\n2️⃣  User with 2FA Enabled:');
  console.log('   Tenant ID: tech-startup-co');
  console.log('   Email: maria@techstartup.com');
  console.log('   Password: SenhaForte123!@#');
  console.log('   Status: ✅ Active, ✅ 2FA Enabled');

  console.log('\n3️⃣  Starter Plan User:');
  console.log('   Tenant ID: digital-agency');
  console.log('   Email: carlos@digitalagency.com');
  console.log('   Password: SenhaForte123!@#');
  console.log('   Status: ✅ Active, ❌ No 2FA');

  console.log('\n4️⃣  Enterprise User (with 2FA):');
  console.log('   Tenant ID: enterprise-corp');
  console.log('   Email: ana@enterprisecorp.com');
  console.log('   Password: SenhaForte123!@#');
  console.log('   Status: ✅ Active, ✅ 2FA Enabled');

  console.log('\n5️⃣  Inactive User:');
  console.log('   Tenant ID: enterprise-corp');
  console.log('   Email: roberto@enterprisecorp.com');
  console.log('   Password: SenhaForte123!@#');
  console.log('   Status: ❌ Inactive');

  console.log('\n6️⃣  Past Due Subscription:');
  console.log('   Tenant ID: overdue-business');
  console.log('   Email: pedro@overduebiz.com');
  console.log('   Password: SenhaForte123!@#');
  console.log('   Status: ⚠️  Past Due');

  console.log('\n7️⃣  Canceled Subscription:');
  console.log('   Tenant ID: former-customer');
  console.log('   Email: lucas@formercustomer.com');
  console.log('   Password: SenhaForte123!@#');
  console.log('   Status: ❌ Canceled');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
