import { Test, TestingModule } from '@nestjs/testing';
import { ChatMessageService } from './chat-message.service';
import { PrismaService } from '../database/prisma.service';
import { NotFoundException } from '@nestjs/common';
import { CHAT_MESSAGE_TYPE } from '@prisma/client';

describe('ChatMessageService', () => {
    let service: ChatMessageService;
    let prisma: PrismaService;

    const mockChat = {
        id: 'chat-123',
        organisationId: 'org-123',
        isDeleted: false,
    };

    const mockMessage = {
        id: 'msg-123',
        chatId: 'chat-123',
        organisationId: 'org-123',
        role: 'user',
        content: 'Hello',
        type: CHAT_MESSAGE_TYPE.TEXT,
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        attachments: [],
    };

    const mockPrismaService = {
        chat: {
            findFirst: jest.fn(),
        },
        chatMessage: {
            create: jest.fn(),
            findMany: jest.fn(),
            findFirst: jest.fn(),
            update: jest.fn(),
        },
        messageAttachment: {
            updateMany: jest.fn(),
        },
        $transaction: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ChatMessageService,
                {
                    provide: PrismaService,
                    useValue: mockPrismaService,
                },
            ],
        }).compile();

        service = module.get<ChatMessageService>(ChatMessageService);
        prisma = module.get<PrismaService>(PrismaService);

        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('create', () => {
        const createDto = {
            role: 'user',
            content: 'Hello',
            type: CHAT_MESSAGE_TYPE.TEXT,
        };

        it('should create a message successfully', async () => {
            mockPrismaService.chat.findFirst.mockResolvedValue(mockChat);
            mockPrismaService.chatMessage.create.mockResolvedValue(mockMessage);

            const result = await service.create(
                'org-123',
                'chat-123',
                createDto,
            );

            expect(result).toBeDefined();
            expect(result.id).toBe('msg-123');
            expect(prisma.chatMessage.create).toHaveBeenCalled();
        });

        it('should throw NotFoundException if chat not found', async () => {
            mockPrismaService.chat.findFirst.mockResolvedValue(null);

            await expect(
                service.create('org-123', 'chat-123', createDto),
            ).rejects.toThrow(NotFoundException);
        });

        it('should create message with attachments', async () => {
            const dtoWithAttachments = {
                ...createDto,
                attachments: [
                    {
                        url: 'https://example.com/file.pdf',
                        filename: 'file.pdf',
                        filesize: 1024,
                        filetype: 'application/pdf',
                    },
                ],
            };
            mockPrismaService.chat.findFirst.mockResolvedValue(mockChat);
            mockPrismaService.chatMessage.create.mockResolvedValue({
                ...mockMessage,
                attachments: dtoWithAttachments.attachments,
            });

            const result = await service.create(
                'org-123',
                'chat-123',
                dtoWithAttachments,
            );

            expect(result).toBeDefined();
            expect(prisma.chatMessage.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({
                        attachments: expect.objectContaining({
                            create: dtoWithAttachments.attachments,
                        }),
                    }),
                }),
            );
        });
    });

    describe('findAll', () => {
        it('should return all messages for a chat', async () => {
            mockPrismaService.chat.findFirst.mockResolvedValue(mockChat);
            mockPrismaService.chatMessage.findMany.mockResolvedValue([
                mockMessage,
            ]);

            const result = await service.findAll('org-123', 'chat-123');

            expect(result).toHaveLength(1);
            expect(result[0].id).toBe('msg-123');
            expect(prisma.chatMessage.findMany).toHaveBeenCalledWith({
                where: {
                    chatId: 'chat-123',
                    organisationId: 'org-123',
                    isDeleted: false,
                },
                include: { attachments: { where: { isDeleted: false } } },
                orderBy: { createdAt: 'asc' },
            });
        });

        it('should throw NotFoundException if chat not found', async () => {
            mockPrismaService.chat.findFirst.mockResolvedValue(null);

            await expect(
                service.findAll('org-123', 'chat-123'),
            ).rejects.toThrow(NotFoundException);
        });
    });

    describe('update', () => {
        const updateDto = {
            content: 'Updated content',
        };

        it('should update a message successfully', async () => {
            mockPrismaService.chat.findFirst.mockResolvedValue(mockChat);
            mockPrismaService.chatMessage.findFirst.mockResolvedValue(
                mockMessage,
            );
            mockPrismaService.chatMessage.update.mockResolvedValue({
                ...mockMessage,
                ...updateDto,
            });

            const result = await service.update(
                'org-123',
                'chat-123',
                'msg-123',
                updateDto,
            );

            expect(result).toBeDefined();
            expect(result.content).toBe('Updated content');
            expect(prisma.chatMessage.update).toHaveBeenCalled();
        });

        it('should throw NotFoundException if message not found', async () => {
            mockPrismaService.chatMessage.findFirst.mockResolvedValue(null);

            await expect(
                service.update('org-123', 'chat-123', 'msg-123', updateDto),
            ).rejects.toThrow(NotFoundException);
        });
    });

    describe('remove', () => {
        it('should soft delete a message and its attachments', async () => {
            mockPrismaService.chat.findFirst.mockResolvedValue(mockChat);
            mockPrismaService.chatMessage.findFirst.mockResolvedValue(
                mockMessage,
            );
            mockPrismaService.$transaction.mockResolvedValue([{}, {}]);

            await service.remove('org-123', 'chat-123', 'msg-123');

            expect(prisma.$transaction).toHaveBeenCalled();
        });

        it('should throw NotFoundException if message not found', async () => {
            mockPrismaService.chatMessage.findFirst.mockResolvedValue(null);

            await expect(
                service.remove('org-123', 'chat-123', 'msg-123'),
            ).rejects.toThrow(NotFoundException);
        });
    });
});
