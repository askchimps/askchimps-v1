import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthResponse = {
    user: {
      id: 'user-123',
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    accessToken: 'mock-access-token',
    refreshToken: 'mock-refresh-token',
  };

  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
    refreshTokens: jest.fn(),
    logout: jest.fn(),
    logoutAll: jest.fn(),
    getCurrentUser: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('should register a new user', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        password: 'Password123!',
        firstName: 'John',
        lastName: 'Doe',
      };

      mockAuthService.register.mockResolvedValue(mockAuthResponse);

      const result = await controller.register(createUserDto);

      expect(result).toEqual(mockAuthResponse);
      expect(authService.register).toHaveBeenCalledWith(createUserDto);
      expect(authService.register).toHaveBeenCalledTimes(1);
    });

    it('should handle registration errors', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        password: 'Password123!',
      };

      mockAuthService.register.mockRejectedValue(new Error('Email already exists'));

      await expect(controller.register(createUserDto)).rejects.toThrow('Email already exists');
    });
  });

  describe('login', () => {
    it('should login a user', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'Password123!',
      };

      mockAuthService.login.mockResolvedValue(mockAuthResponse);

      const result = await controller.login(loginDto);

      expect(result).toEqual(mockAuthResponse);
      expect(authService.login).toHaveBeenCalledWith(loginDto);
      expect(authService.login).toHaveBeenCalledTimes(1);
    });

    it('should handle login errors', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'WrongPassword',
      };

      mockAuthService.login.mockRejectedValue(new Error('Invalid credentials'));

      await expect(controller.login(loginDto)).rejects.toThrow('Invalid credentials');
    });
  });

  describe('refresh', () => {
    it('should refresh tokens', async () => {
      const userId = 'user-123';
      const refreshTokenDto: RefreshTokenDto = {
        refreshToken: 'valid-refresh-token',
      };

      mockAuthService.refreshTokens.mockResolvedValue(mockAuthResponse);

      const result = await controller.refresh(userId, refreshTokenDto);

      expect(result).toEqual(mockAuthResponse);
      expect(authService.refreshTokens).toHaveBeenCalledWith(userId, refreshTokenDto.refreshToken);
      expect(authService.refreshTokens).toHaveBeenCalledTimes(1);
    });

    it('should handle refresh errors', async () => {
      const userId = 'user-123';
      const refreshTokenDto: RefreshTokenDto = {
        refreshToken: 'invalid-token',
      };

      mockAuthService.refreshTokens.mockRejectedValue(new Error('Invalid refresh token'));

      await expect(controller.refresh(userId, refreshTokenDto)).rejects.toThrow('Invalid refresh token');
    });
  });

  describe('logout', () => {
    it('should logout a user', async () => {
      const userId = 'user-123';

      mockAuthService.logout.mockResolvedValue(undefined);

      const result = await controller.logout(userId);

      expect(result).toBeUndefined();
      expect(authService.logout).toHaveBeenCalledWith(userId);
      expect(authService.logout).toHaveBeenCalledTimes(1);
    });
  });

  describe('logoutAll', () => {
    it('should logout user from all devices', async () => {
      const userId = 'user-123';

      mockAuthService.logoutAll.mockResolvedValue(undefined);

      const result = await controller.logoutAll(userId);

      expect(result).toBeUndefined();
      expect(authService.logoutAll).toHaveBeenCalledWith(userId);
      expect(authService.logoutAll).toHaveBeenCalledTimes(1);
    });
  });

  describe('getCurrentUser', () => {
    it('should return current user details', async () => {
      const userId = 'user-123';
      const mockUser = {
        id: userId,
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        isActive: true,
        isSuperAdmin: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockAuthService.getCurrentUser.mockResolvedValue(mockUser);

      const result = await controller.getCurrentUser(userId);

      expect(result).toEqual(mockUser);
      expect(authService.getCurrentUser).toHaveBeenCalledWith(userId);
      expect(authService.getCurrentUser).toHaveBeenCalledTimes(1);
    });
  });
});

