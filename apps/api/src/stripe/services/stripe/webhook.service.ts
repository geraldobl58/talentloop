import { Injectable, Logger, Inject, forwardRef } from '@nestjs/common';
import { StripeRepository } from '@/stripe/repositories/stripe.repository';
import { PrismaService } from '@/libs/prisma/prisma.service';
import { SignupCheckoutService } from '@/auth/services/signup-checkout.service';
import { SubStatus } from '@prisma/client';

@Injectable()
export class StripeWebhookService {
  private readonly logger = new Logger(StripeWebhookService.name);

  constructor(
    private readonly stripeRepository: StripeRepository,
    private readonly prisma: PrismaService,
    @Inject(forwardRef(() => SignupCheckoutService))
    private readonly signupCheckoutService: SignupCheckoutService,
  ) {}

  async handleWebhookEvent(event: any) {
    this.logger.log(`Processing webhook event: ${event.type}`);

    switch (event.type) {
      case 'checkout.session.completed':
        return this.handleCheckoutCompleted(event.data.object);
      case 'customer.subscription.created':
        return this.handleSubscriptionCreated(event.data.object);
      case 'customer.subscription.updated':
        return this.handleSubscriptionUpdated(event.data.object);
      case 'customer.subscription.deleted':
        return this.handleSubscriptionDeleted(event.data.object);
      case 'invoice.payment_succeeded':
        return this.handlePaymentSucceeded(event.data.object);
      case 'invoice.payment_failed':
        return this.handlePaymentFailed(event.data.object);
      default:
        this.logger.debug(`Unhandled event type: ${event.type}`);
        return null;
    }
  }

  private async handleCheckoutCompleted(session: any): Promise<void> {
    this.logger.log(`Checkout session completed: ${session.id}`);

    // First, try to handle as signup (for new users)
    const checkoutData = await this.prisma.stripeCheckoutSession.findFirst({
      where: { sessionId: session.id },
    });

    if (checkoutData && !checkoutData.completed) {
      // This is a signup checkout
      await this.signupCheckoutService.handleCheckoutCompleted(session.id);
      return;
    }

    // If no signup checkout data found, this is an upgrade for existing user
    // The subscription.created event will handle the actual update
    this.logger.log(
      'Checkout completed for existing user, subscription.created will handle update',
    );
  }

  /**
   * Handle new subscription created (for existing users doing upgrade)
   */
  private async handleSubscriptionCreated(subscription: any): Promise<void> {
    this.logger.log(`Subscription created: ${subscription.id}`, {
      customerId: subscription.customer,
      status: subscription.status,
      priceId: subscription.items?.data?.[0]?.price?.id,
    });

    const customerId = subscription.customer;
    const stripeSubscriptionId = subscription.id;
    const priceId = subscription.items?.data?.[0]?.price?.id;

    if (!customerId || !priceId) {
      this.logger.error('Missing customer or price ID in subscription', {
        customerId,
        priceId,
      });
      return;
    }

    // First, try to find subscription by stripeCustomerId
    let existingSubscription = await this.prisma.subscription.findFirst({
      where: { stripeCustomerId: customerId },
    });

    // If not found, try to get tenantId from customer metadata
    if (!existingSubscription) {
      this.logger.log(
        'Subscription not found by customerId, trying to get tenantId from Stripe customer',
      );

      try {
        const customer = await this.stripeRepository.getCustomer(customerId);
        const tenantId = customer.metadata?.tenantId;

        if (tenantId) {
          existingSubscription = await this.prisma.subscription.findFirst({
            where: { tenantId },
          });

          if (existingSubscription) {
            // Update the subscription with stripeCustomerId for future lookups
            await this.prisma.subscription.update({
              where: { id: existingSubscription.id },
              data: { stripeCustomerId: customerId },
            });
            this.logger.log(
              'Found subscription by tenantId and updated stripeCustomerId',
              {
                tenantId,
                customerId,
              },
            );
          }
        }
      } catch (error) {
        this.logger.error('Error fetching customer from Stripe', error);
      }
    }

    if (!existingSubscription) {
      this.logger.log(
        'No existing subscription found, might be handled by signup flow',
      );
      return;
    }

    // Find the plan by stripePriceId
    const plan = await this.prisma.plan.findFirst({
      where: { stripePriceId: priceId },
    });

    if (!plan) {
      this.logger.error('Plan not found for price ID', { priceId });
      return;
    }

    // Calculate expiration date based on billing period
    const expiresAt =
      plan.billingPeriodDays > 0
        ? new Date(Date.now() + plan.billingPeriodDays * 24 * 60 * 60 * 1000)
        : null;

    // Update the subscription
    await this.prisma.subscription.update({
      where: { id: existingSubscription.id },
      data: {
        planId: plan.id,
        stripeSubscriptionId,
        stripeCustomerId: customerId,
        status:
          subscription.status === 'active'
            ? SubStatus.ACTIVE
            : SubStatus.PENDING,
        startedAt: new Date(),
        expiresAt,
      },
    });

    this.logger.log('✅ Subscription upgraded successfully', {
      subscriptionId: existingSubscription.id,
      newPlan: plan.name,
      stripeSubscriptionId,
    });
  }

