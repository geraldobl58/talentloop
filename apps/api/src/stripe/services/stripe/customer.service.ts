import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { StripeRepository } from '@/stripe/repositories/stripe.repository';
import { PrismaService } from '@/libs/prisma/prisma.service';

@Injectable()
export class StripeCustomerService {
  private readonly logger = new Logger(StripeCustomerService.name);

  constructor(
    private readonly stripeRepository: StripeRepository,
    private readonly prisma: PrismaService,
  ) {}

  async createOrGetCustomer(tenantId: string, email: string, name: string) {
    const existing = await this.prisma.subscription.findUnique({
      where: { tenantId },
    });

    if (existing?.stripeCustomerId) {
      return this.stripeRepository.getCustomer(existing.stripeCustomerId);
    }

    const customer = await this.stripeRepository.createCustomer(
      email,
      name,
      tenantId,
    );
    await this.prisma.subscription.updateMany({
      where: { tenantId },
      data: { stripeCustomerId: customer.id },
    });

    this.logger.log(`Customer created and linked: ${customer.id}`);
    return customer;
  }
}
