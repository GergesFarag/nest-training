import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsStrongPassword,
} from 'class-validator';
import { AuthBaseDTO } from './auth-base.dto';

export class RegisterDTO extends AuthBaseDTO {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  username: string;

  @IsNotEmpty()
  @IsStrongPassword()
  password: string = "";
}
