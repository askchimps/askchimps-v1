import { Test, TestingModule } from '@nestjs/testing';
import { HistoryService } from './history.service';
import { PrismaService } from '../database/prisma.service';
import { HISTORY_ACTION, HISTORY_TRIGGER } from '@prisma/client';

describe('HistoryService', () => {
  let service: HistoryService;
  let prisma: PrismaService;

  const mockHistory = {
    id: '01HZXYZ1234567890ABCDEFGHJK',
    tableName: 'organisations',
    recordId: '01HZXYZ1234567890ABCDEFGHJL',
    fieldName: 'name',
    action: HISTORY_ACTION.UPDATE,
    trigger: HISTORY_TRIGGER.USER_ACTION,
    userId: 'user-1',
    userEmail: 'user@example.com',
    userName: 'John Doe',
    organisationId: '01HZXYZ1234567890ABCDEFGHJL',
    agentId: null,
    leadId: null,
    oldValue: 'Old Name',
    newValue: 'New Name',
    reason: 'User requested name change',
    description: 'Updated organisations record - field: name',
    metadata: null,
    requestId: 'req_123',
    sessionId: null,
    ipAddress: '192.168.1.1',
    userAgent: null,
    apiEndpoint: '/v1/organisation/123',
    httpMethod: 'PATCH',
    isError: false,
    errorMessage: null,
    errorStack: null,
    createdAt: new Date(),
  };

  const mockPrismaService = {
    history: {
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    },
    userOrganisation: {
      findMany: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HistoryService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<HistoryService>(HistoryService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a history record', async () => {
      mockPrismaService.history.create.mockResolvedValue(mockHistory);

      const result = await service.create({
        tableName: 'organisations',
        recordId: '01HZXYZ1234567890ABCDEFGHJL',
        action: HISTORY_ACTION.UPDATE,
        trigger: HISTORY_TRIGGER.USER_ACTION,
        userId: 'user-1',
      });

      expect(result).toBeDefined();
      expect(result.id).toBe('01HZXYZ1234567890ABCDEFGHJK');
      expect(prisma.history.create).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return history records for super admin', async () => {
      mockPrismaService.history.count.mockResolvedValue(1);
      mockPrismaService.history.findMany.mockResolvedValue([mockHistory]);

      const result = await service.findAll({}, 'user-1', true);

      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.data[0].id).toBe('01HZXYZ1234567890ABCDEFGHJK');
    });

    it('should filter by organisation for non-admin users', async () => {
      mockPrismaService.userOrganisation.findMany.mockResolvedValue([
        { organisationId: '01HZXYZ1234567890ABCDEFGHJL' },
      ]);
      mockPrismaService.history.count.mockResolvedValue(1);
      mockPrismaService.history.findMany.mockResolvedValue([mockHistory]);

      const result = await service.findAll({}, 'user-1', false);

      expect(result.data).toHaveLength(1);
      expect(prisma.userOrganisation.findMany).toHaveBeenCalled();
    });
  });

  describe('trackCreate', () => {
    it('should track a create action with one entry per field', async () => {
      jest.clearAllMocks();
      mockPrismaService.history.create.mockResolvedValue(mockHistory);

      const result = await service.trackCreate({
        tableName: 'organisations',
        recordId: '01HZXYZ1234567890ABCDEFGHJL',
        record: { id: '01HZXYZ1234567890ABCDEFGHJL', name: 'New Org' },
        userId: 'user-1',
      });

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(2); // id and name fields
      expect(prisma.history.create).toHaveBeenCalledTimes(2);
      expect(prisma.history.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            action: HISTORY_ACTION.CREATE,
            fieldName: expect.any(String),
          }),
        }),
      );
    });
  });

  describe('trackUpdate', () => {
    it('should track an update action with one entry per changed field', async () => {
      jest.clearAllMocks();
      mockPrismaService.history.create.mockResolvedValue(mockHistory);

      const result = await service.trackUpdate({
        tableName: 'organisations',
        recordId: '01HZXYZ1234567890ABCDEFGHJL',
        oldRecord: { id: '01HZXYZ1234567890ABCDEFGHJL', name: 'Old Name' },
        newRecord: { id: '01HZXYZ1234567890ABCDEFGHJL', name: 'New Name' },
        userId: 'user-1',
      });

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(1); // Only name changed
      expect(prisma.history.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            action: HISTORY_ACTION.UPDATE,
            fieldName: 'name',
            oldValue: 'Old Name',
            newValue: 'New Name',
          }),
        }),
      );
    });
  });

  describe('bulkCreate', () => {
    it('should create multiple history records in a transaction', async () => {
      jest.clearAllMocks();

      const bulkRecords = [
        {
          tableName: 'leads',
          recordId: '01HZXYZ1234567890ABCDEFGHJL',
          fieldName: 'firstName',
          action: HISTORY_ACTION.UPDATE,
          trigger: HISTORY_TRIGGER.USER_ACTION,
          oldValue: 'Arjun',
          newValue: 'Arjun Kumar',
        },
        {
          tableName: 'leads',
          recordId: '01HZXYZ1234567890ABCDEFGHJL',
          fieldName: 'status',
          action: HISTORY_ACTION.UPDATE,
          trigger: HISTORY_TRIGGER.USER_ACTION,
          oldValue: 'New',
          newValue: 'Contacted',
        },
      ];

      mockPrismaService.$transaction.mockResolvedValue([
        {
          ...mockHistory,
          fieldName: 'firstName',
          oldValue: 'Arjun',
          newValue: 'Arjun Kumar',
        },
        {
          ...mockHistory,
          fieldName: 'status',
          oldValue: 'New',
          newValue: 'Contacted',
        },
      ]);

      const result = await service.bulkCreate({ records: bulkRecords });

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(2);
      expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    });
  });
});
