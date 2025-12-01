import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { PrismaModule } from '@/libs/prisma/prisma.module';
import { StripeModule } from '@/stripe/stripe.module';
import { PlansModule } from '@/plans/plans.module';
import { EmailModule } from '@/email/email.module';
import { APP_CONSTANTS } from '@/libs/common/constants';

// Repositories
import { AuthRepository } from './repositories/auth.repository';
import { TwoFactorRepository } from './repositories/two-factor.repository';

// Services
import { SignInService } from './services/signin.service';
import { PasswordService } from './services/password.service';
import { ProfileService } from './services/profile.service';
import { SignupCheckoutService } from './services/signup-checkout.service';
import { TwoFactorService } from './services/two-factor.service';
import { AuthService } from './services/auth.service';

// Controllers
import { AuthController } from './auth.controller';
import { TwoFactorController } from './two-factor/two-factor.controller';

// Strategy
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    ConfigModule,
    PassportModule,
    PrismaModule,
    forwardRef(() => StripeModule),
    forwardRef(() => PlansModule),
    forwardRef(() => EmailModule),
    MulterModule.register({
      storage: memoryStorage(),
      limits: {
        fileSize: APP_CONSTANTS.FILE_UPLOAD.MAX_SIZE_BYTES,
      },
    }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn:
            config.get<string>('JWT_EXPIRES') ||
            APP_CONSTANTS.JWT.DEFAULT_EXPIRES_IN,
        },
      }),
    }),
  ],
  controllers: [AuthController, TwoFactorController],
  providers: [
    // Repositories
    AuthRepository,
    TwoFactorRepository,
    // Services
    SignInService,
    PasswordService,
    ProfileService,
    SignupCheckoutService,
    TwoFactorService,
    // Orchestration
    AuthService,
    // Strategy
    JwtStrategy,
  ],
  exports: [
    // Repositories
    AuthRepository,
    TwoFactorRepository,
    // Services
    AuthService,
    SignupCheckoutService,
    TwoFactorService,
    // Strategy
    JwtStrategy,
  ],
})
export class AuthModule {}
