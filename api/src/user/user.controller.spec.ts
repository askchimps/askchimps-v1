import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';

describe('UserController', () => {
    let controller: UserController;
    let service: UserService;

    const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    const mockUserService = {
        findAll: jest.fn(),
        findOne: jest.fn(),
        update: jest.fn(),
        remove: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [UserController],
            providers: [
                {
                    provide: UserService,
                    useValue: mockUserService,
                },
            ],
        }).compile();

        controller = module.get<UserController>(UserController);
        service = module.get<UserService>(UserService);

        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('findAll', () => {
        it('should return an array of users', async () => {
            const users = [
                mockUser,
                { ...mockUser, id: 'user-456', email: 'test2@example.com' },
            ];
            mockUserService.findAll.mockResolvedValue(users);

            const result = await controller.findAll();

            expect(result).toEqual(users);
            expect(service.findAll).toHaveBeenCalledTimes(1);
        });

        it('should return empty array if no users found', async () => {
            mockUserService.findAll.mockResolvedValue([]);

            const result = await controller.findAll();

            expect(result).toEqual([]);
        });
    });

    describe('findOne', () => {
        it('should return a single user', async () => {
            mockUserService.findOne.mockResolvedValue(mockUser);

            const result = await controller.findOne('user-123');

            expect(result).toEqual(mockUser);
            expect(service.findOne).toHaveBeenCalledWith('user-123');
            expect(service.findOne).toHaveBeenCalledTimes(1);
        });

        it('should handle user not found error', async () => {
            mockUserService.findOne.mockRejectedValue(
                new Error('User not found'),
            );

            await expect(controller.findOne('non-existent')).rejects.toThrow(
                'User not found',
            );
        });
    });

    describe('update', () => {
        it('should update a user', async () => {
            const updateUserDto: UpdateUserDto = {
                firstName: 'Jane',
                lastName: 'Smith',
            };
            const updatedUser = { ...mockUser, ...updateUserDto };
            mockUserService.update.mockResolvedValue(updatedUser);

            const result = await controller.update('user-123', updateUserDto);

            expect(result).toEqual(updatedUser);
            expect(service.update).toHaveBeenCalledWith(
                'user-123',
                updateUserDto,
            );
            expect(service.update).toHaveBeenCalledTimes(1);
        });

        it('should handle update errors', async () => {
            const updateUserDto: UpdateUserDto = {
                email: 'existing@example.com',
            };
            mockUserService.update.mockRejectedValue(
                new Error('Email already exists'),
            );

            await expect(
                controller.update('user-123', updateUserDto),
            ).rejects.toThrow('Email already exists');
        });
    });

    describe('remove', () => {
        it('should soft delete a user', async () => {
            const deletedUser = { ...mockUser, isActive: false };
            mockUserService.remove.mockResolvedValue(deletedUser);

            const result = await controller.remove('user-123');

            expect(result).toEqual(deletedUser);
            expect(service.remove).toHaveBeenCalledWith('user-123');
            expect(service.remove).toHaveBeenCalledTimes(1);
        });

        it('should handle remove errors', async () => {
            mockUserService.remove.mockRejectedValue(
                new Error('User not found'),
            );

            await expect(controller.remove('non-existent')).rejects.toThrow(
                'User not found',
            );
        });
    });
});
