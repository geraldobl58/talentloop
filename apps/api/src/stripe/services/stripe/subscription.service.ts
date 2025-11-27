import { Injectable, Logger } from '@nestjs/common';
import { StripeRepository } from '@/stripe/repositories/stripe.repository';
import { PrismaService } from '@/libs/prisma/prisma.service';

@Injectable()
export class StripeSubscriptionService {
  private readonly logger = new Logger(StripeSubscriptionService.name);

  constructor(
    private readonly stripeRepository: StripeRepository,
    private readonly prisma: PrismaService,
  ) {}

  async updateSubscription(subscriptionId: string, priceId: string) {
    this.logger.log(`Updating subscription: ${subscriptionId}`);
    const updated = await this.stripeRepository.updateSubscription(
      subscriptionId,
      priceId,
    );
    return updated;
  }

  async cancelSubscription(subscriptionId: string) {
    this.logger.log(`Cancelling subscription: ${subscriptionId}`);
    const cancelled =
      await this.stripeRepository.cancelSubscription(subscriptionId);
    return cancelled;
  }

  async getSubscription(subscriptionId: string) {
    return this.stripeRepository.getSubscription(subscriptionId);
  }

  async listSubscriptions(customerId: string) {
    return this.stripeRepository.listSubscriptions(customerId);
  }
}
