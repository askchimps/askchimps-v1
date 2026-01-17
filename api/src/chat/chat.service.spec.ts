import { Test, TestingModule } from '@nestjs/testing';
import { ChatService } from './chat.service';
import { PrismaService } from '../database/prisma.service';
import {
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { CHAT_SOURCE, CHAT_STATUS } from '@prisma/client';

describe('ChatService', () => {
  let service: ChatService;
  let prisma: PrismaService;

  const mockOrganisation = {
    id: '01HZXYZ1234567890ABCDEFGHJK',
    name: 'Test Org',
    slug: 'test-org',
    isDeleted: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockAgent = {
    id: '01HZXYZ1234567890ABCDEFGHJL',
    organisationId: '01HZXYZ1234567890ABCDEFGHJK',
    name: 'Test Agent',
    slug: 'test-agent',
    isDeleted: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockLead = {
    id: '01HZXYZ1234567890ABCDEFGHJM',
    organisationId: '01HZXYZ1234567890ABCDEFGHJK',
    agentId: '01HZXYZ1234567890ABCDEFGHJL',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    phone: '+1234567890',
    reasonForCold: null,
    isTransferred: false,
    isDeleted: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockChat = {
    id: '01HZXYZ1234567890ABCDEFGHJN',
    organisationId: '01HZXYZ1234567890ABCDEFGHJK',
    agentId: '01HZXYZ1234567890ABCDEFGHJL',
    leadId: '01HZXYZ1234567890ABCDEFGHJM',
    name: 'Test Chat',
    source: CHAT_SOURCE.WHATSAPP,
    sourceId: 'whatsapp-123',
    status: CHAT_STATUS.NEW,
    shortSummary: 'Short summary',
    detailedSummary: 'Detailed summary',
    isTransferred: false,
    isDeleted: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    lead: mockLead,
  };

  const mockPrismaService = {
    organisation: {
      findUnique: jest.fn(),
    },
    agent: {
      findUnique: jest.fn(),
    },
    lead: {
      findFirst: jest.fn(),
    },
    chat: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    instagramMessageCache: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<ChatService>(ChatService);
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createChatDto = {
      agentId: '01HZXYZ1234567890ABCDEFGHJL',
      leadId: '01HZXYZ1234567890ABCDEFGHJM',
      name: 'Test Chat',
      source: CHAT_SOURCE.WHATSAPP,
      sourceId: 'whatsapp-123',
      status: CHAT_STATUS.NEW,
      shortSummary: 'Short summary',
      detailedSummary: 'Detailed summary',
      isTransferred: false,
    };

    it('should create a chat successfully', async () => {
      mockPrismaService.organisation.findUnique.mockResolvedValue(
        mockOrganisation,
      );
      mockPrismaService.agent.findUnique.mockResolvedValue(mockAgent);
      mockPrismaService.lead.findFirst.mockResolvedValue(mockLead);
      mockPrismaService.chat.findFirst.mockResolvedValue(null);
      mockPrismaService.chat.create.mockResolvedValue(mockChat);

      const result = await service.create(
        '01HZXYZ1234567890ABCDEFGHJK',
        createChatDto,
      );

      expect(result).toBeDefined();
      expect(result.id).toBe('01HZXYZ1234567890ABCDEFGHJN');
      expect(prisma.organisation.findUnique).toHaveBeenCalledWith({
        where: { id: '01HZXYZ1234567890ABCDEFGHJK', isDeleted: false },
      });
      expect(prisma.agent.findUnique).toHaveBeenCalledWith({
        where: { id: '01HZXYZ1234567890ABCDEFGHJL' },
      });
      expect(prisma.chat.create).toHaveBeenCalled();
    });

    it('should throw NotFoundException if organisation not found', async () => {
      mockPrismaService.organisation.findUnique.mockResolvedValue(null);

      await expect(
        service.create('01HZXYZ1234567890ABCDEFGHJK', createChatDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if agent not found', async () => {
      mockPrismaService.organisation.findUnique.mockResolvedValue(
        mockOrganisation,
      );
      mockPrismaService.agent.findUnique.mockResolvedValue(null);

      await expect(
        service.create('01HZXYZ1234567890ABCDEFGHJK', createChatDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if lead not found', async () => {
      mockPrismaService.organisation.findUnique.mockResolvedValue(
        mockOrganisation,
      );
      mockPrismaService.agent.findUnique.mockResolvedValue(mockAgent);
      mockPrismaService.lead.findFirst.mockResolvedValue(null);

      await expect(
        service.create('01HZXYZ1234567890ABCDEFGHJK', createChatDto),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if duplicate sourceId exists', async () => {
      mockPrismaService.organisation.findUnique.mockResolvedValue(
        mockOrganisation,
      );
      mockPrismaService.agent.findUnique.mockResolvedValue(mockAgent);
      mockPrismaService.lead.findFirst.mockResolvedValue(mockLead);
      mockPrismaService.chat.findFirst.mockResolvedValue(mockChat);

      await expect(
        service.create('01HZXYZ1234567890ABCDEFGHJK', createChatDto),
      ).rejects.toThrow(BadRequestException);
    });

    it('should create chat without leadId', async () => {
      const dtoWithoutLead = { ...createChatDto, leadId: undefined };
      mockPrismaService.organisation.findUnique.mockResolvedValue(
        mockOrganisation,
      );
      mockPrismaService.agent.findUnique.mockResolvedValue(mockAgent);
      mockPrismaService.chat.findFirst.mockResolvedValue(null);
      mockPrismaService.chat.create.mockResolvedValue({
        ...mockChat,
        leadId: null,
      });

      const result = await service.create(
        '01HZXYZ1234567890ABCDEFGHJK',
        dtoWithoutLead,
      );

      expect(result).toBeDefined();
      expect(prisma.lead.findFirst).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return all chats for organisation', async () => {
      mockPrismaService.chat.findMany.mockResolvedValue([mockChat]);

      const result = await service.findAll('01HZXYZ1234567890ABCDEFGHJK');

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('01HZXYZ1234567890ABCDEFGHJN');
      expect(prisma.chat.findMany).toHaveBeenCalledWith({
        where: {
          organisationId: '01HZXYZ1234567890ABCDEFGHJK',
          isDeleted: false,
        },
        include: { lead: true },
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should return empty array if no chats found', async () => {
      mockPrismaService.chat.findMany.mockResolvedValue([]);

      const result = await service.findAll('01HZXYZ1234567890ABCDEFGHJK');

      expect(result).toHaveLength(0);
    });
  });

  describe('findOne', () => {
    it('should return a chat by id', async () => {
      const chatWithMessages = {
        ...mockChat,
        messages: [],
      };
      mockPrismaService.chat.findFirst.mockResolvedValue(chatWithMessages);

      const result = await service.findOne(
        '01HZXYZ1234567890ABCDEFGHJK',
        '01HZXYZ1234567890ABCDEFGHJN',
      );

      expect(result).toBeDefined();
      expect(result.id).toBe('01HZXYZ1234567890ABCDEFGHJN');
      expect(prisma.chat.findFirst).toHaveBeenCalledWith({
        where: {
          OR: [
            { id: '01HZXYZ1234567890ABCDEFGHJN' },
            { sourceId: '01HZXYZ1234567890ABCDEFGHJN' },
          ],
          organisationId: '01HZXYZ1234567890ABCDEFGHJK',
          isDeleted: false,
        },
        include: {
          lead: true,
          messages: {
            where: { isDeleted: false },
            orderBy: { createdAt: 'asc' },
            include: { attachments: { where: { isDeleted: false } } },
          },
        },
      });
    });

    it('should throw NotFoundException if chat not found', async () => {
      mockPrismaService.chat.findFirst.mockResolvedValue(null);

      await expect(
        service.findOne(
          '01HZXYZ1234567890ABCDEFGHJK',
          '01HZXYZ1234567890ABCDEFGHJN',
        ),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    const updateChatDto = {
      name: 'Updated Chat',
      status: CHAT_STATUS.OPEN,
    };

    it('should update a chat successfully', async () => {
      mockPrismaService.chat.findFirst.mockResolvedValue(mockChat);
      mockPrismaService.chat.update.mockResolvedValue({
        ...mockChat,
        ...updateChatDto,
      });

      const result = await service.update(
        '01HZXYZ1234567890ABCDEFGHJK',
        '01HZXYZ1234567890ABCDEFGHJN',
        updateChatDto,
      );

      expect(result).toBeDefined();
      expect(result.name).toBe('Updated Chat');
      expect(prisma.chat.update).toHaveBeenCalled();
    });

    it('should throw NotFoundException if chat not found', async () => {
      mockPrismaService.chat.findFirst.mockResolvedValue(null);

      await expect(
        service.update(
          '01HZXYZ1234567890ABCDEFGHJK',
          '01HZXYZ1234567890ABCDEFGHJN',
          updateChatDto,
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('should validate leadId if provided in update', async () => {
      const updateWithLead = {
        ...updateChatDto,
        leadId: '01HZXYZ1234567890ABCDEFGHJP',
      };
      mockPrismaService.chat.findFirst.mockResolvedValue(mockChat);
      mockPrismaService.lead.findFirst.mockResolvedValue(null);

      await expect(
        service.update(
          '01HZXYZ1234567890ABCDEFGHJK',
          '01HZXYZ1234567890ABCDEFGHJN',
          updateWithLead,
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('remove', () => {
    it('should soft delete a chat', async () => {
      mockPrismaService.chat.findFirst.mockResolvedValue(mockChat);
      mockPrismaService.chat.update.mockResolvedValue({
        ...mockChat,
        isDeleted: true,
      });

      await service.remove(
        '01HZXYZ1234567890ABCDEFGHJK',
        '01HZXYZ1234567890ABCDEFGHJN',
      );

      expect(prisma.chat.update).toHaveBeenCalledWith({
        where: { id: '01HZXYZ1234567890ABCDEFGHJN' },
        data: { isDeleted: true },
      });
    });

    it('should throw NotFoundException if chat not found', async () => {
      mockPrismaService.chat.findFirst.mockResolvedValue(null);

      await expect(
        service.remove(
          '01HZXYZ1234567890ABCDEFGHJK',
          '01HZXYZ1234567890ABCDEFGHJN',
        ),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByLead', () => {
    it('should return chats for a specific lead', async () => {
      mockPrismaService.chat.findMany.mockResolvedValue([mockChat]);

      const result = await service.findByLead(
        '01HZXYZ1234567890ABCDEFGHJK',
        '01HZXYZ1234567890ABCDEFGHJM',
      );

      expect(result).toHaveLength(1);
      expect(result[0].leadId).toBe('01HZXYZ1234567890ABCDEFGHJM');
      expect(prisma.chat.findMany).toHaveBeenCalledWith({
        where: {
          organisationId: '01HZXYZ1234567890ABCDEFGHJK',
          leadId: '01HZXYZ1234567890ABCDEFGHJM',
          isDeleted: false,
        },
        include: { lead: true },
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('findBySource', () => {
    it('should return chat by source and sourceId', async () => {
      mockPrismaService.chat.findFirst.mockResolvedValue(mockChat);

      const result = await service.findBySource(
        '01HZXYZ1234567890ABCDEFGHJK',
        'WHATSAPP',
        'whatsapp-123',
      );

      expect(result).toBeDefined();
      expect(result?.sourceId).toBe('whatsapp-123');
    });

    it('should return null if chat not found', async () => {
      mockPrismaService.chat.findFirst.mockResolvedValue(null);

      const result = await service.findBySource(
        '01HZXYZ1234567890ABCDEFGHJK',
        'WHATSAPP',
        'whatsapp-123',
      );

      expect(result).toBeNull();
    });
  });

  describe('updateStatus', () => {
    it('should update chat status', async () => {
      mockPrismaService.chat.findFirst.mockResolvedValue(mockChat);
      mockPrismaService.chat.update.mockResolvedValue({
        ...mockChat,
        status: CHAT_STATUS.CLOSED,
      });

      const result = await service.updateStatus(
        '01HZXYZ1234567890ABCDEFGHJK',
        '01HZXYZ1234567890ABCDEFGHJN',
        CHAT_STATUS.CLOSED,
      );

      expect(result.status).toBe(CHAT_STATUS.CLOSED);
      expect(prisma.chat.update).toHaveBeenCalledWith({
        where: { id: '01HZXYZ1234567890ABCDEFGHJN' },
        data: { status: CHAT_STATUS.CLOSED },
        include: { lead: true },
      });
    });

    it('should throw NotFoundException if chat not found', async () => {
      mockPrismaService.chat.findFirst.mockResolvedValue(null);

      await expect(
        service.updateStatus(
          '01HZXYZ1234567890ABCDEFGHJK',
          '01HZXYZ1234567890ABCDEFGHJN',
          CHAT_STATUS.CLOSED,
        ),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('checkInstagramMessage', () => {
    const checkDto = { messageId: '1234567890_1234567890' };

    it('should cache new Instagram message successfully', async () => {
      mockPrismaService.instagramMessageCache.findUnique.mockResolvedValue(
        null,
      );
      mockPrismaService.instagramMessageCache.create.mockResolvedValue({
        id: '01HZXYZ1234567890ABCDEFGHJQ',
        messageId: checkDto.messageId,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await service.checkInstagramMessage(checkDto);

      expect(result).toBeDefined();
      expect(result.exists).toBe(false);
      expect(result.message).toBe('Instagram message cached successfully');
      expect(prisma.instagramMessageCache.findUnique).toHaveBeenCalledWith({
        where: { messageId: checkDto.messageId },
      });
      expect(prisma.instagramMessageCache.create).toHaveBeenCalledWith({
        data: { messageId: checkDto.messageId },
      });
    });

    it('should throw ConflictException if message already exists', async () => {
      const existingMessage = {
        id: '01HZXYZ1234567890ABCDEFGHJQ',
        messageId: checkDto.messageId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockPrismaService.instagramMessageCache.findUnique.mockResolvedValue(
        existingMessage,
      );

      await expect(service.checkInstagramMessage(checkDto)).rejects.toThrow(
        ConflictException,
      );
      expect(prisma.instagramMessageCache.findUnique).toHaveBeenCalledWith({
        where: { messageId: checkDto.messageId },
      });
      expect(prisma.instagramMessageCache.create).not.toHaveBeenCalled();
    });
  });
});
