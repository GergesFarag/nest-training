import { MailerModule } from '@nestjs-modules/mailer';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailService } from './mail.service';
import { join } from 'path';
import { EjsAdapter } from '@nestjs-modules/mailer/dist/adapters/ejs.adapter';

@Module({
  imports: [
    MailerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const port = config.get<number>('SMTP_PORT');
        return {
          transport: {
            host: config.get<string>('SMTP_HOST'),
            port: port,
            secure: port === 465, // true for 465, false for 587
            auth: {
              user: config.get<string>('SMTP_USER'),
              pass: config.get<string>('SMTP_PASS'),
            },
            connectionTimeout: 60000,
            greetingTimeout: 30000,
            socketTimeout: 60000,
          },
          template: {
            dir: join(__dirname, 'templates'),
            adapter: new EjsAdapter({
              inlineCssEnabled: true,
            }),
          },
        };
      },
    }),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {
  constructor() {}
}
