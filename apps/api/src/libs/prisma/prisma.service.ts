import {
  INestApplication,
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    super();
  }

  async onModuleInit() {
    try {
      await this.$connect();
    } catch (error) {
      console.error('Prisma connection error:', error);
      throw error;
    }
  }

  async onModuleDestroy() {
    try {
      await this.$disconnect();
    } catch (error) {
      console.error('Prisma disconnect error:', error);
    }
  }

  enableShutdownHooks(app: INestApplication) {
    // Prisma typings can be strict about events; use a safe fallback
    try {
      // @ts-expect-error runtime event name
      this.$on('beforeExit', () => {
        void app.close();
      });
    } catch {
      // fallback to process hook
      process.on('beforeExit', () => {
        void app.close();
      });
    }
  }
}
