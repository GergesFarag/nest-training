import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { LoginDTO } from '../users/dtos/login.dto';
@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  public async sendEmail(user: LoginDTO) {
    try {
      const today = new Date();
      const response = await this.mailerService.sendMail({
        to: user.email,
        from: 'no-reply@Gerges-NestJS',
        subject: 'Logged in Successfully!',
        date: today.toDateString(),
        template: 'login',
        context: { email: user.email, date: today.toDateString() },
      });
      console.log(response);
    } catch (err) {
      console.log('Error sending email', err);
    }
  }

  public async sendVerifyEmailTemplate(email: string, link: string) {
    try {
      const today = new Date();
      const response = await this.mailerService.sendMail({
        to: email,
        from: 'no-reply@Gerges-NestJS',
        subject: 'Verify Your Email',
        date: today.toDateString(),
        template: 'verification',
        context: { link },
      });
      console.log(response);
    } catch (err) {
      console.log('Error sending email', err);
    }
  }

  public async sendResetPasswordTemplate(email: string, link: string) {
    try {
      const today = new Date();
      const response = await this.mailerService.sendMail({
        to: email,
        from: 'no-reply@Gerges-NestJS',
        subject: 'Verify Your Email',
        date: today.toDateString(),
        template: 'resetPassword',
        context: { link },
      });
      console.log(response);
    } catch (err) {
      console.log('Error sending email', err);
    }
  }
}
