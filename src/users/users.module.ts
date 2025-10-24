import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthProvider } from './providers/auth.provider';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { MailModule } from 'src/mail/mail.module';
import { MailService } from 'src/mail/mail.service';
@Module({
  imports: [
    MailModule,
    TypeOrmModule.forFeature([User]),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        //Method injection
        return {
          global: true,
          secret: config.get<string>('JWT_SECRET'),
          signOptions: {
            expiresIn: config.get('JWT_EXPIRE'),
          },
        };
      },
    }),
    MulterModule.register({
      storage: diskStorage({
        destination: './uploads/profile-images',
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const fileName = `${uniqueSuffix}-${file.originalname}`;
          cb(null, fileName);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
          cb(new Error('Unsupported file type'), false);
        } else {
          cb(null, true);
        }
      },
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  ],

  controllers: [UsersController],
  providers: [UsersService, AuthProvider],
  exports: [UsersService],
})
export class UsersModule {
  constructor() {}
}
