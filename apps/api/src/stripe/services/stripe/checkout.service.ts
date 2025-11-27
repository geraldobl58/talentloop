import { Injectable, Logger } from '@nestjs/common';
import { StripeRepository } from '@/stripe/repositories/stripe.repository';

@Injectable()
export class StripeCheckoutService {
  private readonly logger = new Logger(StripeCheckoutService.name);

  constructor(private readonly stripeRepository: StripeRepository) {}

  async createCheckoutSession(
    customerId: string,
    priceId: string,
    urls: { success: string; cancel: string },
  ) {
    this.logger.log(`Creating checkout session for customer: ${customerId}`);

    const session = await this.stripeRepository.createCheckoutSession({
      customerId,
      priceId,
      successUrl: urls.success,
      cancelUrl: urls.cancel,
    });

    return session;
  }

  async createBillingPortal(customerId: string, returnUrl: string) {
    this.logger.log(`Creating billing portal for customer: ${customerId}`);

    const portal = await this.stripeRepository.createBillingPortalSession(
      customerId,
      returnUrl,
    );
    return portal;
  }
}
