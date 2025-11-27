import { vi } from 'vitest';

// Enum RoleType para os testes
const RoleType = {
  OWNER: 'OWNER',
  ADMIN: 'ADMIN',
  MANAGER: 'MANAGER',
  MEMBER: 'MEMBER',
  VIEWER: 'VIEWER',
} as const;

// Mock do Prisma
vi.mock('@prisma/client', () => ({
  PrismaClient: vi.fn().mockImplementation(() => ({
    $connect: vi.fn(),
    $disconnect: vi.fn(),
    user: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    tenant: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    subscription: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    plan: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
    },
    role: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
    },
    permission: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
    },
    userRole: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      upsert: vi.fn(),
      delete: vi.fn(),
      deleteMany: vi.fn(),
      count: vi.fn(),
    },
    rolePermission: {
      findMany: vi.fn(),
      create: vi.fn(),
      createMany: vi.fn(),
      delete: vi.fn(),
      deleteMany: vi.fn(),
    },
  })),
  RoleType,
}));

// Mock do ConfigService
vi.mock('@nestjs/config', async () => {
  const actual = await vi.importActual('@nestjs/config');
  return {
    ...actual,
    ConfigService: vi.fn().mockImplementation(() => ({
      get: vi.fn((key: string) => {
        const config: Record<string, string> = {
          JWT_SECRET: 'test-jwt-secret',
          JWT_EXPIRATION: '1h',
          DATABASE_URL: 'postgresql://test:test@localhost:5432/test',
          STRIPE_SECRET_KEY: 'sk_test_xxx',
          STRIPE_WEBHOOK_SECRET: 'whsec_xxx',
        };
        return config[key];
      }),
    })),
  };
});

// Limpar todos os mocks após cada teste
afterEach(() => {
  vi.clearAllMocks();
});
