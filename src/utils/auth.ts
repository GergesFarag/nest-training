import { JwtService } from '@nestjs/jwt';
import { JWTPayloadType } from './types';
import { ConfigService } from '@nestjs/config';

export const generateJWT = async (
  payload: JWTPayloadType,
  jwtService: JwtService,
) => {
  const jwt = await jwtService.signAsync(payload);
  return jwt;
};

export const generateVLink = (
  userId: number,
  vToken: string,
  configService: ConfigService,
) => {
  const verificationLink = `${configService.get<string>('DOMAIN')}api/v1/users/verify-email/${userId}/${vToken}`;
  return verificationLink;
};
