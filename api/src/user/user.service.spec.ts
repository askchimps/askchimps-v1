import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { UserService } from './user.service';
import { PrismaService } from '../database/prisma.service';
import * as bcrypt from 'bcrypt';

// Mock bcrypt at module level
jest.mock('bcrypt');

describe('UserService', () => {
  let service: UserService;
  let prismaService: PrismaService;

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

  const mockPrismaService = {
    user: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    prismaService = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();

    // Setup bcrypt mocks
    (bcrypt.hash as jest.MockedFunction<typeof bcrypt.hash>).mockResolvedValue('$2b$10$hashedpassword' as never);
    (bcrypt.compare as jest.MockedFunction<typeof bcrypt.compare>).mockResolvedValue(true as never);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createUserDto = {
      email: 'test@example.com',
      password: 'Password123!',
      firstName: 'John',
      lastName: 'Doe',
    };

    it('should successfully create a new user', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue(mockUser);

      const result = await service.create(createUserDto);

      expect(result).toEqual(expect.objectContaining({
        id: mockUser.id,
        email: mockUser.email,
      }));
      expect(result).not.toHaveProperty('password');
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: createUserDto.email },
      });
      expect(bcrypt.hash).toHaveBeenCalledWith(createUserDto.password, 10);
      expect(prismaService.user.create).toHaveBeenCalled();
    });

    it('should throw ConflictException if email already exists', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      await expect(service.create(createUserDto)).rejects.toThrow(ConflictException);
      await expect(service.create(createUserDto)).rejects.toThrow('Email already exists');
      expect(prismaService.user.create).not.toHaveBeenCalled();
    });

    it('should hash password with bcrypt', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue(mockUser);

      await service.create(createUserDto);

      expect(bcrypt.hash).toHaveBeenCalledWith(createUserDto.password, 10);
    });

    it('should create user with hashed password', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue(mockUser);

      await service.create(createUserDto);

      expect(prismaService.user.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          email: createUserDto.email,
          password: '$2b$10$hashedpassword',
          firstName: createUserDto.firstName,
          lastName: createUserDto.lastName,
        }),
      });
    });

    it('should handle optional firstName and lastName', async () => {
      const minimalDto = {
        email: 'test@example.com',
        password: 'Password123!',
      };
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue({ ...mockUser, firstName: null, lastName: null });

      const result = await service.create(minimalDto);

      expect(result).toBeDefined();
      expect(prismaService.user.create).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return all active users', async () => {
      const users = [mockUser, { ...mockUser, id: 'user-456', email: 'test2@example.com' }];
      mockPrismaService.user.findMany.mockResolvedValue(users);

      const result = await service.findAll();

      expect(result).toHaveLength(2);
      expect(result[0]).not.toHaveProperty('password');
      expect(prismaService.user.findMany).toHaveBeenCalledWith({
        where: { isActive: true },
      });
    });

    it('should return empty array if no users found', async () => {
      mockPrismaService.user.findMany.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });

    it('should exclude password from returned users', async () => {
      mockPrismaService.user.findMany.mockResolvedValue([mockUser]);

      const result = await service.findAll();

      result.forEach(user => {
        expect(user).not.toHaveProperty('password');
      });
    });
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.findOne('user-123');

      expect(result).toEqual(expect.objectContaining({
        id: mockUser.id,
        email: mockUser.email,
      }));
      expect(result).not.toHaveProperty('password');
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-123' },
      });
    });

    it('should throw NotFoundException if user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.findOne('non-existent')).rejects.toThrow(NotFoundException);
      await expect(service.findOne('non-existent')).rejects.toThrow('User not found');
    });

    it('should throw NotFoundException if user is inactive', async () => {
      const inactiveUser = { ...mockUser, isActive: false };
      mockPrismaService.user.findUnique.mockResolvedValue(inactiveUser);

      await expect(service.findOne('user-123')).rejects.toThrow(NotFoundException);
      await expect(service.findOne('user-123')).rejects.toThrow('User not found');
    });
  });

  describe('findByEmail', () => {
    it('should return a user by email', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.findByEmail('test@example.com');

      expect(result).toEqual(mockUser);
      expect(result).toHaveProperty('password');
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
    });

    it('should return null if user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      const result = await service.findByEmail('nonexistent@example.com');

      expect(result).toBeNull();
    });

    it('should include password in response (for authentication)', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.findByEmail('test@example.com');

      expect(result).toHaveProperty('password');
    });
  });

  describe('update', () => {
    const updateUserDto = {
      firstName: 'Jane',
      lastName: 'Smith',
    };

    it('should successfully update a user', async () => {
      const updatedUser = { ...mockUser, ...updateUserDto };
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.user.update.mockResolvedValue(updatedUser);

      const result = await service.update('user-123', updateUserDto);

      expect(result).toEqual(expect.objectContaining({
        firstName: 'Jane',
        lastName: 'Smith',
      }));
      expect(result).not.toHaveProperty('password');
      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        data: updateUserDto,
      });
    });

    it('should throw NotFoundException if user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.update('non-existent', updateUserDto)).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if user is inactive', async () => {
      const inactiveUser = { ...mockUser, isActive: false };
      mockPrismaService.user.findUnique.mockResolvedValue(inactiveUser);

      await expect(service.update('user-123', updateUserDto)).rejects.toThrow(NotFoundException);
    });

    it('should allow updating email', async () => {
      const emailUpdate = { email: 'newemail@example.com' };
      mockPrismaService.user.findUnique
        .mockResolvedValueOnce(mockUser)
        .mockResolvedValueOnce(null);
      mockPrismaService.user.update.mockResolvedValue({ ...mockUser, ...emailUpdate });

      const result = await service.update('user-123', emailUpdate);

      expect(result.email).toBe('newemail@example.com');
    });

    it('should throw ConflictException if new email already exists', async () => {
      const emailUpdate = { email: 'existing@example.com' };
      const existingUser = { ...mockUser, id: 'other-user', email: 'existing@example.com' };
      mockPrismaService.user.findUnique
        .mockResolvedValueOnce(mockUser)
        .mockResolvedValueOnce(existingUser)
        .mockResolvedValueOnce(mockUser)
        .mockResolvedValueOnce(existingUser);

      await expect(service.update('user-123', emailUpdate)).rejects.toThrow(ConflictException);
      await expect(service.update('user-123', emailUpdate)).rejects.toThrow('Email already exists');
    });

    it('should hash password if password is being updated', async () => {
      const passwordUpdate = { password: 'NewPassword123!' };
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.hash as jest.MockedFunction<typeof bcrypt.hash>).mockResolvedValueOnce('$2b$10$newhash' as never);
      mockPrismaService.user.update.mockResolvedValue(mockUser);

      await service.update('user-123', passwordUpdate);

      expect(bcrypt.hash).toHaveBeenCalledWith('NewPassword123!', 10);
      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        data: { password: '$2b$10$newhash' },
      });
    });
  });

  describe('remove', () => {
    it('should soft delete a user (set isActive to false)', async () => {
      const deletedUser = { ...mockUser, isActive: false };
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.user.update.mockResolvedValue(deletedUser);

      const result = await service.remove('user-123');

      expect(result).toEqual(expect.objectContaining({
        isActive: false,
      }));
      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        data: { isActive: false },
      });
    });

    it('should throw NotFoundException if user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.remove('non-existent')).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if user already inactive', async () => {
      const inactiveUser = { ...mockUser, isActive: false };
      mockPrismaService.user.findUnique.mockResolvedValue(inactiveUser);

      await expect(service.remove('user-123')).rejects.toThrow(NotFoundException);
    });
  });
});

