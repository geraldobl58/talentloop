import { Injectable, Logger } from '@nestjs/common';
import { StripeRepository } from '@/stripe/repositories/stripe.repository';
import { PrismaService } from '@/libs/prisma/prisma.service';

@Injectable()
export class StripeWebhookService {
  private readonly logger = new Logger(StripeWebhookService.name);

  constructor(
    private readonly stripeRepository: StripeRepository,
    private readonly prisma: PrismaService,
  ) {}

  async handleWebhookEvent(event: any) {
    this.logger.log(`Processing webhook event: ${event.type}`);

    switch (event.type) {
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

  private async handleSubscriptionUpdated(subscription: any) {
    this.logger.log(`Subscription updated: ${subscription.id}`);
    // Implementar lógica de atualização
  }

  private async handleSubscriptionDeleted(subscription: any) {
    this.logger.log(`Subscription deleted: ${subscription.id}`);
    // Implementar lógica de cancelamento
  }

  private async handlePaymentSucceeded(invoice: any) {
    this.logger.log(`Payment succeeded for invoice: ${invoice.id}`);
    // Implementar lógica de pagamento bem-sucedido
  }

  private async handlePaymentFailed(invoice: any) {
    this.logger.log(`Payment failed for invoice: ${invoice.id}`);
    // Implementar lógica de falha de pagamento
  }
}
