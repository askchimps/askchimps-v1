import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { ChatAgentService } from './chat-agent.service';
import { PrismaService } from '../database/prisma.service';
import { CreateChatAgentDto } from './dto/create-chat-agent.dto';
import { UpdateChatAgentDto } from './dto/update-chat-agent.dto';
import { QueryChatAgentDto } from './dto/query-chat-agent.dto';
import { AGENT_TYPE, AGENT_ROLE } from '@prisma/client';

describe('ChatAgentService', () => {
  let service: ChatAgentService;
  let prisma: PrismaService;

  const mockChatAgent = {
    id: '01HZXYZ1234567890ABCDEFGHJP',
    chatId: '01HZXYZ1234567890ABCDEFGHJN',
    agentId: '01HZXYZ1234567890ABCDEFGHJL',
    isActive: true,
    isDeleted: false,
    createdAt: new Date('2024-01-15T10:30:00.000Z'),
    updatedAt: new Date('2024-01-15T10:30:00.000Z'),
    agent: {
      id: '01HZXYZ1234567890ABCDEFGHJL',
      name: 'John Doe',
      type: AGENT_TYPE.HUMAN,
      role: AGENT_ROLE.INBOUND_CHAT,
      workflowId: null,
    },
    chat: {
      id: '01HZXYZ1234567890ABCDEFGHJN',
      name: 'Customer Support Chat',
      source: 'WHATSAPP',
    },
  };

  const mockChat = {
    id: '01HZXYZ1234567890ABCDEFGHJN',
    organisationId: '01HZXYZ1234567890ABCDEFGHJK',
    isDeleted: false,
    organisation: {
      id: '01HZXYZ1234567890ABCDEFGHJK',
      name: 'Test Org',
    },
  };

  const mockAgent = {
    id: '01HZXYZ1234567890ABCDEFGHJL',
    organisationId: '01HZXYZ1234567890ABCDEFGHJK',
    name: 'John Doe',
    type: AGENT_TYPE.HUMAN,
    role: AGENT_ROLE.INBOUND_CHAT,
    workflowId: null,
    slug: 'john-doe',
    isDeleted: false,
  };

  const mockUserOrg = {
    id: '01HZXYZ1234567890ABCDEFGHJQ',
    userId: '01HZXYZ1234567890ABCDEFGHJR',
    organisationId: '01HZXYZ1234567890ABCDEFGHJK',
    role: 'ADMIN',
    isDeleted: false,
  };

  const mockPrismaService = {
    chatAgent: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    chat: {
      findUnique: jest.fn(),
    },
    agent: {
      findUnique: jest.fn(),
    },
    userOrganisation: {
      findFirst: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatAgentService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<ChatAgentService>(ChatAgentService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createDto: CreateChatAgentDto = {
      chatId: '01HZXYZ1234567890ABCDEFGHJN',
      agentId: '01HZXYZ1234567890ABCDEFGHJL',
      isActive: true,
    };

    it('should create a chat-agent relationship', async () => {
      mockPrismaService.chat.findUnique.mockResolvedValue(mockChat);
      mockPrismaService.userOrganisation.findFirst.mockResolvedValue(mockUserOrg);
      mockPrismaService.agent.findUnique.mockResolvedValue(mockAgent);
      mockPrismaService.chatAgent.findFirst.mockResolvedValue(null);
      mockPrismaService.chatAgent.create.mockResolvedValue(mockChatAgent);

      const result = await service.create(createDto, 'user-id', false);

      expect(result).toBeDefined();
      expect(result.id).toBe(mockChatAgent.id);
      expect(prisma.chatAgent.create).toHaveBeenCalledWith({
        data: {
          chatId: createDto.chatId,
          agentId: createDto.agentId,
          isActive: true,
        },
        include: {
          agent: {
            select: { id: true, name: true, type: true, role: true, workflowId: true },
          },
          chat: {
            select: { id: true, name: true, source: true },
          },
        },
      });
    });

    it('should throw NotFoundException if chat not found', async () => {
      mockPrismaService.chat.findUnique.mockResolvedValue(null);

      await expect(service.create(createDto, 'user-id', false)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException if user has no access', async () => {
      mockPrismaService.chat.findUnique.mockResolvedValue(mockChat);
      mockPrismaService.userOrganisation.findFirst.mockResolvedValue(null);

      await expect(service.create(createDto, 'user-id', false)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should throw NotFoundException if agent not found', async () => {
      mockPrismaService.chat.findUnique.mockResolvedValue(mockChat);
      mockPrismaService.userOrganisation.findFirst.mockResolvedValue(mockUserOrg);
      mockPrismaService.agent.findUnique.mockResolvedValue(null);

      await expect(service.create(createDto, 'user-id', false)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ConflictException if relationship already exists', async () => {
      mockPrismaService.chat.findUnique.mockResolvedValue(mockChat);
      mockPrismaService.userOrganisation.findFirst.mockResolvedValue(mockUserOrg);
      mockPrismaService.agent.findUnique.mockResolvedValue(mockAgent);
      mockPrismaService.chatAgent.findFirst.mockResolvedValue(mockChatAgent);

      await expect(service.create(createDto, 'user-id', false)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('findAll', () => {
    it('should return all chat-agent relationships', async () => {
      mockPrismaService.chatAgent.findMany.mockResolvedValue([mockChatAgent]);

      const result = await service.findAll({});

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(mockChatAgent.id);
      expect(prisma.chatAgent.findMany).toHaveBeenCalledWith({
        where: { isDeleted: false },
        include: {
          agent: {
            select: { id: true, name: true, type: true, role: true, workflowId: true },
          },
          chat: {
            select: { id: true, name: true, source: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should filter by chatId', async () => {
      const queryDto: QueryChatAgentDto = { chatId: '01HZXYZ1234567890ABCDEFGHJN' };
      mockPrismaService.chatAgent.findMany.mockResolvedValue([mockChatAgent]);

      await service.findAll(queryDto);

      expect(prisma.chatAgent.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            chatId: '01HZXYZ1234567890ABCDEFGHJN',
          }),
        }),
      );
    });

    it('should filter by agentId', async () => {
      const queryDto: QueryChatAgentDto = { agentId: '01HZXYZ1234567890ABCDEFGHJL' };
      mockPrismaService.chatAgent.findMany.mockResolvedValue([mockChatAgent]);

      await service.findAll(queryDto);

      expect(prisma.chatAgent.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            agentId: '01HZXYZ1234567890ABCDEFGHJL',
          }),
        }),
      );
    });

    it('should filter by isActive', async () => {
      const queryDto: QueryChatAgentDto = { isActive: true };
      mockPrismaService.chatAgent.findMany.mockResolvedValue([mockChatAgent]);

      await service.findAll(queryDto);

      expect(prisma.chatAgent.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            isActive: true,
          }),
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return a chat-agent relationship by id', async () => {
      mockPrismaService.chatAgent.findUnique.mockResolvedValue(mockChatAgent);

      const result = await service.findOne('01HZXYZ1234567890ABCDEFGHJP');

      expect(result).toBeDefined();
      expect(result.id).toBe(mockChatAgent.id);
    });

    it('should throw NotFoundException if not found', async () => {
      mockPrismaService.chatAgent.findUnique.mockResolvedValue(null);

      await expect(service.findOne('invalid-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    const updateDto: UpdateChatAgentDto = { isActive: false };

    it('should update a chat-agent relationship', async () => {
      const chatAgentWithChat = {
        ...mockChatAgent,
        chat: { ...mockChat, organisation: mockChat.organisation },
      };
      mockPrismaService.chatAgent.findUnique.mockResolvedValue(chatAgentWithChat);
      mockPrismaService.userOrganisation.findFirst.mockResolvedValue(mockUserOrg);
      mockPrismaService.chatAgent.update.mockResolvedValue({
        ...mockChatAgent,
        isActive: false,
      });

      const result = await service.update('01HZXYZ1234567890ABCDEFGHJP', updateDto, 'user-id', false);

      expect(result).toBeDefined();
      expect(prisma.chatAgent.update).toHaveBeenCalledWith({
        where: { id: '01HZXYZ1234567890ABCDEFGHJP' },
        data: updateDto,
        include: {
          agent: {
            select: { id: true, name: true, type: true, role: true, workflowId: true },
          },
          chat: {
            select: { id: true, name: true, source: true },
          },
        },
      });
    });

    it('should throw NotFoundException if not found', async () => {
      mockPrismaService.chatAgent.findUnique.mockResolvedValue(null);

      await expect(service.update('invalid-id', updateDto, 'user-id', false)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should soft delete a chat-agent relationship', async () => {
      const chatAgentWithChat = {
        ...mockChatAgent,
        chat: { ...mockChat, organisation: mockChat.organisation },
      };
      mockPrismaService.chatAgent.findUnique.mockResolvedValue(chatAgentWithChat);
      mockPrismaService.userOrganisation.findFirst.mockResolvedValue(mockUserOrg);
      mockPrismaService.chatAgent.update.mockResolvedValue({
        ...mockChatAgent,
        isDeleted: true,
      });

      const result = await service.remove('01HZXYZ1234567890ABCDEFGHJP', 'user-id', false);

      expect(result).toBeDefined();
      expect(prisma.chatAgent.update).toHaveBeenCalledWith({
        where: { id: '01HZXYZ1234567890ABCDEFGHJP' },
        data: { isDeleted: true },
        include: {
          agent: {
            select: { id: true, name: true, type: true, role: true, workflowId: true },
          },
          chat: {
            select: { id: true, name: true, source: true },
          },
        },
      });
    });

    it('should throw NotFoundException if not found', async () => {
      mockPrismaService.chatAgent.findUnique.mockResolvedValue(null);

      await expect(service.remove('invalid-id', 'user-id', false)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});


