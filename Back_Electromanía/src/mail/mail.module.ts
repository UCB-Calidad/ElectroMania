// src/mail/mail.module.ts
import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailService } from './service/mail.service';

@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const host = configService.get('mail.host');
        const port = configService.get('mail.port');
        const user = configService.get('mail.user');
        const from = configService.get('mail.from');
        return {
          transport: {
            host,
            port: Number.parseInt(port || '587'),
            secure: true,
            auth: {
              user,
              pass: configService.get('mail.password'),
            },
            tls: {
              rejectUnauthorized: false,
            },
            connectionTimeout: 10000,
            socketTimeout: 10000,
          },
          defaults: {
            from,
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
