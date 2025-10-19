import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../user.entity';
import { Repository } from 'typeorm';
import { RegisterDTO } from '../dtos/register.dto';
import * as bcrypt from 'bcrypt';
import { JWTPayloadType } from 'src/utils/types';
import { generateJWT } from 'src/utils/auth';
import { JwtService } from '@nestjs/jwt';
import { LoginDTO } from '../dtos/login.dto';
@Injectable()
export class AuthProvider {
  constructor(
    @InjectRepository(User) private readonly usersRepo: Repository<User>,
    private readonly jwtService: JwtService,
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

    const newUser = this.usersRepo.create({
      ...user,
      password: hashedPass, // Use hashed password here!
    });
    await this.usersRepo.save(newUser);
    const payload: JWTPayloadType = {
      id: newUser.id,
      userType: newUser.role,
    };
    const jwt = await generateJWT(payload, this.jwtService);
    return { data: jwt, message: 'User Created Successfully !' };
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
    const payload: JWTPayloadType = {
      id: isExists.id,
      userType: isExists.role,
    };
    const jwt = await generateJWT(payload, this.jwtService);
    return { message: 'User Logged in Successfully !', data: jwt };
  }
}
