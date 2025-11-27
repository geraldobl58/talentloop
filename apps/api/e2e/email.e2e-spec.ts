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
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { EmailController } from '@/email/email.controller';
import { LimitMonitorService } from '@/email/limit-monitor.service';
import { JwtAuthGuard } from '@/libs/common/guards/jwt-auth.guard';

describe('Email (e2e)', () => {
  let app: INestApplication;

  const mockLimitMonitorService = {
    runManualCheck: vi.fn(),
  };

  const mockJwtAuthGuard = {
    canActivate: vi.fn().mockImplementation((context) => {
      const req = context.switchToHttp().getRequest();
      req.user = { userId: 'test-user-id', tenantId: 'test-tenant-id' };
      return true;
    }),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [EmailController],
      providers: [
        { provide: LimitMonitorService, useValue: mockLimitMonitorService },
      ],
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
    mockJwtAuthGuard.canActivate.mockImplementation((context) => {
      const req = context.switchToHttp().getRequest();
      req.user = { userId: 'test-user-id', tenantId: 'test-tenant-id' };
      return true;
    });
  });

  describe('/email/check-limits (POST)', () => {
    it('should run manual check and return success message', async () => {
      mockLimitMonitorService.runManualCheck.mockResolvedValue(undefined);

      const response = await request(app.getHttpServer())
        .post('/email/check-limits')
        .send();

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('timestamp');
      expect(mockLimitMonitorService.runManualCheck).toHaveBeenCalled();
    });

    it('should return 403 when guard rejects', async () => {
      mockJwtAuthGuard.canActivate.mockReturnValue(false);

      const response = await request(app.getHttpServer())
        .post('/email/check-limits')
        .send();

      expect(response.status).toBe(403);
    });
  });
});
