import { Test, TestingModule } from '@nestjs/testing';
import { AgentLeadCallScheduleService } from './agent-lead-call-schedule.service';
import { PrismaService } from '../database/prisma.service';
import { NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { SCHEDULE_TYPE } from '@prisma/client';

describe('AgentLeadCallScheduleService', () => {
  let service: AgentLeadCallScheduleService;
  let prisma: PrismaService;

  const mockSchedule = {
    id: '01HZXYZ1234567890ABCDEFGHJK',
    type: SCHEDULE_TYPE.INITIAL,
    organisationId: '01HZXYZ1234567890ABCDEFGHJL',
    agentId: '01HZXYZ1234567890ABCDEFGHJM',
    leadId: '01HZXYZ1234567890ABCDEFGHJN',
    callTime: new Date(),
    isDeleted: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    agent: {
      id: '01HZXYZ1234567890ABCDEFGHJM',
      organisationId: '01HZXYZ1234567890ABCDEFGHJL',
      name: 'Test Agent',
      slug: 'test-agent',
      isDeleted: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    lead: {
      id: '01HZXYZ1234567890ABCDEFGHJN',
      organisationId: '01HZXYZ1234567890ABCDEFGHJL',
      agentId: '01HZXYZ1234567890ABCDEFGHJM',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      phone: '+1234567890',
      reasonForCold: null,
      isTransferred: false,
      isDeleted: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
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
    agentLeadCallSchedule: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
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
        AgentLeadCallScheduleService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<AgentLeadCallScheduleService>(AgentLeadCallScheduleService);
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createScheduleDto = {
      type: SCHEDULE_TYPE.INITIAL,
      agentId: '01HZXYZ1234567890ABCDEFGHJM',
      leadId: '01HZXYZ1234567890ABCDEFGHJN',
      callTime: new Date().toISOString(),
    };

    it('should create a schedule successfully', async () => {
      mockPrismaService.organisation.findUnique.mockResolvedValue({ id: '01HZXYZ1234567890ABCDEFGHJL', isDeleted: false });
      mockPrismaService.userOrganisation.findFirst.mockResolvedValue({ userId: 'user-1' });
      mockPrismaService.agent.findUnique.mockResolvedValue({
        id: '01HZXYZ1234567890ABCDEFGHJM',
        organisationId: '01HZXYZ1234567890ABCDEFGHJL',
        isDeleted: false
      });
      mockPrismaService.lead.findUnique.mockResolvedValue({ id: '01HZXYZ1234567890ABCDEFGHJN', organisationId: '01HZXYZ1234567890ABCDEFGHJL', isDeleted: false });
      mockPrismaService.agentLeadCallSchedule.findFirst.mockResolvedValue(null);
      mockPrismaService.agentLeadCallSchedule.create.mockResolvedValue(mockSchedule);

      const result = await service.create(createScheduleDto, '01HZXYZ1234567890ABCDEFGHJL', 'user-1', false);

      expect(result).toBeDefined();
      expect(result.id).toBe('01HZXYZ1234567890ABCDEFGHJK');
      expect(prisma.agentLeadCallSchedule.create).toHaveBeenCalled();
    });

    it('should throw NotFoundException if organisation not found', async () => {
      mockPrismaService.organisation.findUnique.mockResolvedValue(null);

      await expect(service.create(createScheduleDto, '01HZXYZ1234567890ABCDEFGHJL', 'user-1', false)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException if agent not found', async () => {
      mockPrismaService.organisation.findUnique.mockResolvedValue({ id: '01HZXYZ1234567890ABCDEFGHJL', isDeleted: false });
      mockPrismaService.userOrganisation.findFirst.mockResolvedValue({ userId: 'user-1' });
      mockPrismaService.agent.findUnique.mockResolvedValue(null);

      await expect(service.create(createScheduleDto, '01HZXYZ1234567890ABCDEFGHJL', 'user-1', false)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException if lead not found', async () => {
      mockPrismaService.organisation.findUnique.mockResolvedValue({ id: '01HZXYZ1234567890ABCDEFGHJL', isDeleted: false });
      mockPrismaService.userOrganisation.findFirst.mockResolvedValue({ userId: 'user-1' });
      mockPrismaService.agent.findUnique.mockResolvedValue({
        id: '01HZXYZ1234567890ABCDEFGHJM',
        organisationId: '01HZXYZ1234567890ABCDEFGHJL',
        isDeleted: false
      });
      mockPrismaService.lead.findUnique.mockResolvedValue(null);

      await expect(service.create(createScheduleDto, '01HZXYZ1234567890ABCDEFGHJL', 'user-1', false)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findAll', () => {
    it('should return all schedules for organisation', async () => {
      mockPrismaService.organisation.findUnique.mockResolvedValue({ id: '01HZXYZ1234567890ABCDEFGHJL', isDeleted: false });
      mockPrismaService.userOrganisation.findFirst.mockResolvedValue({ userId: 'user-1' });
      mockPrismaService.agentLeadCallSchedule.findMany.mockResolvedValue([mockSchedule]);

      const result = await service.findAll('01HZXYZ1234567890ABCDEFGHJL', 'user-1', false);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('01HZXYZ1234567890ABCDEFGHJK');
    });

    it('should filter schedules by date range', async () => {
      mockPrismaService.organisation.findUnique.mockResolvedValue({ id: '01HZXYZ1234567890ABCDEFGHJL', isDeleted: false });
      mockPrismaService.userOrganisation.findFirst.mockResolvedValue({ userId: 'user-1' });
      mockPrismaService.agentLeadCallSchedule.findMany.mockResolvedValue([mockSchedule]);

      const startDateTime = '2026-01-01T00:00:00Z';
      const endDateTime = '2026-01-31T23:59:59Z';

      const result = await service.findAll('01HZXYZ1234567890ABCDEFGHJL', 'user-1', false, undefined, undefined, undefined, startDateTime, endDateTime);

      expect(result).toHaveLength(1);
      expect(prisma.agentLeadCallSchedule.findMany).toHaveBeenCalledWith({
        where: {
          isDeleted: false,
          callTime: {
            gte: new Date(startDateTime),
            lte: new Date(endDateTime),
          },
        },
        orderBy: { callTime: 'asc' },
      });
    });

    it('should apply limit when provided', async () => {
      mockPrismaService.organisation.findUnique.mockResolvedValue({ id: '01HZXYZ1234567890ABCDEFGHJL', isDeleted: false });
      mockPrismaService.userOrganisation.findFirst.mockResolvedValue({ userId: 'user-1' });
      mockPrismaService.agentLeadCallSchedule.findMany.mockResolvedValue([mockSchedule]);

      const limit = 10;

      const result = await service.findAll('01HZXYZ1234567890ABCDEFGHJL', 'user-1', false, undefined, undefined, undefined, undefined, undefined, limit);

      expect(result).toHaveLength(1);
      expect(prisma.agentLeadCallSchedule.findMany).toHaveBeenCalledWith({
        where: {
          isDeleted: false,
        },
        orderBy: { callTime: 'asc' },
        take: limit,
      });
    });

    it('should throw ForbiddenException if user has no access', async () => {
      mockPrismaService.organisation.findUnique.mockResolvedValue({ id: '01HZXYZ1234567890ABCDEFGHJL', isDeleted: false });
      mockPrismaService.userOrganisation.findFirst.mockResolvedValue(null);

      await expect(service.findAll('01HZXYZ1234567890ABCDEFGHJL', 'user-1', false)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('findOne', () => {
    it('should return a schedule by id', async () => {
      mockPrismaService.userOrganisation.findFirst.mockResolvedValue({ userId: 'user-1' });
      mockPrismaService.agentLeadCallSchedule.findUnique.mockResolvedValue(mockSchedule);

      const result = await service.findOne('01HZXYZ1234567890ABCDEFGHJK', '01HZXYZ1234567890ABCDEFGHJL', 'user-1', false);

      expect(result).toBeDefined();
      expect(result.id).toBe('01HZXYZ1234567890ABCDEFGHJK');
    });

    it('should throw NotFoundException if schedule not found', async () => {
      mockPrismaService.userOrganisation.findFirst.mockResolvedValue({ userId: 'user-1' });
      mockPrismaService.agentLeadCallSchedule.findUnique.mockResolvedValue(null);

      await expect(
        service.findOne('01HZXYZ1234567890ABCDEFGHJK', '01HZXYZ1234567890ABCDEFGHJL', 'user-1', false),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    const updateScheduleDto = {
      type: SCHEDULE_TYPE.FOLLOW_UP,
      callTime: new Date().toISOString(),
    };

    it('should update a schedule successfully', async () => {
      mockPrismaService.userOrganisation.findFirst.mockResolvedValue({ userId: 'user-1' });
      mockPrismaService.agentLeadCallSchedule.findUnique.mockResolvedValue(mockSchedule);
      mockPrismaService.agentLeadCallSchedule.update.mockResolvedValue({ ...mockSchedule, ...updateScheduleDto });

      const result = await service.update('01HZXYZ1234567890ABCDEFGHJK', '01HZXYZ1234567890ABCDEFGHJL', updateScheduleDto, 'user-1', false);

      expect(result).toBeDefined();
      expect(prisma.agentLeadCallSchedule.update).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should soft delete a schedule successfully', async () => {
      mockPrismaService.userOrganisation.findFirst.mockResolvedValue({ userId: 'user-1' });
      mockPrismaService.agentLeadCallSchedule.findUnique.mockResolvedValue(mockSchedule);
      mockPrismaService.agentLeadCallSchedule.update.mockResolvedValue({ ...mockSchedule, isDeleted: true });

      const result = await service.remove('01HZXYZ1234567890ABCDEFGHJK', '01HZXYZ1234567890ABCDEFGHJL', 'user-1', false);

      expect(result).toBeDefined();
      expect(prisma.agentLeadCallSchedule.update).toHaveBeenCalledWith({
        where: { id: '01HZXYZ1234567890ABCDEFGHJK' },
        data: { isDeleted: true },
      });
    });
  });
});

