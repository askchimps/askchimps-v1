import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateHistoryDto } from './dto/create-history.dto';
import { QueryHistoryDto } from './dto/query-history.dto';
import { BulkCreateHistoryDto } from './dto/bulk-create-history.dto';
import { HistoryEntity } from './entities/history.entity';
import { HISTORY_ACTION, HISTORY_TRIGGER } from '@prisma/client';

@Injectable()
export class HistoryService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a history record
   */
  async create(createHistoryDto: CreateHistoryDto): Promise<HistoryEntity> {
    const history = await this.prisma.history.create({
      data: createHistoryDto,
    });

    return new HistoryEntity(history);
  }

  /**
   * Bulk create multiple history records in a single transaction
   */
  async bulkCreate(bulkCreateHistoryDto: BulkCreateHistoryDto): Promise<HistoryEntity[]> {
    // Use a transaction to ensure all records are created or none
    const histories = await this.prisma.$transaction(
      bulkCreateHistoryDto.records.map((record) =>
        this.prisma.history.create({
          data: record,
        }),
      ),
    );

    return histories.map((history) => new HistoryEntity(history));
  }

  /**
   * Query history records with filters
   */
  async findAll(
    queryDto: QueryHistoryDto,
    userId: string,
    isSuperAdmin: boolean,
  ): Promise<{ data: HistoryEntity[]; total: number; limit: number; offset: number }> {
    // Build where clause
    const where: any = {};

    if (queryDto.tableName) {
      where.tableName = queryDto.tableName;
    }

    if (queryDto.recordId) {
      where.recordId = queryDto.recordId;
    }

    if (queryDto.fieldName) {
      where.fieldName = queryDto.fieldName;
    }

    if (queryDto.action) {
      where.action = queryDto.action;
    }

    if (queryDto.trigger) {
      where.trigger = queryDto.trigger;
    }

    if (queryDto.userId) {
      where.userId = queryDto.userId;
    }

    if (queryDto.organisationId) {
      where.organisationId = queryDto.organisationId;
    }

    if (queryDto.agentId) {
      where.agentId = queryDto.agentId;
    }

    if (queryDto.leadId) {
      where.leadId = queryDto.leadId;
    }

    if (queryDto.callId) {
      where.callId = queryDto.callId;
    }

    if (queryDto.chatId) {
      where.chatId = queryDto.chatId;
    }

    if (queryDto.requestId) {
      where.requestId = queryDto.requestId;
    }

    // Date range filter
    if (queryDto.startDate || queryDto.endDate) {
      where.createdAt = {};
      if (queryDto.startDate) {
        where.createdAt.gte = new Date(queryDto.startDate);
      }
      if (queryDto.endDate) {
        where.createdAt.lte = new Date(queryDto.endDate);
      }
    }

    // If not super admin, filter by user's organisations
    if (!isSuperAdmin) {
      const userOrgs = await this.prisma.userOrganisation.findMany({
        where: {
          userId,
          isDeleted: false,
        },
        select: {
          organisationId: true,
        },
      });

      const orgIds = userOrgs.map((uo) => uo.organisationId);

      // User can only see history for their organisations or their own actions
      where.OR = [
        { organisationId: { in: orgIds } },
        { userId },
      ];
    }

    const limit = queryDto.limit || 50;
    const offset = queryDto.offset || 0;
    const sortOrder = queryDto.sortOrder || 'desc';

    // Get total count
    const total = await this.prisma.history.count({ where });

    // Get records
    const records = await this.prisma.history.findMany({
      where,
      orderBy: { createdAt: sortOrder },
      take: limit,
      skip: offset,
    });

    return {
      data: records.map((record) => new HistoryEntity(record)),
      total,
      limit,
      offset,
    };
  }

  /**
   * Get history for a specific record
   */
  async findByRecord(
    tableName: string,
    recordId: string,
    userId: string,
    isSuperAdmin: boolean,
  ): Promise<HistoryEntity[]> {
    const where: any = {
      tableName,
      recordId,
    };

    // If not super admin, check access
    if (!isSuperAdmin) {
      const userOrgs = await this.prisma.userOrganisation.findMany({
        where: {
          userId,
          isDeleted: false,
        },
        select: {
          organisationId: true,
        },
      });

      const orgIds = userOrgs.map((uo) => uo.organisationId);

      where.OR = [
        { organisationId: { in: orgIds } },
        { userId },
      ];
    }

    const records = await this.prisma.history.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return records.map((record) => new HistoryEntity(record));
  }

  /**
   * Helper method to track CREATE action
   * Creates one history entry per field in the record
   */
  async trackCreate(params: {
    tableName: string;
    recordId: string;
    record: any;
    userId?: string;
    userEmail?: string;
    userName?: string;
    organisationId?: string;
    agentId?: string;
    leadId?: string;
    callId?: string;
    chatId?: string;
    trigger?: HISTORY_TRIGGER;
    reason?: string;
    metadata?: any;
    requestId?: string;
    sessionId?: string;
    ipAddress?: string;
    userAgent?: string;
    apiEndpoint?: string;
    httpMethod?: string;
  }): Promise<HistoryEntity[]> {
    const entries: HistoryEntity[] = [];

    // Create one entry for each field in the record
    for (const [fieldName, value] of Object.entries(params.record)) {
      const entry = await this.create({
        tableName: params.tableName,
        recordId: params.recordId,
        fieldName,
        action: HISTORY_ACTION.CREATE,
        trigger: params.trigger || HISTORY_TRIGGER.USER_ACTION,
        userId: params.userId,
        userEmail: params.userEmail,
        userName: params.userName,
        organisationId: params.organisationId,
        agentId: params.agentId,
        leadId: params.leadId,
        callId: params.callId,
        chatId: params.chatId,
        newValue: value,
        reason: params.reason,
        description: `Created ${params.tableName} record - field: ${fieldName}`,
        metadata: params.metadata,
        requestId: params.requestId,
        sessionId: params.sessionId,
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
        apiEndpoint: params.apiEndpoint,
        httpMethod: params.httpMethod,
      });
      entries.push(entry);
    }

    return entries;
  }

  /**
   * Helper method to track UPDATE action
   * Creates one history entry per changed field
   */
  async trackUpdate(params: {
    tableName: string;
    recordId: string;
    oldRecord: any;
    newRecord: any;
    userId?: string;
    userEmail?: string;
    userName?: string;
    organisationId?: string;
    agentId?: string;
    leadId?: string;
    callId?: string;
    chatId?: string;
    trigger?: HISTORY_TRIGGER;
    reason?: string;
    metadata?: any;
    requestId?: string;
    sessionId?: string;
    ipAddress?: string;
    userAgent?: string;
    apiEndpoint?: string;
    httpMethod?: string;
  }): Promise<HistoryEntity[]> {
    const entries: HistoryEntity[] = [];

    // Create one entry for each changed field
    for (const key in params.newRecord) {
      if (params.oldRecord[key] !== params.newRecord[key]) {
        const entry = await this.create({
          tableName: params.tableName,
          recordId: params.recordId,
          fieldName: key,
          action: HISTORY_ACTION.UPDATE,
          trigger: params.trigger || HISTORY_TRIGGER.USER_ACTION,
          userId: params.userId,
          userEmail: params.userEmail,
          userName: params.userName,
          organisationId: params.organisationId,
          agentId: params.agentId,
          leadId: params.leadId,
          callId: params.callId,
          chatId: params.chatId,
          oldValue: params.oldRecord[key],
          newValue: params.newRecord[key],
          reason: params.reason,
          description: `Updated ${params.tableName} record - field: ${key}`,
          metadata: params.metadata,
          requestId: params.requestId,
          sessionId: params.sessionId,
          ipAddress: params.ipAddress,
          userAgent: params.userAgent,
          apiEndpoint: params.apiEndpoint,
          httpMethod: params.httpMethod,
        });
        entries.push(entry);
      }
    }

    return entries;
  }

  /**
   * Helper method to track DELETE action
   * Creates one history entry per field in the deleted record
   */
  async trackDelete(params: {
    tableName: string;
    recordId: string;
    record: any;
    userId?: string;
    userEmail?: string;
    userName?: string;
    organisationId?: string;
    agentId?: string;
    leadId?: string;
    trigger?: HISTORY_TRIGGER;
    reason?: string;
    metadata?: any;
    requestId?: string;
    sessionId?: string;
    ipAddress?: string;
    userAgent?: string;
    apiEndpoint?: string;
    httpMethod?: string;
  }): Promise<HistoryEntity[]> {
    const entries: HistoryEntity[] = [];

    // Create one entry for each field in the deleted record
    for (const [fieldName, value] of Object.entries(params.record)) {
      const entry = await this.create({
        tableName: params.tableName,
        recordId: params.recordId,
        fieldName,
        action: HISTORY_ACTION.DELETE,
        trigger: params.trigger || HISTORY_TRIGGER.USER_ACTION,
        userId: params.userId,
        userEmail: params.userEmail,
        userName: params.userName,
        organisationId: params.organisationId,
        agentId: params.agentId,
        leadId: params.leadId,
        oldValue: value,
        reason: params.reason,
        description: `Deleted ${params.tableName} record - field: ${fieldName}`,
        metadata: params.metadata,
        requestId: params.requestId,
        sessionId: params.sessionId,
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
        apiEndpoint: params.apiEndpoint,
        httpMethod: params.httpMethod,
      });
      entries.push(entry);
    }

    return entries;
  }
}

