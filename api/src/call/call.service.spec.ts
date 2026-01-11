import { Test, TestingModule } from '@nestjs/testing';
import { CallService } from './call.service';
import { PrismaService } from '../database/prisma.service';
import { NotFoundException, BadRequestException, ForbiddenException, ConflictException } from '@nestjs/common';
import { CALL_STATUS, SENTIMENT } from '@prisma/client';

describe('CallService', () => {
  let service: CallService;
  let prisma: PrismaService;

  const mockCall = {
    id: '01HZXYZ1234567890ABCDEFGHJK',
    organisationId: '01HZXYZ1234567890ABCDEFGHJL',
    agentId: '01HZXYZ1234567890ABCDEFGHJM',
    leadId: '01HZXYZ1234567890ABCDEFGHJN',
    name: 'Test Call',
    endedReason: null,
    externalId: null,
    duration: 120.5,
    status: CALL_STATUS.ACTIVE,
    sentiment: SENTIMENT.WARM,
    recordingUrl: null,
    shortSummary: 'Short summary',
    detailedSummary: 'Detailed summary',
    analysis: null,
    isDeleted: false,
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
      create: jest.fn(),
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
        CallService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<CallService>(CallService);
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createCallDto = {
      agentId: '01HZXYZ1234567890ABCDEFGHJM',
      leadId: '01HZXYZ1234567890ABCDEFGHJN',
      name: 'Test Call',
      duration: 120.5,
      status: CALL_STATUS.ACTIVE,
      sentiment: SENTIMENT.WARM,
      shortSummary: 'Short summary',
      detailedSummary: 'Detailed summary',
      analysis: { keywords: ['test'] },
    };

    it('should create a call successfully', async () => {
      const createCallDtoWithOrgId = { ...createCallDto, organisationId: '01HZXYZ1234567890ABCDEFGHJL' };
      mockPrismaService.organisation.findUnique.mockResolvedValue({ id: '01HZXYZ1234567890ABCDEFGHJL', isDeleted: false });
      mockPrismaService.userOrganisation.findFirst.mockResolvedValue({ userId: 'user-1' });
      mockPrismaService.agent.findUnique.mockResolvedValue({ id: '01HZXYZ1234567890ABCDEFGHJM', organisationId: '01HZXYZ1234567890ABCDEFGHJL', isDeleted: false });
      mockPrismaService.lead.findUnique.mockResolvedValue({ id: '01HZXYZ1234567890ABCDEFGHJN', organisationId: '01HZXYZ1234567890ABCDEFGHJL', isDeleted: false });
      mockPrismaService.call.create.mockResolvedValue(mockCall);

      const result = await service.create(createCallDtoWithOrgId, 'user-1', false);

      expect(result).toBeDefined();
      expect(result.id).toBe('01HZXYZ1234567890ABCDEFGHJK');
      expect(prisma.call.create).toHaveBeenCalled();
    });

    it('should throw NotFoundException if organisation not found', async () => {
      const createCallDtoWithOrgId = { ...createCallDto, organisationId: '01HZXYZ1234567890ABCDEFGHJL' };
      mockPrismaService.organisation.findUnique.mockResolvedValue(null);

      await expect(service.create(createCallDtoWithOrgId, 'user-1', false)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException if agent not found', async () => {
      const createCallDtoWithOrgId = { ...createCallDto, organisationId: '01HZXYZ1234567890ABCDEFGHJL' };
      mockPrismaService.organisation.findUnique.mockResolvedValue({ id: '01HZXYZ1234567890ABCDEFGHJL', isDeleted: false });
      mockPrismaService.userOrganisation.findFirst.mockResolvedValue({ userId: 'user-1' });
      mockPrismaService.agent.findUnique.mockResolvedValue(null);

      await expect(service.create(createCallDtoWithOrgId, 'user-1', false)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException if lead not found', async () => {
      const createCallDtoWithOrgId = { ...createCallDto, organisationId: '01HZXYZ1234567890ABCDEFGHJL' };
      mockPrismaService.organisation.findUnique.mockResolvedValue({ id: '01HZXYZ1234567890ABCDEFGHJL', isDeleted: false });
      mockPrismaService.userOrganisation.findFirst.mockResolvedValue({ userId: 'user-1' });
      mockPrismaService.agent.findUnique.mockResolvedValue({ id: '01HZXYZ1234567890ABCDEFGHJM', organisationId: '01HZXYZ1234567890ABCDEFGHJL', isDeleted: false });
      mockPrismaService.lead.findUnique.mockResolvedValue(null);

      await expect(service.create(createCallDtoWithOrgId, 'user-1', false)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ConflictException if externalId already exists', async () => {
      const createCallDtoWithExternalId = {
        ...createCallDto,
        organisationId: '01HZXYZ1234567890ABCDEFGHJL',
        externalId: 'ext_call_123'
      };
      mockPrismaService.organisation.findUnique.mockResolvedValue({ id: '01HZXYZ1234567890ABCDEFGHJL', isDeleted: false });
      mockPrismaService.userOrganisation.findFirst.mockResolvedValue({ userId: 'user-1' });
      mockPrismaService.agent.findUnique.mockResolvedValue({ id: '01HZXYZ1234567890ABCDEFGHJM', organisationId: '01HZXYZ1234567890ABCDEFGHJL', isDeleted: false });
      mockPrismaService.lead.findUnique.mockResolvedValue({ id: '01HZXYZ1234567890ABCDEFGHJN', organisationId: '01HZXYZ1234567890ABCDEFGHJL', isDeleted: false });
      mockPrismaService.call.findUnique.mockResolvedValue({ id: 'existing-call', externalId: 'ext_call_123' });

      await expect(service.create(createCallDtoWithExternalId, 'user-1', false)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('findAll', () => {
    it('should return all calls for organisation', async () => {
      mockPrismaService.userOrganisation.findFirst.mockResolvedValue({ userId: 'user-1' });
      mockPrismaService.call.findMany.mockResolvedValue([mockCall]);

      const result = await service.findAll('01HZXYZ1234567890ABCDEFGHJL', 'user-1', false);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('01HZXYZ1234567890ABCDEFGHJK');
    });

    it('should filter calls by status', async () => {
      mockPrismaService.userOrganisation.findFirst.mockResolvedValue({ userId: 'user-1' });
      mockPrismaService.call.findMany.mockResolvedValue([mockCall]);

      const result = await service.findAll('01HZXYZ1234567890ABCDEFGHJL', 'user-1', false, 'COMPLETED');

      expect(result).toHaveLength(1);
      expect(prisma.call.findMany).toHaveBeenCalledWith({
        where: {
          organisationId: '01HZXYZ1234567890ABCDEFGHJL',
          isDeleted: false,
          status: 'COMPLETED',
        },
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should filter calls by agentId', async () => {
      mockPrismaService.userOrganisation.findFirst.mockResolvedValue({ userId: 'user-1' });
      mockPrismaService.agent.findUnique.mockResolvedValue({ id: '01HZXYZ1234567890ABCDEFGHJM', organisationId: '01HZXYZ1234567890ABCDEFGHJL', isDeleted: false });
      mockPrismaService.call.findMany.mockResolvedValue([mockCall]);

      const result = await service.findAll('01HZXYZ1234567890ABCDEFGHJL', 'user-1', false, undefined, '01HZXYZ1234567890ABCDEFGHJM');

      expect(result).toHaveLength(1);
      expect(prisma.call.findMany).toHaveBeenCalledWith({
        where: {
          organisationId: '01HZXYZ1234567890ABCDEFGHJL',
          isDeleted: false,
          agentId: '01HZXYZ1234567890ABCDEFGHJM',
        },
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should filter calls by leadId', async () => {
      mockPrismaService.userOrganisation.findFirst.mockResolvedValue({ userId: 'user-1' });
      mockPrismaService.lead.findUnique.mockResolvedValue({ id: '01HZXYZ1234567890ABCDEFGHJN', organisationId: '01HZXYZ1234567890ABCDEFGHJL', isDeleted: false });
      mockPrismaService.call.findMany.mockResolvedValue([mockCall]);

      const result = await service.findAll('01HZXYZ1234567890ABCDEFGHJL', 'user-1', false, undefined, undefined, '01HZXYZ1234567890ABCDEFGHJN');

      expect(result).toHaveLength(1);
      expect(prisma.call.findMany).toHaveBeenCalledWith({
        where: {
          organisationId: '01HZXYZ1234567890ABCDEFGHJL',
          isDeleted: false,
          leadId: '01HZXYZ1234567890ABCDEFGHJN',
        },
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should filter calls by multiple criteria', async () => {
      mockPrismaService.userOrganisation.findFirst.mockResolvedValue({ userId: 'user-1' });
      mockPrismaService.agent.findUnique.mockResolvedValue({ id: '01HZXYZ1234567890ABCDEFGHJM', organisationId: '01HZXYZ1234567890ABCDEFGHJL', isDeleted: false });
      mockPrismaService.lead.findUnique.mockResolvedValue({ id: '01HZXYZ1234567890ABCDEFGHJN', organisationId: '01HZXYZ1234567890ABCDEFGHJL', isDeleted: false });
      mockPrismaService.call.findMany.mockResolvedValue([mockCall]);

      const result = await service.findAll('01HZXYZ1234567890ABCDEFGHJL', 'user-1', false, 'COMPLETED', '01HZXYZ1234567890ABCDEFGHJM', '01HZXYZ1234567890ABCDEFGHJN');

      expect(result).toHaveLength(1);
      expect(prisma.call.findMany).toHaveBeenCalledWith({
        where: {
          organisationId: '01HZXYZ1234567890ABCDEFGHJL',
          isDeleted: false,
          status: 'COMPLETED',
          agentId: '01HZXYZ1234567890ABCDEFGHJM',
          leadId: '01HZXYZ1234567890ABCDEFGHJN',
        },
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should throw ForbiddenException if user has no access', async () => {
      mockPrismaService.userOrganisation.findFirst.mockResolvedValue(null);

      await expect(service.findAll('01HZXYZ1234567890ABCDEFGHJL', 'user-1', false)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('findOne', () => {
    it('should return a call by id', async () => {
      mockPrismaService.userOrganisation.findFirst.mockResolvedValue({ userId: 'user-1' });
      mockPrismaService.call.findUnique.mockResolvedValue(mockCall);

      const result = await service.findOne('01HZXYZ1234567890ABCDEFGHJK', '01HZXYZ1234567890ABCDEFGHJL', 'user-1', false);

      expect(result).toBeDefined();
      expect(result.id).toBe('01HZXYZ1234567890ABCDEFGHJK');
    });

    it('should throw NotFoundException if call not found', async () => {
      mockPrismaService.userOrganisation.findFirst.mockResolvedValue({ userId: 'user-1' });
      mockPrismaService.call.findUnique.mockResolvedValue(null);

      await expect(
        service.findOne('01HZXYZ1234567890ABCDEFGHJK', '01HZXYZ1234567890ABCDEFGHJL', 'user-1', false),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    const updateCallDto = {
      name: 'Updated Call',
      status: CALL_STATUS.COMPLETED,
    };

    it('should update a call successfully', async () => {
      mockPrismaService.userOrganisation.findFirst.mockResolvedValue({ userId: 'user-1' });
      mockPrismaService.call.findUnique.mockResolvedValue(mockCall);
      mockPrismaService.call.update.mockResolvedValue({ ...mockCall, ...updateCallDto });

      const result = await service.update('01HZXYZ1234567890ABCDEFGHJK', '01HZXYZ1234567890ABCDEFGHJL', updateCallDto, 'user-1', false);

      expect(result).toBeDefined();
      expect(result.name).toBe('Updated Call');
      expect(prisma.call.update).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should soft delete a call successfully', async () => {
      mockPrismaService.userOrganisation.findFirst.mockResolvedValue({ userId: 'user-1' });
      mockPrismaService.call.findUnique.mockResolvedValue(mockCall);
      mockPrismaService.call.update.mockResolvedValue({ ...mockCall, isDeleted: true });

      const result = await service.remove('01HZXYZ1234567890ABCDEFGHJK', '01HZXYZ1234567890ABCDEFGHJL', 'user-1', false);

      expect(result).toBeDefined();
      expect(prisma.call.update).toHaveBeenCalledWith({
        where: { id: '01HZXYZ1234567890ABCDEFGHJK' },
        data: { isDeleted: true },
      });
    });
  });
});

