import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { PrismaService } from '@/libs/prisma/prisma.service';

/**
 * Stripe Repository
 *
 * Responsabilidades:
 * - Abstração da API do Stripe
 * - Gerenciamento da instância Stripe
 * - Wrapper de operações Stripe
 *
 * Princípio: Single Responsibility - Interface com Stripe apenas
 */
@Injectable()
export class StripeRepository {
  private readonly logger = new Logger(StripeRepository.name);
  private stripe: Stripe;

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    const secretKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    if (!secretKey) {
      throw new Error('STRIPE_SECRET_KEY is required');
    }
    this.stripe = new Stripe(secretKey);
  }

  /**
   * Criar cliente no Stripe
   */
  async createCustomer(
    email: string,
    name: string,
    tenantId: string,
  ): Promise<Stripe.Customer> {
    try {
      const customer = await this.stripe.customers.create({
        email,
        name,
        metadata: { tenantId },
      });
      this.logger.log(`Stripe customer created: ${customer.id}`);
      return customer;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to create Stripe customer: ${message}`);
      throw new BadRequestException('Falha ao criar cliente no Stripe');
    }
  }

  /**
   * Recuperar cliente do Stripe
   */
  async getCustomer(customerId: string): Promise<Stripe.Customer> {
    const customer = await this.stripe.customers.retrieve(customerId);
    return customer as Stripe.Customer;
  }

  /**
   * Criar sessão de checkout
   */
  async createCheckoutSession(data: {
    customerId: string;
    priceId: string;
    successUrl: string;
    cancelUrl: string;
  }): Promise<Stripe.Checkout.Session> {
    const session = await this.stripe.checkout.sessions.create({
      customer: data.customerId,
      line_items: [{ price: data.priceId, quantity: 1 }],
      mode: 'subscription',
      success_url: data.successUrl,
      cancel_url: data.cancelUrl,
    });
    return session;
  }

  /**
   * Recuperar sessão de checkout
   */
  async getCheckoutSession(
    sessionId: string,
  ): Promise<Stripe.Checkout.Session> {
    const session = await this.stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription', 'customer'],
    });
    return session;
  }

  /**
   * Recuperar line items da sessão de checkout
   */
  async getCheckoutSessionLineItems(
    sessionId: string,
  ): Promise<Stripe.ApiList<Stripe.LineItem>> {
    const lineItems = await this.stripe.checkout.sessions.listLineItems(
      sessionId,
      { expand: ['data.price'] },
    );
    return lineItems;
  }

  /**
   * Atualizar assinatura
   * - proration_behavior: 'always_invoice' garante cobrança imediata da diferença
   * - payment_behavior: 'error_if_incomplete' falha se não conseguir cobrar
   */
  async updateSubscription(
    subscriptionId: string,
    priceId: string,
  ): Promise<Stripe.Subscription> {
    const subscription =
      await this.stripe.subscriptions.retrieve(subscriptionId);
    if (!subscription.items.data[0]) {
      throw new BadRequestException('Assinatura inválida');
    }

    const updated = await this.stripe.subscriptions.update(subscriptionId, {
      items: [
        {
          id: subscription.items.data[0].id,
          price: priceId,
        },
      ],
      proration_behavior: 'always_invoice', // Gera invoice imediatamente
      payment_behavior: 'error_if_incomplete', // Falha se pagamento não completar
    });
    return updated;
  }

  /**
   * Cancelar assinatura
   */
  async cancelSubscription(
    subscriptionId: string,
  ): Promise<Stripe.Subscription> {
    const subscription = await this.stripe.subscriptions.cancel(subscriptionId);
    this.logger.log(`Stripe subscription cancelled: ${subscriptionId}`);
    return subscription;
  }

  /**
   * Recuperar assinatura
   */
  async getSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
    const subscription =
      await this.stripe.subscriptions.retrieve(subscriptionId);
    return subscription;
  }

  /**
   * Listar assinaturas do cliente
   */
  async listSubscriptions(customerId: string): Promise<Stripe.Subscription[]> {
    const subscriptions = await this.stripe.subscriptions.list({
      customer: customerId,
    });
    return subscriptions.data;
  }

  /**
   * Criar portal de faturamento
   */
  async createBillingPortalSession(
    customerId: string,
    returnUrl: string,
  ): Promise<Stripe.BillingPortal.Session> {
    const session = await this.stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });
    return session;
  }

  /**
   * Construir webhook event
   */
  buildWebhookEvent(
    body: Buffer,
    signature: string,
    secret: string,
  ): Stripe.Event {
    const event = this.stripe.webhooks.constructEvent(body, signature, secret);
    return event;
  }
}
