import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserType } from 'src/utils/enums';
import { CURRENT_USER_KEY } from 'src/utils/constants';
import { JWTPayloadType } from 'src/utils/types';

@Injectable()
export class AuthRolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}
  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserType[]>(
      'roles',
      [context.getHandler(), context.getClass()],
    );
    if (!requiredRoles) return false;
    const request: Request = context.switchToHttp().getRequest();
    const payload:JWTPayloadType = request[CURRENT_USER_KEY];
    return requiredRoles.includes(payload.userType);
  }
}
