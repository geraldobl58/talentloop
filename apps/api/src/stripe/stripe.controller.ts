import {
  Controller,
  Post,
  Headers,
  Req,
  BadRequestException,
  RawBodyRequest,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Request } from 'express';
import { StripeService } from './services/stripe.service';

@ApiTags('Stripe')
@Controller('stripe')
export class StripeController {
  constructor(private readonly stripeService: StripeService) {}

  @Post('webhook')
  @ApiOperation({ summary: 'Handle Stripe webhook events' })
  async handleWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ) {
    if (!signature) {
      throw new BadRequestException('Cabeçalho stripe-signature ausente');
    }

    // Use rawBody for Stripe signature verification
    // The raw body is needed because Stripe signs the raw payload
    const payload = req.rawBody || req.body;

    if (!payload) {
      throw new BadRequestException('Nenhum payload de webhook fornecido');
    }

    const event = this.stripeService.constructWebhookEvent(payload, signature);
    await this.stripeService.handleWebhookEvent(event);

    return { received: true };
  }
}
