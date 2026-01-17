import { Repository } from 'typeorm';
import { AuthProvider } from './auth.provider';
import { User } from '../user.entity';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { MailService } from '../../mail/mail.service';
import { ConfigService } from '@nestjs/config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { RegisterDTO } from '../dtos/register.dto';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { generateVLink } from '../../utils/auth';
import { LoginDTO } from '../dtos/login.dto';

jest.mock('bcrypt');
jest.mock('crypto', () => ({
  randomBytes: jest.fn(),
}));

describe('AuthProvider', () => {
  let authProvider: AuthProvider;
  let userRepo: Repository<User>;
  const USER_REPO_TOKEN = getRepositoryToken(User);

  //*MOCK//
  const user: RegisterDTO = {
    email: 'test@test.com',
    password: 'thisIs@Strong123Pass',
    username: 'Test',
  };
  const userWithId = {
    id: 10,
    ...user,
    isVerified: false,
  };
  const mockUsers = [
    {
      id: 1,
      email: 'test@gmail.com',
      password: 'this_is_hashed_pass',
      username: 'test',
      isVerified: false,
      verificationToken: '',
    },
    {
      id: 2,
      email: 'anotherFakeEmail@gmail.com',
      password: 'anotherHashedPassword',
      username: 'FakeUser2',
      verificationToken: '',
    },
    {
      id: 3,
      email: 'fake@fake.com',
      password: 'noEmailHashedPassword',
      username: 'NoEmailUser',
      verificationToken: '',
    },
  ];
  const mockUserRepo = {
    findOne: jest.fn(({ where }) =>
      Promise.resolve(mockUsers.find((u) => u.email === where.email)),
    ),
    create: jest.fn((user) => user),
    save: jest.fn((user) => ({
      ...user,
      verificationToken: 'verification-token',
    })),
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  const mockMailService = {
    sendVerifyEmailTemplate: jest.fn(),
  };

  const mockJwtSerivce = {
    signAsync: jest.fn(() => 'jwt-token'),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    mockConfigService.get.mockReturnValue('http://localhost:3000/');
    // Set up default mocks for bcrypt and crypto

    (bcrypt.genSalt as jest.Mock).mockResolvedValue('mocked-salt');
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-pass');
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);

    (randomBytes as jest.Mock).mockReturnValue({
      toString: () => 'verification-token',
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthProvider,
        {
          provide: JwtService,
          useValue: mockJwtSerivce,
        },
        {
          provide: MailService,
          useValue: mockMailService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: USER_REPO_TOKEN,
          useValue: mockUserRepo,
        },
      ],
    }).compile();

    authProvider = module.get<AuthProvider>(AuthProvider);
    userRepo = module.get<Repository<User>>(USER_REPO_TOKEN);
  });

  it('should authProvider be defined', () =>
    expect(authProvider).toBeDefined());

  it('should userRepo be defined', () => expect(userRepo).toBeDefined());

  describe('register', () => {
    it('should validate non-existing user', async () => {
      await authProvider.register(user);
      expect(mockUserRepo.findOne).toHaveBeenCalled();
      expect(mockUserRepo.findOne).toHaveBeenCalledWith({
        where: { email: user.email },
      });
    });
    it('should create user', async () => {
      const result = await authProvider.register(user);

      expect(mockUserRepo.create).toHaveBeenCalledTimes(1);
      expect(mockUserRepo.create).toHaveBeenCalledWith({
        ...user,
        password: 'hashed-pass',
        verificationToken: 'verification-token',
      });
      expect(mockUserRepo.save).toHaveBeenCalledTimes(1);
      expect(mockUserRepo.save).toHaveBeenCalled();
      expect(mockMailService.sendVerifyEmailTemplate).toHaveBeenCalledTimes(1);

      expect(result).toEqual({
        message: 'Verification Token has sent to your email!',
      });
    });
    it('should create verification link', () => {
      const link = generateVLink(
        10,
        'verification-token',
        mockConfigService as any,
      );
      expect(mockConfigService.get).toHaveBeenCalledWith('DOMAIN');
      expect(link).toBe(
        'http://localhost:3000/api/v1/users/verify-email/10/verification-token',
      );
    });
  });
  describe('login', () => {
    const userLoginDto: LoginDTO = {
      email: 'test@gmail.com',
      password: 'this_is_hashed_pass',
    };
    it('should validate existing user', async () => {
      mockUserRepo.findOne.mockResolvedValue(mockUsers[0]);
      await authProvider.login(userLoginDto);
      expect(mockUserRepo.findOne).toHaveBeenCalled();
      expect(mockUserRepo.findOne).toHaveBeenCalledWith({
        where: { email: userLoginDto.email },
      });
    });

    it('should compare the hashed password', async () => {
      await authProvider.login(userLoginDto);
      expect(bcrypt.compare).toHaveBeenCalledTimes(1);
      expect(bcrypt.compare).toHaveBeenCalledWith(
        userLoginDto.password.trim(),
        mockUsers[0].password,
      );
    });

    describe('should send verification mail if not verified', () => {
      beforeEach(() => {
        mockUserRepo.findOne.mockResolvedValue({
          ...mockUsers[0],
          verificationToken: '',
        });
        mockUserRepo.save.mockResolvedValue({
          ...mockUsers[0],
          verificationToken: 'verification-token',
        });
      });

      it('should save the verificationToken in user if not exists', async () => {
        await authProvider.login(userLoginDto);
        expect(mockUserRepo.save).toHaveBeenCalledWith(
          expect.objectContaining({
            id: mockUsers[0].id,
            verificationToken: 'verification-token',
          }),
        );
      });
      it('should send verification email', async () => {
        const verificationLink = generateVLink(
          mockUsers[0].id,
          'verification-token',
          mockConfigService as any,
        );
        const response = await authProvider.login(userLoginDto);
        expect(verificationLink).toBe(
          'http://localhost:3000/api/v1/users/verify-email/1/verification-token',
        );
        expect(mockMailService.sendVerifyEmailTemplate).toHaveBeenCalledTimes(
          1,
        );
        expect(mockMailService.sendVerifyEmailTemplate).toHaveBeenCalledWith(
          userLoginDto.email,
          verificationLink,
        );
        expect(response).toMatchObject({
          message: 'Verification Sent To Your Email',
        });
      });
    });

    it('should send jwt with message if verified', async () => {
      mockUserRepo.findOne.mockResolvedValue({
        ...mockUsers[0],
        verificationToken: 'verification-token',
        isVerified: true,
      });
      const response = await authProvider.login(user);
      expect(mockJwtSerivce.signAsync).toHaveBeenCalled();
      expect(response).toBeDefined();
      expect(response).toMatchObject({
        message: 'User Logged in Successfully !',
        data: {},
      });
    });
  });
});
