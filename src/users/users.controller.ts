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

  @Delete(':id')
  @Roles(UserType.ADMIN)
  @UseGuards(AuthGuard, AuthRolesGuard)
  public deleteUser(@Param('id', ParseIntPipe) userId: number) {
    return this.usersService.deleteUser(userId);
  }
}
