import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateAgentLeadCallScheduleDto } from './dto/create-agent-lead-call-schedule.dto';
import { UpdateAgentLeadCallScheduleDto } from './dto/update-agent-lead-call-schedule.dto';
import { QueryAgentLeadCallScheduleDto } from './dto/query-agent-lead-call-schedule.dto';
import { AgentLeadCallScheduleEntity } from './entities/agent-lead-call-schedule.entity';
import type { PaginatedResponse } from '../common/dto/pagination-query.dto';

@Injectable()
export class AgentLeadCallScheduleService {
  constructor(private readonly prisma: PrismaService) { }

  async create(
    createDto: CreateAgentLeadCallScheduleDto,
    organisationId: string,
    userId: string,
    isSuperAdmin: boolean,
  ): Promise<AgentLeadCallScheduleEntity> {
    // Verify organisation exists
    const organisation = await this.prisma.organisation.findUnique({
      where: { id: organisationId },
    });

    if (!organisation || organisation.isDeleted) {
      throw new NotFoundException('Organisation not found');
    }

    // Check user has access to organisation
    if (!isSuperAdmin) {
      const userOrg = await this.prisma.userOrganisation.findFirst({
        where: {
          userId,
          organisationId,
          isDeleted: false,
        },
      });

      if (!userOrg) {
        throw new ForbiddenException('You do not have access to this organisation');
      }
    }

    // Verify agent exists and belongs to organisation
    const agent = await this.prisma.agent.findUnique({
      where: { id: createDto.agentId },
    });

    if (!agent || agent.isDeleted || agent.organisationId !== organisationId) {
      throw new NotFoundException('Agent not found');
    }

    // Verify lead exists and belongs to organisation
    const lead = await this.prisma.lead.findUnique({
      where: { id: createDto.leadId },
    });

    if (!lead || lead.isDeleted || lead.organisationId !== organisationId) {
      throw new NotFoundException('Lead not found');
    }

    // Check for duplicate schedule
    const existing = await this.prisma.agentLeadCallSchedule.findFirst({
      where: {
        agentId: createDto.agentId,
        leadId: createDto.leadId,
        callTime: new Date(createDto.callTime),
        isDeleted: false,
      },
    });

    if (existing) {
      throw new ConflictException('A schedule already exists for this agent, lead, and time');
    }

    const schedule = await this.prisma.agentLeadCallSchedule.create({
      data: {
        type: createDto.type,
        agentId: createDto.agentId,
        leadId: createDto.leadId,
        callTime: new Date(createDto.callTime),
      },
    });

    return new AgentLeadCallScheduleEntity(schedule);
  }

  async findAll(
    organisationId: string,
    userId: string,
    isSuperAdmin: boolean,
    queryDto: QueryAgentLeadCallScheduleDto,
  ): Promise<PaginatedResponse<AgentLeadCallScheduleEntity>> {
    // Verify organisation exists
    const organisation = await this.prisma.organisation.findUnique({
      where: { id: organisationId },
    });

    if (!organisation || organisation.isDeleted) {
      throw new NotFoundException('Organisation not found');
    }

    // Check user has access to organisation
    if (!isSuperAdmin) {
      const userOrg = await this.prisma.userOrganisation.findFirst({
        where: {
          userId,
          organisationId,
          isDeleted: false,
        },
      });

      if (!userOrg) {
        throw new ForbiddenException('You do not have access to this organisation');
      }
    }

    const where: any = {
      isDeleted: false,
    };

    if (queryDto.type) {
      where.type = queryDto.type;
    }

    if (queryDto.agentId) {
      // Verify agent belongs to organisation
      const agent = await this.prisma.agent.findUnique({
        where: { id: queryDto.agentId },
      });

      if (!agent || agent.isDeleted || agent.organisationId !== organisationId) {
        throw new NotFoundException('Agent not found');
      }

      where.agentId = queryDto.agentId;
    }

    if (queryDto.leadId) {
      // Verify lead belongs to organisation
      const lead = await this.prisma.lead.findUnique({
        where: { id: queryDto.leadId },
      });

      if (!lead || lead.isDeleted || lead.organisationId !== organisationId) {
        throw new NotFoundException('Lead not found');
      }

      where.leadId = queryDto.leadId;
    }

    // Add date range filter for callTime
    if (queryDto.startDateTime || queryDto.endDateTime) {
      where.callTime = {};

      if (queryDto.startDateTime) {
        where.callTime.gte = new Date(queryDto.startDateTime);
      }

      if (queryDto.endDateTime) {
        where.callTime.lte = new Date(queryDto.endDateTime);
      }
    }

    const limit = queryDto.limit || 50;
    const offset = queryDto.offset || 0;
    const sortOrder = queryDto.sortOrder || 'asc';

    // Get total count
    const total = await this.prisma.agentLeadCallSchedule.count({ where });

    // Get paginated records
    const schedules = await this.prisma.agentLeadCallSchedule.findMany({
      where,
      orderBy: { callTime: sortOrder },
      take: limit,
      skip: offset,
    });

    return {
      data: schedules.map((schedule) => new AgentLeadCallScheduleEntity(schedule)),
      total,
      limit,
      offset,
    };
  }

