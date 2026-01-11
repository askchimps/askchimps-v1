import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionService } from './execution.service';
import { PrismaService } from '../database/prisma.service';
import { NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
import { EXECUTION_TYPE } from '@prisma/client';

describe('ExecutionService', () => {
  let service: ExecutionService;
  let prisma: PrismaService;

  const mockExecution = {
    id: '01HZXYZ1234567890ABCDEFGHJK',
    externalId: 'ext_exec_123456',
    type: EXECUTION_TYPE.CALL_END,
    organisationId: '01HZXYZ1234567890ABCDEFGHJM',
    agentId: '01HZXYZ1234567890ABCDEFGHJN',
    leadId: '01HZXYZ1234567890ABCDEFGHJO',
    callId: '01HZXYZ1234567890ABCDEFGHJP',
    chatId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPrismaService = {
    organisation: {
      findUnique: jest.fn(),
    },
    agent: {
      findUnique: jest.fn(),
    },
    lead: {
      findUnique: jest.fn(),
    },
    call: {
      findUnique: jest.fn(),
    },
    chat: {
      findUnique: jest.fn(),
    },
    execution: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    userOrganisation: {
      findFirst: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExecutionService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<ExecutionService>(ExecutionService);
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createExecutionDto = {
      externalId: 'ext_exec_123456',
      type: EXECUTION_TYPE.CALL_END,
      organisationId: '01HZXYZ1234567890ABCDEFGHJM',
      agentId: '01HZXYZ1234567890ABCDEFGHJN',
      leadId: '01HZXYZ1234567890ABCDEFGHJO',
      callId: '01HZXYZ1234567890ABCDEFGHJP',
    };

    it('should create an execution successfully', async () => {
      mockPrismaService.organisation.findUnique.mockResolvedValue({ id: '01HZXYZ1234567890ABCDEFGHJM', isDeleted: false });
      mockPrismaService.userOrganisation.findFirst.mockResolvedValue({ userId: 'user-1' });
      mockPrismaService.agent.findUnique.mockResolvedValue({
        id: '01HZXYZ1234567890ABCDEFGHJN',
        organisationId: '01HZXYZ1234567890ABCDEFGHJM',
        isDeleted: false
      });
      mockPrismaService.lead.findUnique.mockResolvedValue({
        id: '01HZXYZ1234567890ABCDEFGHJO',
        organisationId: '01HZXYZ1234567890ABCDEFGHJM',
        isDeleted: false
      });
      mockPrismaService.call.findUnique.mockResolvedValue({
        id: '01HZXYZ1234567890ABCDEFGHJP',
        organisationId: '01HZXYZ1234567890ABCDEFGHJM',
        isDeleted: false
      });
      mockPrismaService.execution.findFirst.mockResolvedValue(null);
      mockPrismaService.execution.create.mockResolvedValue(mockExecution);

      const result = await service.create(createExecutionDto, 'user-1', false);

      expect(result).toBeDefined();
      expect(result.id).toBe('01HZXYZ1234567890ABCDEFGHJK');
      expect(prisma.execution.create).toHaveBeenCalled();
    });

    it('should throw NotFoundException if organisation not found', async () => {
      mockPrismaService.organisation.findUnique.mockResolvedValue(null);

      await expect(service.create(createExecutionDto, 'user-1', false)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ConflictException if external ID already exists', async () => {
      mockPrismaService.organisation.findUnique.mockResolvedValue({ id: '01HZXYZ1234567890ABCDEFGHJM', isDeleted: false });
      mockPrismaService.userOrganisation.findFirst.mockResolvedValue({ userId: 'user-1' });
      mockPrismaService.agent.findUnique.mockResolvedValue({
        id: '01HZXYZ1234567890ABCDEFGHJN',
        organisationId: '01HZXYZ1234567890ABCDEFGHJM',
        isDeleted: false
      });
      mockPrismaService.lead.findUnique.mockResolvedValue({
        id: '01HZXYZ1234567890ABCDEFGHJO',
        organisationId: '01HZXYZ1234567890ABCDEFGHJM',
        isDeleted: false
      });
      mockPrismaService.call.findUnique.mockResolvedValue({
        id: '01HZXYZ1234567890ABCDEFGHJP',
        organisationId: '01HZXYZ1234567890ABCDEFGHJM',
        isDeleted: false
      });
      mockPrismaService.execution.findFirst.mockResolvedValue(mockExecution);

      await expect(service.create(createExecutionDto, 'user-1', false)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should throw ForbiddenException if user does not have access', async () => {
      mockPrismaService.organisation.findUnique.mockResolvedValue({ id: '01HZXYZ1234567890ABCDEFGHJM', isDeleted: false });
      mockPrismaService.userOrganisation.findFirst.mockResolvedValue(null);

      await expect(service.create(createExecutionDto, 'user-1', false)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('findAll', () => {
    it('should return all executions for an organisation', async () => {
      mockPrismaService.organisation.findUnique.mockResolvedValue({ id: '01HZXYZ1234567890ABCDEFGHJM', isDeleted: false });
      mockPrismaService.userOrganisation.findFirst.mockResolvedValue({ userId: 'user-1' });
      mockPrismaService.execution.findMany.mockResolvedValue([mockExecution]);

      const result = await service.findAll('01HZXYZ1234567890ABCDEFGHJM', 'user-1', false);

      expect(result).toBeDefined();
      expect(result).toHaveLength(1);
      expect(prisma.execution.findMany).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a single execution', async () => {
      mockPrismaService.execution.findUnique.mockResolvedValue(mockExecution);
      mockPrismaService.userOrganisation.findFirst.mockResolvedValue({ userId: 'user-1' });

      const result = await service.findOne('01HZXYZ1234567890ABCDEFGHJK', '01HZXYZ1234567890ABCDEFGHJM', 'user-1', false);

      expect(result).toBeDefined();
      expect(result.id).toBe('01HZXYZ1234567890ABCDEFGHJK');
    });

    it('should throw NotFoundException if execution not found', async () => {
      mockPrismaService.execution.findUnique.mockResolvedValue(null);

      await expect(
        service.findOne('01HZXYZ1234567890ABCDEFGHJK', '01HZXYZ1234567890ABCDEFGHJM', 'user-1', false)
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update an execution', async () => {
      mockPrismaService.execution.findUnique.mockResolvedValue(mockExecution);
      mockPrismaService.userOrganisation.findFirst.mockResolvedValue({ userId: 'user-1' });
      mockPrismaService.execution.update.mockResolvedValue({ ...mockExecution, type: EXECUTION_TYPE.CALL_ANALYSIS });

      const result = await service.update(
        '01HZXYZ1234567890ABCDEFGHJK',
        '01HZXYZ1234567890ABCDEFGHJM',
        { type: EXECUTION_TYPE.CALL_ANALYSIS },
        'user-1',
        false
      );

      expect(result).toBeDefined();
      expect(prisma.execution.update).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should delete an execution', async () => {
      mockPrismaService.execution.findUnique.mockResolvedValue(mockExecution);
      mockPrismaService.userOrganisation.findFirst.mockResolvedValue({ userId: 'user-1' });
      mockPrismaService.execution.delete.mockResolvedValue(mockExecution);

      const result = await service.remove('01HZXYZ1234567890ABCDEFGHJK', '01HZXYZ1234567890ABCDEFGHJM', 'user-1', false);

      expect(result).toBeDefined();
      expect(prisma.execution.delete).toHaveBeenCalledWith({
        where: { id: '01HZXYZ1234567890ABCDEFGHJK' },
      });
    });
  });
});
