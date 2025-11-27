import { Module } from '@nestjs/common';
import { PrismaModule } from '../libs/prisma/prisma.module';
import { StripeModule } from '../stripe/stripe.module';
import { EmailModule } from '../email/email.module';

// Repositories
import { PlanRepository } from './repositories/plan.repository';

// Services
import { PlansService } from './plans.service';

// Controllers
import { PlansController } from './plans.controller';

@Module({
  imports: [PrismaModule, StripeModule, EmailModule],
  controllers: [PlansController],
  providers: [PlanRepository, PlansService],
  exports: [PlanRepository, PlansService],
})
export class PlansModule {}
