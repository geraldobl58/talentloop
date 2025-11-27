import { Module } from '@nestjs/common';
import { PrismaModule } from '../libs/prisma/prisma.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { ConfigModule } from '@nestjs/config';

// Repositories
import { EmailRepository } from './repositories/email.repository';

// Services
import { WelcomeEmailService } from './services/email/welcome.service';
import { PasswordEmailService } from './services/email/password.service';
import { SubscriptionEmailService } from './services/email/subscription.service';
import { AlertEmailService } from './services/email/alert.service';
import { BillingEmailService } from './services/email/billing.service';
import { EmailService } from './services/email.service';
import { LimitMonitorService } from './limit-monitor.service';

// Controllers
import { EmailController } from './email.controller';

@Module({
  imports: [ConfigModule, PrismaModule, NotificationsModule],
  controllers: [EmailController],
  providers: [
    // Repositories
    EmailRepository,
    // Email Services
    WelcomeEmailService,
    PasswordEmailService,
    SubscriptionEmailService,
    AlertEmailService,
    BillingEmailService,
    // Orchestration Services
    EmailService,
    LimitMonitorService,
  ],
  exports: [
    // Repositories
    EmailRepository,
    // Email Services
    WelcomeEmailService,
    PasswordEmailService,
    SubscriptionEmailService,
    AlertEmailService,
    BillingEmailService,
    // Orchestration Services
    EmailService,
  ],
})
export class EmailModule {}
