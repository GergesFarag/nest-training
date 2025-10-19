import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { CURRENT_USER_KEY } from 'src/utils/constants';
import { JWTPayloadType } from 'src/utils/types';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    if (token && type === 'Bearer') {
      try {
        const verifiedUser: JWTPayloadType = await this.jwtService.verifyAsync(
          token,
          {
            secret: this.configService.get<string>('JWT_SECRET'),
          },
        );
        request[CURRENT_USER_KEY] = verifiedUser;
      } catch (error) {
        throw new UnauthorizedException(error);
      }
    } else {
      throw new UnauthorizedException('Access denied , No Token Provided!'); //throws Exception
    }
    return true;
  }
}
