import { Controller, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../libs/common/guards/jwt-auth.guard';
import { LimitMonitorService } from './limit-monitor.service';

@Controller('email')
@UseGuards(JwtAuthGuard)
export class EmailController {
  constructor(private limitMonitorService: LimitMonitorService) {}

  @Post('check-limits')
  async checkLimits() {
    await this.limitMonitorService.runManualCheck();
    return {
      message: 'Verificação de limites executada com sucesso',
      timestamp: new Date().toISOString(),
    };
  }
}
