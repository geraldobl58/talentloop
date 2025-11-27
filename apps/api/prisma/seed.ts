import { PrismaClient } from '@prisma/client';
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

  // ============================
  // Create Plans
  // ============================
  const trialPlan = await prisma.plan.create({
    data: {
      name: 'TRIAL',
      price: 0,
      currency: 'BRL',
      description: 'Experimente grátis por 7 dias',
      maxUsers: 4,
      maxContacts: 10,
      hasAPI: false,
      trialDurationHours: 168, // 7 dias
      stripeProductId: null,
      stripePriceId: null,
    },
  });
  console.log('✅ Created TRIAL plan:', trialPlan.id);

  const starterPlan = await prisma.plan.create({
    data: {
      name: 'STARTER',
      price: 149.99,
      currency: 'BRL',
      description: 'Perfeito para começar',
      maxUsers: 4,
      maxContacts: 10,
      hasAPI: false,
      stripeProductId: 'prod_TClbVFQhJS1ZOD',
      stripePriceId: 'price_1SGM3uAB7ykXDk2oUJravQQK',
    },
  });
  console.log('✅ Created STARTER plan:', starterPlan.id);

  const professionalPlan = await prisma.plan.create({
    data: {
      name: 'PROFESSIONAL',
      price: 299.99,
      currency: 'BRL',
      description: 'Para empresas em crescimento',
      maxUsers: 4,
      maxContacts: 20,
      hasAPI: true,
      stripeProductId: 'prod_TClbELPL9wiScE',
      stripePriceId: 'price_1SGM4CAB7ykXDk2ow5PfFVyb',
    },
  });
  console.log('✅ Created PROFESSIONAL plan:', professionalPlan.id);

  const enterprisePlan = await prisma.plan.create({
    data: {
      name: 'ENTERPRISE',
      price: 599.99,
      currency: 'BRL',
      description: 'Solução completa',
      maxUsers: 4,
      maxContacts: 30,
      hasAPI: true,
      stripeProductId: 'prod_TClb1eMmA798TY',
      stripePriceId: 'price_1SGM4TAB7ykXDk2ozLp2ZBgF',
    },
  });
  console.log('✅ Created ENTERPRISE plan:', enterprisePlan.id);

  // ============================
  // Create Test Tenants & Users
  // ============================

  // Test Tenant 1: Startup Company - Active with PROFESSIONAL plan
  const tenant1 = await prisma.tenant.create({
    data: {
      name: 'Tech Startup Co',
      slug: 'tech-startup-co',
    },
  });
  console.log('✅ Created Tenant 1:', tenant1.id);

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
    },
  });
  console.log('✅ Created Tenant 2:', tenant2.id);

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
    },
  });
  console.log('✅ Created Tenant 3:', tenant3.id);

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
    },
  });
  console.log('✅ Created Tenant 4:', tenant4.id);

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
    },
  });
  console.log('✅ Created Tenant 5:', tenant5.id);

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
