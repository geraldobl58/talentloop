import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LoggerModule as PinoLoggerModule } from 'nestjs-pino';

@Module({
  imports: [
    PinoLoggerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const isProduction = configService.get('NODE_ENV') === 'production';

        return {
          pinoHttp: {
            level: isProduction ? 'info' : 'debug',
            transport: isProduction
              ? undefined
              : {
                  target: 'pino-pretty',
                  options: {
                    colorize: true,
                    translateTime: 'yyyy-mm-dd HH:MM:ss',
                    ignore: 'pid,hostname,context,req,res',
                    messageFormat: '[{context}] {msg}',
                    errorLikeObjectKeys: ['err', 'error'],
                  },
                },
            serializers: {
              req: (req) => ({
                method: req.method,
                url: req.url,
                remoteAddress: req.remoteAddress,
                remotePort: req.remotePort,
              }),
              res: (res) => ({
                statusCode: res.statusCode,
              }),
            },
            autoLogging: {
              ignore: (req: any) => {
                // Ignore health check and static assets
                return (
                  req.url?.includes('/health') ||
                  req.url?.includes('/docs') ||
                  req.url?.includes('.css') ||
                  req.url?.includes('.js') ||
                  req.url?.includes('.ico')
                );
              },
            },
            customProps: () => ({
              context: 'HTTP',
            }),
          },
        };
      },
    }),
  ],
  exports: [PinoLoggerModule],
})
export class LoggerModule {}
