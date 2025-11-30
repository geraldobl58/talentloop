import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Logger } from 'nestjs-pino';
import * as express from 'express';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    cors: true,
    bufferLogs: true,
    // Disable body parsing globally - we'll configure it per route
    rawBody: true,
  });

  app.useLogger(app.get(Logger));

  // Configurar raw body para webhooks do Stripe PRIMEIRO
  // O Stripe precisa do body como Buffer bruto para verificar a assinatura
  app.use('/stripe/webhook', express.raw({ type: 'application/json' }));

  // Configurar limite de tamanho para upload de arquivos
  // Isso vai parsear JSON para todas as outras rotas
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  const config = new DocumentBuilder()
    .setTitle('Talentloop API')
    .setDescription('The Talentloop API description')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const doc = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, doc);

  await app.listen(process.env.PORT ?? 3333);
}
bootstrap();