  async findOne(
    id: string,
    organisationId: string,
    userId: string,
    isSuperAdmin: boolean,
  ): Promise<AgentLeadCallScheduleEntity> {
    const schedule = await this.prisma.agentLeadCallSchedule.findUnique({
      where: { id },
      include: {
        agent: true,
        lead: true,
      },
    });

    if (!schedule || schedule.isDeleted) {
      throw new NotFoundException('Schedule not found');
    }

    // Verify belongs to organisation
    if (schedule.agent.organisationId !== organisationId) {
      throw new NotFoundException('Schedule not found');
    }

    // Check user has access to organisation
    if (!isSuperAdmin) {
      const userOrg = await this.prisma.userOrganisation.findFirst({
        where: {
          userId,
          organisationId,
          isDeleted: false,
        },
      });

      if (!userOrg) {
        throw new ForbiddenException('You do not have access to this organisation');
      }
    }

    return new AgentLeadCallScheduleEntity(schedule);
  }

  async update(
    id: string,
    organisationId: string,
    updateDto: UpdateAgentLeadCallScheduleDto,
    userId: string,
    isSuperAdmin: boolean,
  ): Promise<AgentLeadCallScheduleEntity> {
    const schedule = await this.prisma.agentLeadCallSchedule.findUnique({
      where: { id },
      include: {
        agent: true,
      },
    });

    if (!schedule || schedule.isDeleted) {
      throw new NotFoundException('Schedule not found');
    }

    // Verify belongs to organisation
    if (schedule.agent.organisationId !== organisationId) {
      throw new NotFoundException('Schedule not found');
    }

    // Check user has access to organisation
    if (!isSuperAdmin) {
      const userOrg = await this.prisma.userOrganisation.findFirst({
        where: {
          userId,
          organisationId,
          isDeleted: false,
        },
      });

      if (!userOrg) {
        throw new ForbiddenException('You do not have access to this organisation');
      }
    }

    const data: any = {};
    if (updateDto.type !== undefined) {
      data.type = updateDto.type;
    }
    if (updateDto.callTime) {
      data.callTime = new Date(updateDto.callTime);
    }

    const updated = await this.prisma.agentLeadCallSchedule.update({
      where: { id },
      data,
    });

    return new AgentLeadCallScheduleEntity(updated);
  }

  async remove(
    id: string,
    organisationId: string,
    userId: string,
    isSuperAdmin: boolean,
  ): Promise<AgentLeadCallScheduleEntity> {
    const schedule = await this.prisma.agentLeadCallSchedule.findUnique({
      where: { id },
      include: {
        agent: true,
      },
    });

    if (!schedule || schedule.isDeleted) {
      throw new NotFoundException('Schedule not found');
    }

    // Verify belongs to organisation
    if (schedule.agent.organisationId !== organisationId) {
      throw new NotFoundException('Schedule not found');
    }

    // Check user has access to organisation
    if (!isSuperAdmin) {
      const userOrg = await this.prisma.userOrganisation.findFirst({
        where: {
          userId,
          organisationId,
          isDeleted: false,
        },
      });

      if (!userOrg) {
        throw new ForbiddenException('You do not have access to this organisation');
      }
    }

    // Soft delete
    const deleted = await this.prisma.agentLeadCallSchedule.update({
      where: { id },
      data: { isDeleted: true },
    });

    return new AgentLeadCallScheduleEntity(deleted);
  }
}

