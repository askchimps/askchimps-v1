import { Test, TestingModule } from '@nestjs/testing';
import { ChatFollowUpMessageService } from './chat-follow-up-message.service';
import { PrismaService } from '../database/prisma.service';
import {
    NotFoundException,
    ConflictException,
    ForbiddenException,
} from '@nestjs/common';
import { CreateChatFollowUpMessageDto } from './dto/create-chat-follow-up-message.dto';
import { UpdateChatFollowUpMessageDto } from './dto/update-chat-follow-up-message.dto';
import { ROLE } from '@prisma/client';

describe('ChatFollowUpMessageService', () => {
    let service: ChatFollowUpMessageService;
    let prisma: PrismaService;

    const mockPrismaService = {
        organisation: {
            findUnique: jest.fn(),
        },
        chatFollowUpMessages: {
            create: jest.fn(),
            findMany: jest.fn(),
            findUnique: jest.fn(),
            findFirst: jest.fn(),
            update: jest.fn(),
        },
        userOrganisation: {
            findFirst: jest.fn(),
        },
    };

    const mockOrganisation = {
        id: '01HZXYZ1234567890ABCDEFGHJK',
        name: 'Test Org',
        slug: 'test-org',
        isDeleted: false,
    };

    const mockMessage = {
        id: '01HZXYZ1234567890ABCDEFGHJL',
        slug: 'payment-reminder',
        content: 'Please complete your payment',
        organisationId: '01HZXYZ1234567890ABCDEFGHJK',
        sequence: 1,
        delayInMinutes: 60,
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    const mockUserOrg = {
        id: '01HZXYZ1234567890ABCDEFGHJM',
        userId: '01HZXYZ1234567890ABCDEFGHJN',
        organisationId: '01HZXYZ1234567890ABCDEFGHJK',
        role: ROLE.ADMIN,
        isDeleted: false,
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ChatFollowUpMessageService,
                {
                    provide: PrismaService,
                    useValue: mockPrismaService,
                },
            ],
        }).compile();

        service = module.get<ChatFollowUpMessageService>(
            ChatFollowUpMessageService,
        );
        prisma = module.get<PrismaService>(PrismaService);

        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('create', () => {
        const createDto: CreateChatFollowUpMessageDto = {
            slug: 'payment-reminder',
            content: 'Please complete your payment',
            organisationId: '01HZXYZ1234567890ABCDEFGHJK',
        };

        it('should create a message successfully', async () => {
            mockPrismaService.userOrganisation.findFirst.mockResolvedValue(
                mockUserOrg,
            );
            mockPrismaService.chatFollowUpMessages.findFirst.mockResolvedValue(
                null,
            );
            mockPrismaService.chatFollowUpMessages.create.mockResolvedValue(
                mockMessage,
            );

            const result = await service.create(
                createDto,
                mockUserOrg.userId,
                false,
            );

            expect(result).toBeDefined();
            expect(result.id).toBe(mockMessage.id);
        });

        it('should throw ForbiddenException if user has no access', async () => {
            mockPrismaService.userOrganisation.findFirst.mockResolvedValue(
                null,
            );

            await expect(
                service.create(createDto, mockUserOrg.userId, false),
            ).rejects.toThrow(ForbiddenException);
        });

        it('should throw ConflictException if message with same slug and sequence exists', async () => {
            mockPrismaService.userOrganisation.findFirst.mockResolvedValue(
                mockUserOrg,
            );
            mockPrismaService.chatFollowUpMessages.findFirst.mockResolvedValue(
                mockMessage,
            );

            await expect(
                service.create(createDto, mockUserOrg.userId, false),
            ).rejects.toThrow(ConflictException);
        });

        it('should allow super admin to create message', async () => {
            mockPrismaService.chatFollowUpMessages.findFirst.mockResolvedValue(
                null,
            );
            mockPrismaService.chatFollowUpMessages.create.mockResolvedValue(
                mockMessage,
            );

            const result = await service.create(
                createDto,
                mockUserOrg.userId,
                true,
            );

            expect(result).toBeDefined();
            expect(
                mockPrismaService.userOrganisation.findFirst,
            ).not.toHaveBeenCalled();
        });
    });

    describe('findAll', () => {
        it('should return all messages for organisation', async () => {
            mockPrismaService.userOrganisation.findFirst.mockResolvedValue(
                mockUserOrg,
            );
            mockPrismaService.chatFollowUpMessages.findMany.mockResolvedValue([
                mockMessage,
            ]);

            const result = await service.findAll(
                mockOrganisation.id,
                mockUserOrg.userId,
                false,
            );

            expect(result).toHaveLength(1);
            expect(
                mockPrismaService.chatFollowUpMessages.findMany,
            ).toHaveBeenCalledWith({
                where: {
                    organisationId: mockOrganisation.id,
                    isDeleted: false,
                },
                orderBy: [{ slug: 'asc' }, { sequence: 'asc' }],
            });
        });

        it('should filter by slug when provided', async () => {
            mockPrismaService.userOrganisation.findFirst.mockResolvedValue(
                mockUserOrg,
            );
            mockPrismaService.chatFollowUpMessages.findMany.mockResolvedValue([
                mockMessage,
            ]);

            const result = await service.findAll(
                mockOrganisation.id,
                mockUserOrg.userId,
                false,
                'payment-reminder',
            );

            expect(result).toHaveLength(1);
            expect(
                mockPrismaService.chatFollowUpMessages.findMany,
            ).toHaveBeenCalledWith({
                where: {
                    organisationId: mockOrganisation.id,
                    isDeleted: false,
                    slug: 'payment-reminder',
                },
                orderBy: [{ slug: 'asc' }, { sequence: 'asc' }],
            });
        });

        it('should filter by sequence when provided', async () => {
            mockPrismaService.userOrganisation.findFirst.mockResolvedValue(
                mockUserOrg,
            );
            mockPrismaService.chatFollowUpMessages.findMany.mockResolvedValue([
                mockMessage,
            ]);

            const result = await service.findAll(
                mockOrganisation.id,
                mockUserOrg.userId,
                false,
                undefined,
                1,
            );

            expect(result).toHaveLength(1);
            expect(
                mockPrismaService.chatFollowUpMessages.findMany,
            ).toHaveBeenCalledWith({
                where: {
                    organisationId: mockOrganisation.id,
                    isDeleted: false,
                    sequence: 1,
                },
                orderBy: [{ slug: 'asc' }, { sequence: 'asc' }],
            });
        });

        it('should filter by both slug and sequence when provided', async () => {
            mockPrismaService.userOrganisation.findFirst.mockResolvedValue(
                mockUserOrg,
            );
            mockPrismaService.chatFollowUpMessages.findMany.mockResolvedValue([
                mockMessage,
            ]);

            const result = await service.findAll(
                mockOrganisation.id,
                mockUserOrg.userId,
                false,
                'payment-reminder',
                1,
            );

            expect(result).toHaveLength(1);
            expect(
                mockPrismaService.chatFollowUpMessages.findMany,
            ).toHaveBeenCalledWith({
                where: {
                    organisationId: mockOrganisation.id,
                    isDeleted: false,
                    slug: 'payment-reminder',
                    sequence: 1,
                },
                orderBy: [{ slug: 'asc' }, { sequence: 'asc' }],
            });
        });
    });

    describe('findOne', () => {
        it('should return a message by id', async () => {
            mockPrismaService.userOrganisation.findFirst.mockResolvedValue(
                mockUserOrg,
            );
            mockPrismaService.chatFollowUpMessages.findFirst.mockResolvedValue(
                mockMessage,
            );

            const result = await service.findOne(
                mockMessage.id,
                mockOrganisation.id,
                mockUserOrg.userId,
                false,
            );

            expect(result).toBeDefined();
        });
    });

    describe('update', () => {
        const updateDto: UpdateChatFollowUpMessageDto = {
            content: 'Updated content',
        };

        it('should update a message successfully', async () => {
            mockPrismaService.userOrganisation.findFirst.mockResolvedValue(
                mockUserOrg,
            );
            mockPrismaService.chatFollowUpMessages.findFirst
                .mockResolvedValueOnce(mockMessage)
                .mockResolvedValueOnce(null);
            mockPrismaService.chatFollowUpMessages.update.mockResolvedValue({
                ...mockMessage,
                ...updateDto,
            });

            const result = await service.update(
                mockMessage.id,
                mockOrganisation.id,
                updateDto,
                mockUserOrg.userId,
                false,
            );

            expect(result).toBeDefined();
        });
    });

    describe('remove', () => {
        it('should soft delete a message successfully', async () => {
            mockPrismaService.userOrganisation.findFirst.mockResolvedValue(
                mockUserOrg,
            );
            mockPrismaService.chatFollowUpMessages.findFirst.mockResolvedValue(
                mockMessage,
            );
            mockPrismaService.chatFollowUpMessages.update.mockResolvedValue({
                ...mockMessage,
                isDeleted: true,
            });

            // Workaround: Call mock once to "activate" it
            await mockPrismaService.chatFollowUpMessages.findFirst();

            await service.remove(
                mockMessage.id,
                mockOrganisation.id,
                mockUserOrg.userId,
                false,
            );

            expect(
                mockPrismaService.chatFollowUpMessages.update,
            ).toHaveBeenCalled();
        });
    });
});
