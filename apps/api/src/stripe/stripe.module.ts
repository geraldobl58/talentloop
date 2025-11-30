import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '@/libs/prisma/prisma.module';
import { AuthModule } from '@/auth/auth.module';

// Repositories
import { StripeRepository } from './repositories/stripe.repository';

// Services
import { StripeCustomerService } from './services/stripe/customer.service';
import { StripeCheckoutService } from './services/stripe/checkout.service';
import { StripeSubscriptionService } from './services/stripe/subscription.service';
import { StripeWebhookService } from './services/stripe/webhook.service';
import { AutoUpgradeService } from './auto-upgrade.service';
import { StripeService } from './services/stripe.service';

// Controllers
import { StripeController } from './stripe.controller';

@Module({
  imports: [ConfigModule, PrismaModule, forwardRef(() => AuthModule)],
  controllers: [StripeController],
  providers: [
    // Repositories
    StripeRepository,
    // Services
    StripeCustomerService,
    StripeCheckoutService,
    StripeSubscriptionService,
    StripeWebhookService,
    AutoUpgradeService,
    // Orchestration
    StripeService,
  ],
  exports: [
    // Repositories
    StripeRepository,
    // Services
    StripeCustomerService,
    StripeCheckoutService,
    StripeSubscriptionService,
    StripeWebhookService,
    AutoUpgradeService,
    // Orchestration
    StripeService,
  ],
})
export class StripeModule {}
