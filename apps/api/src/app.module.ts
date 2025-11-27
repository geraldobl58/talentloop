import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';

import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './libs/prisma/prisma.module';
import { PlansModule } from './plans/plans.module';
import { StripeModule } from './stripe/stripe.module';
import { LoggerModule } from './libs/logger/logger.module';
import { EmailModule } from './email/email.module';
import { APP_CONSTANTS } from './libs/common/constants';

@Module({
  imports: [
    LoggerModule,
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot([
      {
        ttl: APP_CONSTANTS.THROTTLER.TTL_MS,
        limit: APP_CONSTANTS.THROTTLER.DEFAULT_LIMIT,
      },
    ]),
    PrismaModule,
    AuthModule,
    PlansModule,
    StripeModule,
    EmailModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
