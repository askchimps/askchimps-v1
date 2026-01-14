import { Test, TestingModule } from '@nestjs/testing';
import { CallMessageService } from './call-message.service';
import { PrismaService } from '../database/prisma.service';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

describe('CallMessageService', () => {
  let service: CallMessageService;
  let prisma: PrismaService;

  const mockCallMessage = {
    id: '01HZXYZ1234567890ABCDEFGHJK',
    callId: '01HZXYZ1234567890ABCDEFGHJL',
    organisationId: '01HZXYZ1234567890ABCDEFGHJM',
    role: 'assistant',
    content: 'Test message',
    type: 'TEXT',
    isDeleted: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPrismaService = {
    organisation: {
      findUnique: jest.fn(),
    },
    call: {
      findUnique: jest.fn(),
    },
    callMessage: {
      create: jest.fn(),
      createManyAndReturn: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    userOrganisation: {
      findFirst: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CallMessageService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<CallMessageService>(CallMessageService);
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createCallMessageDto = {
      organisationId: '01HZXYZ1234567890ABCDEFGHJM',
      callId: '01HZXYZ1234567890ABCDEFGHJL',
      role: 'assistant',
      content: 'Test message',
      type: 'TEXT',
    };

    it('should create a call message successfully', async () => {
      mockPrismaService.organisation.findUnique.mockResolvedValue({ id: '01HZXYZ1234567890ABCDEFGHJM', isDeleted: false });
      mockPrismaService.userOrganisation.findFirst.mockResolvedValue({ userId: 'user-1' });
      mockPrismaService.call.findUnique.mockResolvedValue({
        id: '01HZXYZ1234567890ABCDEFGHJL',
        organisationId: '01HZXYZ1234567890ABCDEFGHJM',
        isDeleted: false
      });
      mockPrismaService.callMessage.create.mockResolvedValue(mockCallMessage);

      const result = await service.create(createCallMessageDto, 'user-1', false);

      expect(result).toBeDefined();
      expect(result.id).toBe('01HZXYZ1234567890ABCDEFGHJK');
      expect(prisma.callMessage.create).toHaveBeenCalled();
    });

    it('should throw NotFoundException if organisation not found', async () => {
      mockPrismaService.organisation.findUnique.mockResolvedValue(null);

      await expect(service.create(createCallMessageDto, 'user-1', false)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException if call not found', async () => {
      mockPrismaService.organisation.findUnique.mockResolvedValue({ id: '01HZXYZ1234567890ABCDEFGHJM', isDeleted: false });
      mockPrismaService.userOrganisation.findFirst.mockResolvedValue({ userId: 'user-1' });
      mockPrismaService.call.findUnique.mockResolvedValue(null);

      await expect(service.create(createCallMessageDto, 'user-1', false)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findAll', () => {
    it('should return all call messages for call', async () => {
      mockPrismaService.call.findUnique.mockResolvedValue({
        id: '01HZXYZ1234567890ABCDEFGHJL',
        organisationId: '01HZXYZ1234567890ABCDEFGHJM',
        isDeleted: false
      });
      mockPrismaService.userOrganisation.findFirst.mockResolvedValue({ userId: 'user-1' });
      mockPrismaService.callMessage.findMany.mockResolvedValue([mockCallMessage]);

      const result = await service.findAll('01HZXYZ1234567890ABCDEFGHJL', '01HZXYZ1234567890ABCDEFGHJM', 'user-1', false);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('01HZXYZ1234567890ABCDEFGHJK');
    });

    it('should throw ForbiddenException if user has no access', async () => {
      mockPrismaService.call.findUnique.mockResolvedValue({
        id: '01HZXYZ1234567890ABCDEFGHJL',
        organisationId: '01HZXYZ1234567890ABCDEFGHJM',
        isDeleted: false
      });
      mockPrismaService.userOrganisation.findFirst.mockResolvedValue(null);

      await expect(service.findAll('01HZXYZ1234567890ABCDEFGHJL', '01HZXYZ1234567890ABCDEFGHJM', 'user-1', false)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('findOne', () => {
    it('should return a call message by id', async () => {
      mockPrismaService.userOrganisation.findFirst.mockResolvedValue({ userId: 'user-1' });
      mockPrismaService.callMessage.findUnique.mockResolvedValue({
        ...mockCallMessage,
        callId: '01HZXYZ1234567890ABCDEFGHJL',
        organisationId: '01HZXYZ1234567890ABCDEFGHJM',
      });

      const result = await service.findOne('01HZXYZ1234567890ABCDEFGHJK', '01HZXYZ1234567890ABCDEFGHJL', '01HZXYZ1234567890ABCDEFGHJM', 'user-1', false);

      expect(result).toBeDefined();
      expect(result.id).toBe('01HZXYZ1234567890ABCDEFGHJK');
    });

    it('should throw NotFoundException if call message not found', async () => {
      mockPrismaService.userOrganisation.findFirst.mockResolvedValue({ userId: 'user-1' });
      mockPrismaService.callMessage.findUnique.mockResolvedValue(null);

      await expect(
        service.findOne('01HZXYZ1234567890ABCDEFGHJK', '01HZXYZ1234567890ABCDEFGHJL', '01HZXYZ1234567890ABCDEFGHJM', 'user-1', false),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should soft delete a call message successfully', async () => {
      mockPrismaService.userOrganisation.findFirst.mockResolvedValue({ userId: 'user-1' });
      mockPrismaService.callMessage.findUnique.mockResolvedValue({
        ...mockCallMessage,
        callId: '01HZXYZ1234567890ABCDEFGHJL',
        organisationId: '01HZXYZ1234567890ABCDEFGHJM',
      });
      mockPrismaService.callMessage.update.mockResolvedValue({ ...mockCallMessage, isDeleted: true });

      const result = await service.remove('01HZXYZ1234567890ABCDEFGHJK', '01HZXYZ1234567890ABCDEFGHJL', '01HZXYZ1234567890ABCDEFGHJM', 'user-1', false);

      expect(result).toBeDefined();
      expect(prisma.callMessage.update).toHaveBeenCalledWith({
        where: { id: '01HZXYZ1234567890ABCDEFGHJK' },
        data: { isDeleted: true },
      });
    });
  });

  describe('createMany', () => {
    const createBulkCallMessageDto = {
      messages: [
        {
          role: 'user',
          content: 'First message',
        },
        {
          role: 'assistant',
          content: 'Second message',
        },
      ],
    };

    const mockCreatedMessages = [
      {
        id: '01HZXYZ1234567890ABCDEFGH1',
        callId: '01HZXYZ1234567890ABCDEFGHJL',
        organisationId: '01HZXYZ1234567890ABCDEFGHJM',
        role: 'user',
        content: 'First message',
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '01HZXYZ1234567890ABCDEFGH2',
        callId: '01HZXYZ1234567890ABCDEFGHJL',
        organisationId: '01HZXYZ1234567890ABCDEFGHJM',
        role: 'assistant',
        content: 'Second message',
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    it('should create multiple call messages successfully', async () => {
      mockPrismaService.organisation.findUnique.mockResolvedValue({ id: '01HZXYZ1234567890ABCDEFGHJM', isDeleted: false });
      mockPrismaService.userOrganisation.findFirst.mockResolvedValue({ userId: 'user-1' });
      mockPrismaService.call.findUnique.mockResolvedValue({
        id: '01HZXYZ1234567890ABCDEFGHJL',
        organisationId: '01HZXYZ1234567890ABCDEFGHJM',
        isDeleted: false
      });
      mockPrismaService.callMessage.createManyAndReturn.mockResolvedValue(mockCreatedMessages);

      const result = await service.createMany(
        '01HZXYZ1234567890ABCDEFGHJL',
        '01HZXYZ1234567890ABCDEFGHJM',
        createBulkCallMessageDto,
        'user-1',
        false
      );

      expect(result).toBeDefined();
      expect(result).toHaveLength(2);
      expect(result[0].role).toBe('user');
      expect(result[1].role).toBe('assistant');
      expect(prisma.callMessage.createManyAndReturn).toHaveBeenCalledWith({
        data: [
          {
            callId: '01HZXYZ1234567890ABCDEFGHJL',
            organisationId: '01HZXYZ1234567890ABCDEFGHJM',
            role: 'user',
            content: 'First message',
          },
          {
            callId: '01HZXYZ1234567890ABCDEFGHJL',
            organisationId: '01HZXYZ1234567890ABCDEFGHJM',
            role: 'assistant',
            content: 'Second message',
          },
        ],
      });
    });

    it('should throw NotFoundException if organisation not found', async () => {
      mockPrismaService.organisation.findUnique.mockResolvedValue(null);

      await expect(
        service.createMany(
          '01HZXYZ1234567890ABCDEFGHJL',
          '01HZXYZ1234567890ABCDEFGHJM',
          createBulkCallMessageDto,
          'user-1',
          false
        )
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if call not found', async () => {
      mockPrismaService.organisation.findUnique.mockResolvedValue({ id: '01HZXYZ1234567890ABCDEFGHJM', isDeleted: false });
      mockPrismaService.userOrganisation.findFirst.mockResolvedValue({ userId: 'user-1' });
      mockPrismaService.call.findUnique.mockResolvedValue(null);

      await expect(
        service.createMany(
          '01HZXYZ1234567890ABCDEFGHJL',
          '01HZXYZ1234567890ABCDEFGHJM',
          createBulkCallMessageDto,
          'user-1',
          false
        )
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if user does not have access', async () => {
      mockPrismaService.organisation.findUnique.mockResolvedValue({ id: '01HZXYZ1234567890ABCDEFGHJM', isDeleted: false });
      mockPrismaService.userOrganisation.findFirst.mockResolvedValue(null);

      await expect(
        service.createMany(
          '01HZXYZ1234567890ABCDEFGHJL',
          '01HZXYZ1234567890ABCDEFGHJM',
          createBulkCallMessageDto,
          'user-1',
          false
        )
      ).rejects.toThrow(ForbiddenException);
    });

    it('should allow super admin to create messages without organisation membership', async () => {
      mockPrismaService.organisation.findUnique.mockResolvedValue({ id: '01HZXYZ1234567890ABCDEFGHJM', isDeleted: false });
      mockPrismaService.call.findUnique.mockResolvedValue({
        id: '01HZXYZ1234567890ABCDEFGHJL',
        organisationId: '01HZXYZ1234567890ABCDEFGHJM',
        isDeleted: false
      });
      mockPrismaService.callMessage.createManyAndReturn.mockResolvedValue(mockCreatedMessages);

      const result = await service.createMany(
        '01HZXYZ1234567890ABCDEFGHJL',
        '01HZXYZ1234567890ABCDEFGHJM',
        createBulkCallMessageDto,
        'super-admin',
        true
      );

      expect(result).toBeDefined();
      expect(result).toHaveLength(2);
      expect(prisma.userOrganisation.findFirst).not.toHaveBeenCalled();
    });
  });
});

