import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { RegisterDTO } from './dtos/register.dto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { LoginDTO } from './dtos/login.dto';
import { User } from './user.entity';
import { UpdateProfileDTO } from './dtos/update-profile.dto';
import { UserType } from '../utils/enums';
import { AuthProvider } from './providers/auth.provider';
import { join } from 'path';
import { unlinkSync, existsSync } from 'fs';
import { ResetPasswordDto } from './dtos/reset-password.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly usersRepo: Repository<User>,
    private readonly authProvider: AuthProvider,
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
    const { data: user } = await this.getUserById(userId);
    if (!user) throw new NotFoundException('User not Found!');
    console.log('User', user);
    if (user.role === UserType.ADMIN)
      throw new ForbiddenException(
        'Admin Cannot delete himself or other admins!',
      );
    const deletedUser = await this.usersRepo.remove(user);
    if (!deletedUser) throw new BadRequestException('User not deleted!');
    return { message: 'User Deleted Successfully!', data: deletedUser };
  }

  public async uploadProfileImage(userId: number, imagePath: string) {
    const user = (await this.getUserById(userId)).data;
    if (user.profileImage) {
      await this.removeProfileImage(userId);
    }
    user.profileImage = imagePath;
    const updatedUser = await this.usersRepo.save(user);
    return {
      message: 'Profile Image Uploaded Successfully!',
      data: updatedUser,
    };
  }
  public async removeProfileImage(userId: number) {
    const user = (await this.getUserById(userId)).data;
    if (!user.profileImage) {
      throw new BadRequestException('There is no profile image!');
    }
    const imagePath = join(process.cwd(), user.profileImage);
    if (existsSync(imagePath)) {
      try {
        unlinkSync(imagePath);
      } catch (err) {
        console.error('Failed to delete profile image file', err);
      }
    }
    user.profileImage = null;
    const updatedOne = await this.usersRepo.save(user);
    return { message: 'Profile image deleted successfully!', data: updatedOne };
  }
  public async getProfileImage(userId: number) {
    const user = (await this.getUserById(userId)).data;
    if (!user.profileImage) {
      throw new BadRequestException('No Profile image found!');
    }
    const imagePath = join(process.cwd(), user.profileImage);
    return { path: imagePath };
  }

  public async verifyEmail(userId: number, verificationToken: string) {
    const user = (await this.getUserById(userId)).data;
    if (!user.verificationToken)
      throw new NotFoundException('There is no verification token');
    if (user.verificationToken !== verificationToken)
      throw new BadRequestException('invalid link');
    user.isVerified = true;
    user.verificationToken = null;
    await this.usersRepo.save(user);
    return { message: 'Your email verified successfully!' };
  }

  public async sendResetPassword(email: string) {
    return this.authProvider.sendResetPasswordLink(email);
  }

  public async getPasswordLink(userId: number, resetPasswordToken: string) {
    return this.authProvider.getResetPasswordLink(userId, resetPasswordToken);
  }

  public async resetPassword(resetPassDto: ResetPasswordDto) {
    return this.authProvider.resetPassword(resetPassDto);
  }
}
