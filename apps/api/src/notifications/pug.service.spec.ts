import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { PugService } from './pug.service';
import { TemplateRenderService } from './services/template-render.service';
import { TemplateRepository } from './repositories/template.repository';

describe('PugService', () => {
  let service: PugService;

  const mockTemplateRenderService = {
    renderWelcome: vi.fn().mockResolvedValue('<html>Welcome Test</html>'),
    renderPasswordReset: vi.fn().mockResolvedValue('<html>Reset</html>'),
    renderLimitAlert: vi.fn().mockResolvedValue('<html>Alert</html>'),
    renderCancellation: vi.fn().mockResolvedValue('<html>Cancellation</html>'),
    renderUpgrade: vi.fn().mockResolvedValue('<html>Upgrade</html>'),
    render2FAEnabled: vi.fn().mockResolvedValue('<html>2FA Enabled</html>'),
    render2FADisabled: vi.fn().mockResolvedValue('<html>2FA Disabled</html>'),
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PugService,
        { provide: TemplateRenderService, useValue: mockTemplateRenderService },
      ],
    }).compile();

    service = module.get<PugService>(PugService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Template Rendering', () => {
    it('should render welcome template', async () => {
      const html = await service.renderWelcome({
        userName: 'João Silva',
        email: 'joao@example.com',
        password: 'SecurePass123!',
        planName: 'Premium',
        loginUrl: 'https://sass-multitenant.com/signin',
      });

      expect(html).toContain('Welcome');
      expect(mockTemplateRenderService.renderWelcome).toHaveBeenCalled();
    });

    it('should render password reset template', async () => {
      const html = await service.renderPasswordReset({
        userName: 'Maria Santos',
        resetLink: 'https://sass-multitenant.com/reset?token=abc123',
        expiryMinutes: 60,
      });

      expect(html).toContain('Reset');
      expect(mockTemplateRenderService.renderPasswordReset).toHaveBeenCalled();
    });

    it('should render limit alert template', async () => {
      const html = await service.renderLimitAlert({
        userName: 'Pedro Costa',
        currentUsage: 450,
        limit: 500,
        usagePercentage: 90,
        upgradeUrl: 'https://sass-multitenant.com/upgrade',
      });

      expect(html).toContain('Alert');
      expect(mockTemplateRenderService.renderLimitAlert).toHaveBeenCalled();
    });

    it('should render cancellation template', async () => {
      const html = await service.renderCancellation({
        userName: 'Ana Silva',
        planName: 'Professional',
        cancellationDate: '2025-02-01',
        dataExportUrl: 'https://sass-multitenant.com/export',
      });

      expect(html).toContain('Cancellation');
      expect(mockTemplateRenderService.renderCancellation).toHaveBeenCalled();
    });

    it('should render upgrade template', async () => {
      const html = await service.renderUpgrade({
        userName: 'Carlos Mendes',
        oldPlan: 'Basic',
        newPlan: 'Professional',
        newPrice: '$99',
        billingDate: '2025-01-15',
        dashboardUrl: 'https://sass-multitenant.com/dashboard',
      });

      expect(html).toContain('Upgrade');
      expect(mockTemplateRenderService.renderUpgrade).toHaveBeenCalled();
    });
  });
});
