import { Test, TestingModule } from '@nestjs/testing';
import { ChatFollowUpScheduleService } from './chat-follow-up-schedule.service';
import { PrismaService } from '../database/prisma.service';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { CreateChatFollowUpScheduleDto } from './dto/create-chat-follow-up-schedule.dto';
import { ROLE } from '@prisma/client';

describe('ChatFollowUpScheduleService', () => {
  let service: ChatFollowUpScheduleService;

  const mockPrismaService = {
    organisation: {
      findUnique: jest.fn(),
    },
    chatFollowUpSchedule: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    chat: {
      findFirst: jest.fn(),
    },
    chatFollowUpMessages: {
      findFirst: jest.fn(),
    },
    agent: {
      findUnique: jest.fn(),
    },
    userOrganisation: {
      findFirst: jest.fn(),
    },
  };

  const mockOrganisation = {
    id: '01HZXYZ1234567890ABCDEFGHJK',
    name: 'Test Org',
    isDeleted: false,
  };

  const mockSchedule = {
    id: '01HZXYZ1234567890ABCDEFGHJL',
    chatId: '01HZXYZ1234567890ABCDEFGHJM',
    followUpMessageId: '01HZXYZ1234567890ABCDEFGHJN',
    agentId: '01HZXYZ1234567890ABCDEFGHJO',
    scheduledAt: new Date(),
    isSent: false,
    sentAt: null,
    isDeleted: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockChat = {
    id: '01HZXYZ1234567890ABCDEFGHJM',
    organisationId: '01HZXYZ1234567890ABCDEFGHJK',
    isDeleted: false,
  };

  const mockMessage = {
    id: '01HZXYZ1234567890ABCDEFGHJN',
    organisationId: '01HZXYZ1234567890ABCDEFGHJK',
    isDeleted: false,
  };

  const mockAgent = {
    id: '01HZXYZ1234567890ABCDEFGHJO',
    organisationId: '01HZXYZ1234567890ABCDEFGHJK',
    isDeleted: false,
  };

  const mockUserOrg = {
    id: '01HZXYZ1234567890ABCDEFGHJP',
    userId: '01HZXYZ1234567890ABCDEFGHJQ',
    organisationId: '01HZXYZ1234567890ABCDEFGHJK',
    role: ROLE.ADMIN,
    isDeleted: false,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatFollowUpScheduleService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<ChatFollowUpScheduleService>(
      ChatFollowUpScheduleService,
    );
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const futureDate = new Date();
    futureDate.setHours(futureDate.getHours() + 1); // Set to 1 hour in the future

    const createDto: CreateChatFollowUpScheduleDto = {
      chatId: '01HZXYZ1234567890ABCDEFGHJM',
      followUpMessageId: '01HZXYZ1234567890ABCDEFGHJN',
      agentId: '01HZXYZ1234567890ABCDEFGHJO',
      scheduledAt: futureDate,
    };

    it('should create a schedule successfully', async () => {
      mockPrismaService.userOrganisation.findFirst.mockResolvedValue(
        mockUserOrg,
      );
      mockPrismaService.chat.findFirst.mockResolvedValue(mockChat);
      mockPrismaService.chatFollowUpMessages.findFirst.mockResolvedValue(
        mockMessage,
      );
      mockPrismaService.agent.findUnique.mockResolvedValue(mockAgent);
      mockPrismaService.chatFollowUpSchedule.create.mockResolvedValue(
        mockSchedule,
      );

      const result = await service.create(createDto, mockUserOrg.userId, false);

      expect(result).toBeDefined();
      expect(result.id).toBe(mockSchedule.id);
    });

    it('should throw NotFoundException if chat not found', async () => {
      mockPrismaService.chat.findFirst.mockResolvedValue(null);

      await expect(
        service.create(createDto, mockUserOrg.userId, false),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('should return all schedules for organisation', async () => {
      mockPrismaService.organisation.findUnique.mockResolvedValue(
        mockOrganisation,
      );
      mockPrismaService.userOrganisation.findFirst.mockResolvedValue(
        mockUserOrg,
      );
      mockPrismaService.chatFollowUpSchedule.findMany.mockResolvedValue([
        mockSchedule,
      ]);

      const result = await service.findAll(
        mockOrganisation.id,
        mockUserOrg.userId,
        false,
      );

      expect(result).toHaveLength(1);
      expect(
        mockPrismaService.chatFollowUpSchedule.findMany,
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            isDeleted: false,
            chat: {
              organisationId: mockOrganisation.id,
              isDeleted: false,
            },
          }),
        }) as never,
      );
    });

    it('should filter by chatId when provided', async () => {
      mockPrismaService.userOrganisation.findFirst.mockResolvedValue(
        mockUserOrg,
      );
      mockPrismaService.chatFollowUpSchedule.findMany.mockResolvedValue([
        mockSchedule,
      ]);

      const result = await service.findAll(
        mockOrganisation.id,
        mockUserOrg.userId,
        false,
        mockChat.id,
      );

      expect(result).toHaveLength(1);
      expect(
        mockPrismaService.chatFollowUpSchedule.findMany,
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            isDeleted: false,
            chatId: mockChat.id,
            chat: {
              organisationId: mockOrganisation.id,
              isDeleted: false,
            },
          }),
        }),
      );
    });

    it('should filter by scheduledFrom when provided', async () => {
      mockPrismaService.userOrganisation.findFirst.mockResolvedValue(
        mockUserOrg,
      );
      mockPrismaService.chatFollowUpSchedule.findMany.mockResolvedValue([
        mockSchedule,
      ]);

      const scheduledFrom = new Date('2024-01-20T00:00:00.000Z');

      const result = await service.findAll(
        mockOrganisation.id,
        mockUserOrg.userId,
        false,
        undefined,
        scheduledFrom,
      );

      expect(result).toHaveLength(1);
      expect(
        mockPrismaService.chatFollowUpSchedule.findMany,
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            isDeleted: false,
            scheduledAt: {
              gte: scheduledFrom,
            },
            chat: {
              organisationId: mockOrganisation.id,
              isDeleted: false,
            },
          }),
        }),
      );
    });

    it('should filter by scheduledTo when provided', async () => {
      mockPrismaService.userOrganisation.findFirst.mockResolvedValue(
        mockUserOrg,
      );
      mockPrismaService.chatFollowUpSchedule.findMany.mockResolvedValue([
        mockSchedule,
      ]);

      const scheduledTo = new Date('2024-01-31T23:59:59.999Z');

      const result = await service.findAll(
        mockOrganisation.id,
        mockUserOrg.userId,
        false,
        undefined,
        undefined,
        scheduledTo,
      );

      expect(result).toHaveLength(1);
      expect(
        mockPrismaService.chatFollowUpSchedule.findMany,
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            isDeleted: false,
            scheduledAt: {
              lte: scheduledTo,
            },
            chat: {
              organisationId: mockOrganisation.id,
              isDeleted: false,
            },
          }),
        }),
      );
    });

    it('should filter by both scheduledFrom and scheduledTo when provided', async () => {
      mockPrismaService.userOrganisation.findFirst.mockResolvedValue(
        mockUserOrg,
      );
      mockPrismaService.chatFollowUpSchedule.findMany.mockResolvedValue([
        mockSchedule,
      ]);

      const scheduledFrom = new Date('2024-01-20T00:00:00.000Z');
      const scheduledTo = new Date('2024-01-31T23:59:59.999Z');

      const result = await service.findAll(
        mockOrganisation.id,
        mockUserOrg.userId,
        false,
        undefined,
        scheduledFrom,
        scheduledTo,
      );

      expect(result).toHaveLength(1);
      expect(
        mockPrismaService.chatFollowUpSchedule.findMany,
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            isDeleted: false,
            scheduledAt: {
              gte: scheduledFrom,
              lte: scheduledTo,
            },
            chat: {
              organisationId: mockOrganisation.id,
              isDeleted: false,
            },
          }),
        }),
      );
    });

    it('should filter by chatId and time range when all provided', async () => {
      mockPrismaService.userOrganisation.findFirst.mockResolvedValue(
        mockUserOrg,
      );
      mockPrismaService.chatFollowUpSchedule.findMany.mockResolvedValue([
        mockSchedule,
      ]);

      const scheduledFrom = new Date('2024-01-20T00:00:00.000Z');
      const scheduledTo = new Date('2024-01-31T23:59:59.999Z');

      const result = await service.findAll(
        mockOrganisation.id,
        mockUserOrg.userId,
        false,
        mockChat.id,
        scheduledFrom,
        scheduledTo,
      );

      expect(result).toHaveLength(1);
      expect(
        mockPrismaService.chatFollowUpSchedule.findMany,
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            isDeleted: false,
            chatId: mockChat.id,
            scheduledAt: {
              gte: scheduledFrom,
              lte: scheduledTo,
            },
            chat: {
              organisationId: mockOrganisation.id,
              isDeleted: false,
            },
          }),
        }),
      );
    });

    it('should filter by isSent=false when provided', async () => {
      mockPrismaService.userOrganisation.findFirst.mockResolvedValue(
        mockUserOrg,
      );
      mockPrismaService.chatFollowUpSchedule.findMany.mockResolvedValue([
        mockSchedule,
      ]);

      const result = await service.findAll(
        mockOrganisation.id,
        mockUserOrg.userId,
        false,
        undefined,
        undefined,
        undefined,
        false,
      );

      expect(result).toHaveLength(1);
      expect(
        mockPrismaService.chatFollowUpSchedule.findMany,
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            isDeleted: false,
            isSent: false,
            chat: {
              organisationId: mockOrganisation.id,
              isDeleted: false,
            },
          }),
        }),
      );
    });

    it('should filter by isSent=true when provided', async () => {
      mockPrismaService.userOrganisation.findFirst.mockResolvedValue(
        mockUserOrg,
      );
      mockPrismaService.chatFollowUpSchedule.findMany.mockResolvedValue([
        { ...mockSchedule, isSent: true },
      ]);

      const result = await service.findAll(
        mockOrganisation.id,
        mockUserOrg.userId,
        false,
        undefined,
        undefined,
        undefined,
        true,
      );

      expect(result).toHaveLength(1);
      expect(
        mockPrismaService.chatFollowUpSchedule.findMany,
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            isDeleted: false,
            isSent: true,
            chat: {
              organisationId: mockOrganisation.id,
              isDeleted: false,
            },
          }),
        }),
      );
    });

    it('should filter by all parameters when provided', async () => {
      mockPrismaService.userOrganisation.findFirst.mockResolvedValue(
        mockUserOrg,
      );
      mockPrismaService.chatFollowUpSchedule.findMany.mockResolvedValue([
        mockSchedule,
      ]);

      const scheduledFrom = new Date('2024-01-20T00:00:00.000Z');
      const scheduledTo = new Date('2024-01-31T23:59:59.999Z');

      const result = await service.findAll(
        mockOrganisation.id,
        mockUserOrg.userId,
        false,
        mockChat.id,
        scheduledFrom,
        scheduledTo,
        false,
      );

      expect(result).toHaveLength(1);
      expect(
        mockPrismaService.chatFollowUpSchedule.findMany,
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            isDeleted: false,
            chatId: mockChat.id,
            scheduledAt: {
              gte: scheduledFrom,
              lte: scheduledTo,
            },
            isSent: false,
            chat: {
              organisationId: mockOrganisation.id,
              isDeleted: false,
            },
          }),
        }),
      );
    });
  });

  describe('remove', () => {
    it('should soft delete a schedule successfully', async () => {
      mockPrismaService.userOrganisation.findFirst.mockResolvedValue(
        mockUserOrg,
      );
      mockPrismaService.chatFollowUpSchedule.findFirst.mockResolvedValue(
        mockSchedule,
      );
      mockPrismaService.chatFollowUpSchedule.update.mockResolvedValue({
        ...mockSchedule,
        isDeleted: true,
      });

      const result = await service.remove(
        mockSchedule.id,
        mockOrganisation.id,
        mockUserOrg.userId,
        false,
        false, // soft delete
      );

      expect(result).toBeDefined();
      expect(
        mockPrismaService.chatFollowUpSchedule.update,
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: mockSchedule.id },
          data: { isDeleted: true },
        }),
      );
    });

    it('should hard delete a schedule successfully', async () => {
      mockPrismaService.userOrganisation.findFirst.mockResolvedValue(
        mockUserOrg,
      );
      mockPrismaService.chatFollowUpSchedule.findFirst.mockResolvedValue(
        mockSchedule,
      );
      mockPrismaService.chatFollowUpSchedule.delete.mockResolvedValue(
        mockSchedule,
      );

      const result = await service.remove(
        mockSchedule.id,
        mockOrganisation.id,
        mockUserOrg.userId,
        false,
        true, // hard delete
      );

      expect(result).toBeDefined();
      expect(
        mockPrismaService.chatFollowUpSchedule.delete,
      ).toHaveBeenCalledWith({
        where: { id: mockSchedule.id },
      });
    });

    it('should throw ForbiddenException if user has no access', async () => {
      mockPrismaService.userOrganisation.findFirst.mockResolvedValue(null);

      await expect(
        service.remove(
          mockSchedule.id,
          mockOrganisation.id,
          mockUserOrg.userId,
          false,
          false,
        ),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException if schedule not found', async () => {
      mockPrismaService.userOrganisation.findFirst.mockResolvedValue(
        mockUserOrg,
      );
      mockPrismaService.chatFollowUpSchedule.findFirst.mockResolvedValue(null);

      await expect(
        service.remove(
          mockSchedule.id,
          mockOrganisation.id,
          mockUserOrg.userId,
          false,
          false,
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('should allow super admin to delete without org check', async () => {
      mockPrismaService.chatFollowUpSchedule.findFirst.mockResolvedValue(
        mockSchedule,
      );
      mockPrismaService.chatFollowUpSchedule.update.mockResolvedValue({
        ...mockSchedule,
        isDeleted: true,
      });

      const result = await service.remove(
        mockSchedule.id,
        mockOrganisation.id,
        mockUserOrg.userId,
        true, // super admin
        false,
      );

      expect(result).toBeDefined();
      expect(
        mockPrismaService.userOrganisation.findFirst,
      ).not.toHaveBeenCalled();
    });
  });
});