  private async handleSubscriptionUpdated(subscription: any): Promise<void> {
    this.logger.log(`Subscription updated: ${subscription.id}`, {
      status: subscription.status,
    });

    const stripeSubscriptionId = subscription.id;

    // Find subscription by stripeSubscriptionId
    const existingSubscription = await this.prisma.subscription.findFirst({
      where: { stripeSubscriptionId },
    });

    if (!existingSubscription) {
      this.logger.log('No subscription found for stripeSubscriptionId', {
        stripeSubscriptionId,
      });
      return;
    }

    // Map Stripe status to our status
    let status: SubStatus;
    switch (subscription.status) {
      case 'active':
        status = SubStatus.ACTIVE;
        break;
      case 'past_due':
        status = SubStatus.PAST_DUE;
        break;
      case 'canceled':
        status = SubStatus.CANCELED;
        break;
      case 'unpaid':
        status = SubStatus.PAST_DUE;
        break;
      default:
        status = SubStatus.ACTIVE;
    }

    await this.prisma.subscription.update({
      where: { id: existingSubscription.id },
      data: { status },
    });

    this.logger.log('✅ Subscription status updated', {
      subscriptionId: existingSubscription.id,
      status,
    });
  }

  private async handleSubscriptionDeleted(subscription: any): Promise<void> {
    this.logger.log(`Subscription deleted: ${subscription.id}`);

    const stripeSubscriptionId = subscription.id;

    const existingSubscription = await this.prisma.subscription.findFirst({
      where: { stripeSubscriptionId },
    });

    if (existingSubscription) {
      await this.prisma.subscription.update({
        where: { id: existingSubscription.id },
        data: { status: SubStatus.CANCELED },
      });

      this.logger.log('✅ Subscription marked as canceled', {
        subscriptionId: existingSubscription.id,
      });
    }
  }

  private async handlePaymentSucceeded(invoice: any): Promise<void> {
    this.logger.log(`Payment succeeded for invoice: ${invoice.id}`);

    const stripeSubscriptionId = invoice.subscription;
    if (!stripeSubscriptionId) return;

    const existingSubscription = await this.prisma.subscription.findFirst({
      where: { stripeSubscriptionId },
    });

    if (existingSubscription) {
      await this.prisma.subscription.update({
        where: { id: existingSubscription.id },
        data: { status: SubStatus.ACTIVE },
      });

      this.logger.log('✅ Subscription activated after payment', {
        subscriptionId: existingSubscription.id,
      });
    }
  }

  private async handlePaymentFailed(invoice: any): Promise<void> {
    this.logger.log(`Payment failed for invoice: ${invoice.id}`);

    const stripeSubscriptionId = invoice.subscription;
    if (!stripeSubscriptionId) return;

    const existingSubscription = await this.prisma.subscription.findFirst({
      where: { stripeSubscriptionId },
    });

    if (existingSubscription) {
      await this.prisma.subscription.update({
        where: { id: existingSubscription.id },
        data: { status: SubStatus.PAST_DUE },
      });

      this.logger.log('⚠️ Subscription marked as past due', {
        subscriptionId: existingSubscription.id,
      });
    }
  }
}
