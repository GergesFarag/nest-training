import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Logger,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  ValidationPipe,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { RegisterDTO } from './dtos/register.dto';
import { LoginDTO } from './dtos/login.dto';
import { AuthGuard } from './guards/auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { JWTPayloadType } from 'src/utils/types';
import { Roles } from './decorators/user-role.decorator';
import { UserType } from 'src/utils/enums';
import { User } from './user.entity';
import { AuthRolesGuard } from './guards/auth-roles.guard';
import { UpdateProfileDTO } from './dtos/update-profile.dto';
import { LoggerInterceptor } from 'src/utils/interceptors/logger.interceptor';
import { AuthProvider } from './providers/auth.provider';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { Response } from 'express';
import { ResetPasswordDto } from './dtos/reset-password.dto';
import { ForgotPasswordDto } from './dtos/forgot-password.dto';
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles(UserType.ADMIN) //SET HERE all roles allowed to this route
  @UseGuards(AuthGuard, AuthRolesGuard)
  public getUsers() {
    return this.usersService.getUsers();
  }

  @Get('profile')
  @UseGuards(AuthGuard)
  public getUserById(@CurrentUser() payload: JWTPayloadType) {
    return this.usersService.getUserById(payload.id);
  }

  @Post('register')
  public register(@Body() user: RegisterDTO) {
    return this.usersService.register(user);
  }
  @Post('login')
  @HttpCode(HttpStatus.OK)
  public login(@Body() user: LoginDTO) {
    return this.usersService.login(user);
  }

  @Patch('profile')
  @UseGuards(AuthGuard)
  public updateProfile(
    @CurrentUser() payload: JWTPayloadType,
    @Body()
    user: Partial<UpdateProfileDTO>,
  ) {
    return this.usersService.updateProfile(payload.id, user);
  }

  @Delete('profile-image')
  @UseGuards(AuthGuard)
  public deleteProfileImage(@CurrentUser() payload: JWTPayloadType) {
    return this.usersService.removeProfileImage(payload.id);
  }

  @Delete(':id')
  @Roles(UserType.ADMIN)
  @UseGuards(AuthGuard, AuthRolesGuard)
  public deleteUser(@Param('id', ParseIntPipe) userId: number) {
    return this.usersService.deleteUser(userId);
  }

  @Post('upload-image')
  @UseInterceptors(FileInterceptor('image'))
  @UseGuards(AuthGuard)
  public uploadProfileImage(
    @CurrentUser() payload: JWTPayloadType,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.usersService.uploadProfileImage(payload.id, file.path);
  }

  @Get('profile-image')
  @UseGuards(AuthGuard)
  public async getProfileImage(
    @CurrentUser() payload: JWTPayloadType,
    @Res() response: Response,
  ) {
    const result = await this.usersService.getProfileImage(payload.id);
    response.sendFile(result.path, (err) => {
      if (err) {
        console.error(err);
        if (!response.headersSent) {
          response.status(500).end();
        }
      }
    });
  }

  @Get('verify-email/:userId/:verificationToken')
  public verfiyEmail(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('verificationToken') vToken: string,
  ) {
    return this.usersService.verifyEmail(userId, vToken);
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  public forgotPassword(@Body() resetPasswordDto: ForgotPasswordDto) {
    return this.usersService.sendResetPassword(resetPasswordDto.email);
  }

  @Get('reset-password/:userId/:resetToken')
  public getResetPassword(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('resetToken') resetToken: string,
  ) {
    return this.usersService.getPasswordLink(userId, resetToken);
  }

  @Post('reset-password')
  public resetPassword(@Body() body: ResetPasswordDto) {
    return this.usersService.resetPassword(body);
  }
}
