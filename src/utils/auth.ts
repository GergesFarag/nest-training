import { JwtService } from '@nestjs/jwt';
import { JWTPayloadType } from './types';

export const generateJWT = async (
  payload: JWTPayloadType,
  jwtService: JwtService,
) => {
  const jwt = await jwtService.signAsync(payload);
  return jwt;
};
