import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { PugService } from './pug.service';
import { TemplateRenderService } from './services/template-render.service';

describe('PugService', () => {
  let service: PugService;

  const mockTemplateRenderService = {
    renderWelcome: vi.fn().mockReturnValue('<html>Welcome Test</html>'),
    renderPasswordReset: vi.fn().mockReturnValue('<html>Reset</html>'),
    renderLimitAlert: vi.fn().mockReturnValue('<html>Alert</html>'),
    renderCancellation: vi.fn().mockReturnValue('<html>Cancellation</html>'),
    renderUpgrade: vi.fn().mockReturnValue('<html>Upgrade</html>'),
    render2FAEnabled: vi.fn().mockReturnValue('<html>2FA Enabled</html>'),
    render2FADisabled: vi.fn().mockReturnValue('<html>2FA Disabled</html>'),
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
    it('should render welcome template', () => {
      const html = service.renderWelcome({
        userName: 'João Silva',
        email: 'joao@example.com',
        password: 'SecurePass123!',
        planName: 'Premium',
        loginUrl: 'https://sass-multitenant.com/signin',
      });

      expect(html).toContain('Welcome');
      expect(mockTemplateRenderService.renderWelcome).toHaveBeenCalled();
    });

    it('should render password reset template', () => {
      const html = service.renderPasswordReset({
        userName: 'Maria Santos',
        resetLink: 'https://sass-multitenant.com/reset?token=abc123',
        expiryMinutes: 60,
      });

      expect(html).toContain('Reset');
      expect(mockTemplateRenderService.renderPasswordReset).toHaveBeenCalled();
    });

    it('should render limit alert template', () => {
      const html = service.renderLimitAlert({
        userName: 'Pedro Costa',
        currentUsage: 450,
        limit: 500,
        usagePercentage: 90,
        upgradeUrl: 'https://sass-multitenant.com/upgrade',
      });

      expect(html).toContain('Alert');
      expect(mockTemplateRenderService.renderLimitAlert).toHaveBeenCalled();
    });

    it('should render cancellation template', () => {
      const html = service.renderCancellation({
        userName: 'Ana Silva',
        planName: 'Professional',
        cancellationDate: '2025-02-01',
        dataExportUrl: 'https://sass-multitenant.com/export',
      });

      expect(html).toContain('Cancellation');
      expect(mockTemplateRenderService.renderCancellation).toHaveBeenCalled();
    });

    it('should render upgrade template', () => {
      const html = service.renderUpgrade({
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
