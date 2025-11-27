import {
  describe,
  it,
  expect,
  beforeAll,
  afterAll,
  vi,
  beforeEach,
} from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { StripeController } from '@/stripe/stripe.controller';
import { StripeService } from '@/stripe/services/stripe.service';

describe('Stripe Webhook (e2e)', () => {
  let app: INestApplication;

  const mockStripeService = {
    constructWebhookEvent: vi.fn(),
    handleWebhookEvent: vi.fn(),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [StripeController],
      providers: [{ provide: StripeService, useValue: mockStripeService }],
    }).compile();

    app = moduleFixture.createNestApplication();
    // Disable NestJS Logger to suppress error logs during tests
    app.useLogger(false);
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset mocks to default behavior
    mockStripeService.constructWebhookEvent.mockReset();
    mockStripeService.handleWebhookEvent.mockReset();
  });

  describe('/stripe/webhook (POST)', () => {
    it('should return 400 when stripe-signature header is missing', async () => {
      const response = await request(app.getHttpServer())
        .post('/stripe/webhook')
        .send({ type: 'test.event' });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('stripe-signature');
    });

    it('should process valid webhook event', async () => {
      const mockEvent = {
        id: 'evt_xxx',
        type: 'customer.subscription.updated',
        data: { object: {} },
      };

      mockStripeService.constructWebhookEvent.mockReturnValue(mockEvent);
      mockStripeService.handleWebhookEvent.mockResolvedValue(undefined);

      const response = await request(app.getHttpServer())
        .post('/stripe/webhook')
        .set('stripe-signature', 'valid-signature')
        .send(JSON.stringify({ type: 'test.event' }));

      expect(response.status).toBe(201);
      expect(response.body).toEqual({ received: true });
      expect(mockStripeService.constructWebhookEvent).toHaveBeenCalled();
      expect(mockStripeService.handleWebhookEvent).toHaveBeenCalledWith(
        mockEvent,
      );
    });

    it('should return 500 for invalid webhook signature', async () => {
      mockStripeService.constructWebhookEvent.mockImplementation(() => {
        throw new Error('Invalid signature');
      });

      const response = await request(app.getHttpServer())
        .post('/stripe/webhook')
        .set('stripe-signature', 'invalid-signature')
        .send(JSON.stringify({ type: 'test.event' }));

      // Controller doesn't catch this error, so NestJS returns 500
      expect(response.status).toBe(500);
    });
  });
});
