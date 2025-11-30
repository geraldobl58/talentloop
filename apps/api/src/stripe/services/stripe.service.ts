import {
  Injectable,
  Logger,
  BadRequestException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { StripeCustomerService } from '@/stripe/services/stripe/customer.service';
import { StripeCheckoutService } from '@/stripe/services/stripe/checkout.service';
import { StripeSubscriptionService } from '@/stripe/services/stripe/subscription.service';
import { StripeWebhookService } from '@/stripe/services/stripe/webhook.service';
import { StripeRepository } from '@/stripe/repositories/stripe.repository';
import Stripe from 'stripe';

export interface CreateCustomerDto {
  email: string;
  name: string;
  tenantId: string;
}

@Injectable()
export class StripeService {
  private readonly logger = new Logger(StripeService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly stripeRepository: StripeRepository,
    private readonly customerService: StripeCustomerService,
    private readonly checkoutService: StripeCheckoutService,
    private readonly subscriptionService: StripeSubscriptionService,
    @Inject(forwardRef(() => StripeWebhookService))
    private readonly webhookService: StripeWebhookService,
  ) {}

  async createOrGetCustomer(tenantId: string, email: string, name: string) {
    return this.customerService.createOrGetCustomer(tenantId, email, name);
  }

  /**
   * Create a new Stripe customer
   */
  async createCustomer(data: CreateCustomerDto): Promise<Stripe.Customer> {
    return this.stripeRepository.createCustomer(
      data.email,
      data.name,
      data.tenantId,
    );
  }

  /**
   * Create checkout session with full parameters
   */
  async createCheckoutSession(
    priceId: string,
    customerId: string,
    successUrl: string,
    cancelUrl: string,
  ): Promise<{ url: string; id: string }> {
    const session = await this.stripeRepository.createCheckoutSession({
      customerId,
      priceId,
      successUrl,
      cancelUrl,
    });
    return {
      url: session.url || '',
      id: session.id,
    };
  }

  async createBillingPortal(customerId: string, returnUrl: string) {
    return this.checkoutService.createBillingPortal(customerId, returnUrl);
  }

  /**
   * Alias for createBillingPortal (used by PlansService)
   */
  async createBillingPortalSession(
    customerId: string,
    returnUrl: string,
  ): Promise<string> {
    const session = await this.stripeRepository.createBillingPortalSession(
      customerId,
      returnUrl,
    );
    return session.url || '';
  }

  async updateSubscription(subscriptionId: string, priceId: string) {
    return this.subscriptionService.updateSubscription(subscriptionId, priceId);
  }

  async cancelSubscription(subscriptionId: string) {
    return this.subscriptionService.cancelSubscription(subscriptionId);
  }

  async handleWebhookEvent(event: Stripe.Event) {
    return this.webhookService.handleWebhookEvent(event);
  }

  /**
   * Construct and verify webhook event from Stripe
   */
  constructWebhookEvent(
    payload: string | Buffer,
    signature: string,
  ): Stripe.Event {
    const webhookSecret = this.configService.get<string>(
      'STRIPE_WEBHOOK_SECRET',
    );
    if (!webhookSecret) {
      throw new BadRequestException('STRIPE_WEBHOOK_SECRET is required');
    }

    try {
      return this.stripeRepository.buildWebhookEvent(
        payload as Buffer,
        signature,
        webhookSecret,
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Webhook signature verification failed: ${message}`);
      throw new BadRequestException('Assinatura de webhook inválida');
    }
  }
}
