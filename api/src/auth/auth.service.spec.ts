import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { PrismaService } from '../database/prisma.service';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcrypt';

// Mock bcrypt at module level
jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let prismaService: PrismaService;
  let userService: UserService;
  let jwtService: JwtService;
  let configService: ConfigService;

  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    password: '$2b$10$hashedpassword',
    firstName: 'John',
    lastName: 'Doe',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockUserEntity = {
    id: 'user-123',
    email: 'test@example.com',
    firstName: 'John',
    lastName: 'Doe',
    isActive: true,
    createdAt: mockUser.createdAt,
    updatedAt: mockUser.updatedAt,
  };

  const mockTokens = {
    accessToken: 'mock-access-token',
    refreshToken: 'mock-refresh-token',
  };

  const mockRefreshToken = {
    id: 'token-123',
    token: 'mock-refresh-token',
    userId: 'user-123',
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    createdAt: new Date(),
    user: mockUser,
  };

  const mockPrismaService = {
    refreshToken: {
      findUnique: jest.fn(),
      create: jest.fn(),
      upsert: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
    },
  };

  const mockUserService = {
    create: jest.fn(),
    findByEmail: jest.fn(),
  };

  const mockJwtService = {
    signAsync: jest.fn(),
    decode: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: UserService, useValue: mockUserService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prismaService = module.get<PrismaService>(PrismaService);
    userService = module.get<UserService>(UserService);
    jwtService = module.get<JwtService>(JwtService);
    configService = module.get<ConfigService>(ConfigService);

    // Reset all mocks
    jest.clearAllMocks();

    // Setup bcrypt mocks
    (bcrypt.hash as jest.MockedFunction<typeof bcrypt.hash>).mockResolvedValue('$2b$10$hashedpassword' as never);
    (bcrypt.compare as jest.MockedFunction<typeof bcrypt.compare>).mockResolvedValue(true as never);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    const createUserDto = {
      email: 'test@example.com',
      password: 'Password123!',
      firstName: 'John',
      lastName: 'Doe',
    };

    it('should successfully register a new user', async () => {
      mockUserService.create.mockResolvedValue(mockUserEntity);
      mockJwtService.signAsync
        .mockResolvedValueOnce(mockTokens.accessToken)
        .mockResolvedValueOnce(mockTokens.refreshToken);
      mockJwtService.decode.mockReturnValue({ exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60 });
      mockPrismaService.refreshToken.upsert.mockResolvedValue(mockRefreshToken);

      const result = await service.register(createUserDto);

      expect(result).toEqual({
        user: mockUserEntity,
        accessToken: mockTokens.accessToken,
        refreshToken: mockTokens.refreshToken,
      });
      expect(userService.create).toHaveBeenCalledWith(createUserDto);
      expect(jwtService.signAsync).toHaveBeenCalledTimes(2);
      expect(prismaService.refreshToken.upsert).toHaveBeenCalled();
    });

    it('should throw error if user creation fails', async () => {
      mockUserService.create.mockRejectedValue(new Error('Database error'));

      await expect(service.register(createUserDto)).rejects.toThrow('Database error');
    });

    it('should upsert refresh token correctly', async () => {
      mockUserService.create.mockResolvedValue(mockUserEntity);
      mockJwtService.signAsync
        .mockResolvedValueOnce(mockTokens.accessToken)
        .mockResolvedValueOnce(mockTokens.refreshToken);
      mockJwtService.decode.mockReturnValue({ exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60 });
      mockPrismaService.refreshToken.upsert.mockResolvedValue(mockRefreshToken);

      await service.register(createUserDto);

      expect(prismaService.refreshToken.upsert).toHaveBeenCalledWith({
        where: { userId: mockUserEntity.id },
        update: expect.objectContaining({
          token: mockTokens.refreshToken,
        }),
        create: expect.objectContaining({
          token: mockTokens.refreshToken,
          userId: mockUserEntity.id,
        }),
      });
    });
  });

  describe('login', () => {
    const loginDto = {
      email: 'test@example.com',
      password: 'Password123!',
    };

    it('should successfully login a user', async () => {
      mockUserService.findByEmail.mockResolvedValue(mockUser);
      mockJwtService.signAsync
        .mockResolvedValueOnce(mockTokens.accessToken)
        .mockResolvedValueOnce(mockTokens.refreshToken);
      mockJwtService.decode.mockReturnValue({ exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60 });
      mockPrismaService.refreshToken.upsert.mockResolvedValue(mockRefreshToken);

      const result = await service.login(loginDto);

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('accessToken', mockTokens.accessToken);
      expect(result).toHaveProperty('refreshToken', mockTokens.refreshToken);
      expect(userService.findByEmail).toHaveBeenCalledWith(loginDto.email);
    });

    it('should throw UnauthorizedException if user not found', async () => {
      mockUserService.findByEmail.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
      await expect(service.login(loginDto)).rejects.toThrow('Invalid credentials');
    });

    it('should throw UnauthorizedException if password is invalid', async () => {
      mockUserService.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.MockedFunction<typeof bcrypt.compare>).mockResolvedValue(false as never);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
      await expect(service.login(loginDto)).rejects.toThrow('Invalid credentials');
    });

    it('should throw UnauthorizedException if user is inactive', async () => {
      const inactiveUser = { ...mockUser, isActive: false };
      mockUserService.findByEmail.mockResolvedValue(inactiveUser);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
      await expect(service.login(loginDto)).rejects.toThrow('User account is inactive');
    });

    it('should replace existing refresh token on login', async () => {
      mockUserService.findByEmail.mockResolvedValue(mockUser);
      mockJwtService.signAsync
        .mockResolvedValueOnce(mockTokens.accessToken)
        .mockResolvedValueOnce(mockTokens.refreshToken);
      mockJwtService.decode.mockReturnValue({ exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60 });
      mockPrismaService.refreshToken.upsert.mockResolvedValue(mockRefreshToken);

      await service.login(loginDto);

      expect(prismaService.refreshToken.upsert).toHaveBeenCalledWith({
        where: { userId: mockUser.id },
        update: expect.any(Object),
        create: expect.any(Object),
      });
    });
  });

  describe('refreshTokens', () => {
    const userId = 'user-123';
    const refreshToken = 'valid-refresh-token';

    it('should successfully refresh tokens', async () => {
      mockPrismaService.refreshToken.findUnique.mockResolvedValue(mockRefreshToken);
      mockJwtService.signAsync
        .mockResolvedValueOnce('new-access-token')
        .mockResolvedValueOnce('new-refresh-token');
      mockJwtService.decode.mockReturnValue({ exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60 });
      mockPrismaService.refreshToken.upsert.mockResolvedValue(mockRefreshToken);

      const result = await service.refreshTokens(userId, refreshToken);

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('accessToken', 'new-access-token');
      expect(result).toHaveProperty('refreshToken', 'new-refresh-token');
    });

    it('should throw UnauthorizedException if refresh token not found', async () => {
      mockPrismaService.refreshToken.findUnique.mockResolvedValue(null);

      await expect(service.refreshTokens(userId, refreshToken)).rejects.toThrow(UnauthorizedException);
      await expect(service.refreshTokens(userId, refreshToken)).rejects.toThrow('Invalid refresh token');
    });

    it('should throw UnauthorizedException if userId does not match', async () => {
      const wrongUserToken = { ...mockRefreshToken, userId: 'different-user' };
      mockPrismaService.refreshToken.findUnique.mockResolvedValue(wrongUserToken);

      await expect(service.refreshTokens(userId, refreshToken)).rejects.toThrow(UnauthorizedException);
      await expect(service.refreshTokens(userId, refreshToken)).rejects.toThrow('Invalid refresh token');
    });

    it('should throw UnauthorizedException if refresh token is expired', async () => {
      const expiredToken = {
        ...mockRefreshToken,
        expiresAt: new Date(Date.now() - 1000),
      };
      mockPrismaService.refreshToken.findUnique.mockResolvedValue(expiredToken);
      mockPrismaService.refreshToken.delete.mockResolvedValue(expiredToken);

      await expect(service.refreshTokens(userId, refreshToken)).rejects.toThrow(UnauthorizedException);
      await expect(service.refreshTokens(userId, refreshToken)).rejects.toThrow('Refresh token expired');
      expect(prismaService.refreshToken.delete).toHaveBeenCalledWith({
        where: { userId: expiredToken.userId },
      });
    });

    it('should throw UnauthorizedException if user is inactive', async () => {
      const tokenWithInactiveUser = {
        ...mockRefreshToken,
        user: { ...mockUser, isActive: false },
      };
      mockPrismaService.refreshToken.findUnique.mockResolvedValue(tokenWithInactiveUser);

      await expect(service.refreshTokens(userId, refreshToken)).rejects.toThrow(UnauthorizedException);
      await expect(service.refreshTokens(userId, refreshToken)).rejects.toThrow('User account is inactive');
    });

    it('should replace old refresh token with new one', async () => {
      mockPrismaService.refreshToken.findUnique.mockResolvedValue(mockRefreshToken);
      mockJwtService.signAsync
        .mockResolvedValueOnce('new-access-token')
        .mockResolvedValueOnce('new-refresh-token');
      mockJwtService.decode.mockReturnValue({ exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60 });
      mockPrismaService.refreshToken.upsert.mockResolvedValue(mockRefreshToken);

      await service.refreshTokens(userId, refreshToken);

      expect(prismaService.refreshToken.upsert).toHaveBeenCalledWith({
        where: { userId },
        update: expect.objectContaining({ token: 'new-refresh-token' }),
        create: expect.objectContaining({ token: 'new-refresh-token', userId }),
      });
    });
  });

  describe('logout', () => {
    it('should successfully logout user', async () => {
      mockPrismaService.refreshToken.delete.mockResolvedValue(mockRefreshToken);

      await service.logout('user-123');

      expect(prismaService.refreshToken.delete).toHaveBeenCalledWith({
        where: { userId: 'user-123' },
      });
    });

    it('should not throw error if token does not exist', async () => {
      mockPrismaService.refreshToken.delete.mockRejectedValue(new Error('Token not found'));

      await expect(service.logout('user-123')).resolves.not.toThrow();
    });
  });

  describe('logoutAll', () => {
    it('should successfully logout user from all devices', async () => {
      mockPrismaService.refreshToken.delete.mockResolvedValue(mockRefreshToken);

      await service.logoutAll('user-123');

      expect(prismaService.refreshToken.delete).toHaveBeenCalledWith({
        where: { userId: 'user-123' },
      });
    });

    it('should not throw error if token does not exist', async () => {
      mockPrismaService.refreshToken.delete.mockRejectedValue(new Error('Token not found'));

      await expect(service.logoutAll('user-123')).resolves.not.toThrow();
    });
  });

  describe('generateTokens (private method)', () => {
    it('should generate both access and refresh tokens', async () => {
      mockJwtService.signAsync
        .mockResolvedValueOnce(mockTokens.accessToken)
        .mockResolvedValueOnce(mockTokens.refreshToken);

      const result = await (service as any).generateTokens('user-123', 'test@example.com');

      expect(result).toEqual(mockTokens);
      expect(jwtService.signAsync).toHaveBeenCalledTimes(2);
      expect(jwtService.signAsync).toHaveBeenCalledWith(
        { sub: 'user-123', email: 'test@example.com' },
        expect.objectContaining({ expiresIn: '15m' }),
      );
      expect(jwtService.signAsync).toHaveBeenCalledWith(
        { sub: 'user-123', email: 'test@example.com' },
        expect.objectContaining({ expiresIn: '7d' }),
      );
    });
  });

  describe('saveRefreshToken (private method)', () => {
    it('should save refresh token with correct expiration', async () => {
      const expTimestamp = Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60;
      mockJwtService.decode.mockReturnValue({ exp: expTimestamp });
      mockPrismaService.refreshToken.upsert.mockResolvedValue(mockRefreshToken);

      await (service as any).saveRefreshToken('user-123', 'refresh-token');

      expect(jwtService.decode).toHaveBeenCalledWith('refresh-token');
      expect(prismaService.refreshToken.upsert).toHaveBeenCalledWith({
        where: { userId: 'user-123' },
        update: {
          token: 'refresh-token',
          expiresAt: new Date(expTimestamp * 1000),
        },
        create: {
          token: 'refresh-token',
          userId: 'user-123',
          expiresAt: new Date(expTimestamp * 1000),
        },
      });
    });
  });
});
