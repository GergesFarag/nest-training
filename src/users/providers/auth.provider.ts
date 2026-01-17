import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../user.entity';
import { Repository } from 'typeorm';
import { RegisterDTO } from '../dtos/register.dto';
import * as bcrypt from 'bcrypt';
import { JWTPayloadType } from '../../utils/types';
import { generateJWT, generateVLink } from '../../utils/auth';
import { JwtService } from '@nestjs/jwt';
import { LoginDTO } from '../dtos/login.dto';
import { MailService } from '../../mail/mail.service';
import { randomBytes } from 'crypto';
import { ConfigService } from '@nestjs/config';
import { ResetPasswordDto } from '../dtos/reset-password.dto';

@Injectable()
export class AuthProvider {
  constructor(
    @InjectRepository(User) private readonly usersRepo: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
    private readonly configService: ConfigService,
  ) {}
  /**
   * Create New User
   * @param {RegisterDTO} user Data for created user
   *
   * @returns JWT (current returns the user itself)
   */
  public async register(user: RegisterDTO) {
    const { email, password } = user;
    const isExists = await this.usersRepo.findOne({ where: { email } });
    if (isExists) {
      throw new BadRequestException('User Already Exists');
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPass = await bcrypt.hash(password, salt);
    const verificationToken = randomBytes(32).toString('hex');
    const newUser = this.usersRepo.create({
      ...user,
      password: hashedPass, // Use hashed password here!
      verificationToken,
    });
    await this.usersRepo.save(newUser);

    const verificationLink = generateVLink(
      newUser.id,
      email,
      this.configService,
    );

    await this.mailService.sendVerifyEmailTemplate(
      user.email,
      verificationLink,
    );
    return { message: 'Verification Token has sent to your email!' };
  }

  /**
   * Login User
   * @param user data for login user account
   * @returns JWT (current returns the user itself)
   */
  public async login(user: LoginDTO) {
    const { email, password } = user;
    const isExists = await this.usersRepo.findOne({ where: { email } });
    if (!isExists)
      throw new BadRequestException('Email or password is incorrect!');
    const isMatch = await bcrypt.compare(password.trim(), isExists.password);
    if (!isMatch)
      throw new BadRequestException('Email or password is incorrect');
    if (!isExists.isVerified) {
      let vToken = isExists.verificationToken as string;
      if (!isExists.verificationToken) {
        isExists.verificationToken = randomBytes(32).toString('hex');
        vToken = (await this.usersRepo.save(isExists))
          .verificationToken as string;
      }
      const verificationLink = generateVLink(
        isExists.id,
        vToken,
        this.configService,
      );
      await this.mailService.sendVerifyEmailTemplate(
        user.email,
        verificationLink,
      );
      return { message: 'Verification Sent To Your Email' };
    }
    const payload: JWTPayloadType = {
      id: isExists.id,
      userType: isExists.role,
    };
    const jwt = await generateJWT(payload, this.jwtService);
    return { message: 'User Logged in Successfully !', data: jwt };
  }

  public async sendResetPasswordLink(email: string) {
    const user = await this.usersRepo.findOne({ where: { email } });
    if (!user)
      throw new NotFoundException('User with this email does not exist!');
    if (user.resetPasswordToken)
      throw new BadRequestException('Reset Password Token exists');
    user.resetPasswordToken = randomBytes(32).toString('hex');
    const updatedUser = await this.usersRepo.save(user);
    const link = `http://localhost:3000/reset-password/${user.id}/${user.resetPasswordToken}`;
    await this.mailService.sendResetPasswordTemplate(updatedUser.email, link);
    return { message: 'Verification Link sent successfully!' };
  }

  public async getResetPasswordLink(
    userId: number,
    resetPasswordToken: string,
  ) {
    const user = await this.usersRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User is not exists');
    if (
      user.resetPasswordToken == null ||
      user.resetPasswordToken !== resetPasswordToken
    ) {
      throw new BadRequestException('Invalid Link!');
    }
    return { message: 'Valid Link' };
  }

  public async resetPassword(resetPassDto: ResetPasswordDto) {
    const { userId, newPassword, resetPasswordToken } = resetPassDto;
    const user = await this.usersRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User is not exists');
    if (
      user.resetPasswordToken == null ||
      user.resetPasswordToken !== resetPasswordToken
    ) {
      throw new BadRequestException('Invalid Link!');
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPass = await bcrypt.hash(newPassword, salt);
    user.password = hashedPass;
    user.resetPasswordToken = null;
    await this.usersRepo.save(user);
    return { message: 'User Password Reset Successfully! please login' };
  }
}
