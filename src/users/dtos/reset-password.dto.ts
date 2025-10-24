import {
  IsNotEmpty,
  IsNumber,
  IsString,
  IsStrongPassword,
  Min,
  MinLength,
} from 'class-validator';

export class ResetPasswordDto {
  @IsString()
  @IsNotEmpty()
  @IsStrongPassword()
  newPassword: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  userId: number;

  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  resetPasswordToken: string;
}
