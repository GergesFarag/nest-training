import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { RegisterDTO } from './dtos/register.dto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { LoginDTO } from './dtos/login.dto';
import { JwtService } from '@nestjs/jwt';
import { JWTPayloadType } from 'src/utils/types';
import { User } from './user.entity';
import { generateJWT } from 'src/utils/auth';
import { ConfigService } from '@nestjs/config';
import { UpdateProfileDTO } from './dtos/update-profile.dto';
import { UserType } from 'src/utils/enums';
import { AuthProvider } from './providers/auth.provider';
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly usersRepo: Repository<User>,
    private readonly authProvider:AuthProvider
  ) {}

  public async getUsers(): Promise<User[]> {
    return await this.usersRepo.find();
  }


  public async getUserById(id: number) {
    const user = await this.usersRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User Not Found!');
    return { message: 'User Got', data: user };
  }

  public async updateProfile(userId: number, user: Partial<UpdateProfileDTO>) {
    const updateResult = await this.usersRepo.update({ id: userId }, user);
    if (updateResult.affected === 0) {
      throw new NotFoundException('User Not Found!');
    }
    const updatedUser = await this.usersRepo.findOne({ where: { id: userId } });
    return { message: 'User Updated Successfully!', data: updatedUser };
  }
  public async login(user: LoginDTO) {
    return this.authProvider.login(user);
  }
  public async register(user: RegisterDTO) {
    return this.authProvider.register(user);
  }
  public async deleteUser(userId: number) {
    const {data: user} = await this.getUserById(userId);
    if (!user) throw new NotFoundException('User not Found!');
    console.log("User" , user);
    if (user.role === UserType.ADMIN)
      throw new ForbiddenException(
        'Admin Cannot delete himself or other admins!',
      );
    const deletedUser = await this.usersRepo.remove(user);
    if (!deletedUser) throw new BadRequestException('User not deleted!');
    return { message: 'User Deleted Successfully!', data: deletedUser };
  }
}
