import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateCallDto } from './dto/create-call.dto';
import { UpdateCallDto } from './dto/update-call.dto';
import { QueryCallDto } from './dto/query-call.dto';
import { CallEntity } from './entities/call.entity';
import type { PaginatedResponse } from '../common/dto/pagination-query.dto';

@Injectable()
export class CallService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    createCallDto: CreateCallDto,
    userId: string,
    isSuperAdmin: boolean,
  ): Promise<CallEntity> {
    // Verify organisation exists
    const organisation = await this.prisma.organisation.findUnique({
      where: { id: createCallDto.organisationId },
    });

    if (!organisation || organisation.isDeleted) {
      throw new NotFoundException('Organisation not found');
    }

    // Check user has access to organisation
    if (!isSuperAdmin) {
      const userOrg = await this.prisma.userOrganisation.findFirst({
        where: {
          userId,
          organisationId: createCallDto.organisationId,
          isDeleted: false,
        },
      });

      if (!userOrg) {
        throw new ForbiddenException('You do not have access to this organisation');
      }
    }

    // Verify agent exists and belongs to organisation
    const agent = await this.prisma.agent.findUnique({
      where: { id: createCallDto.agentId },
    });

    if (!agent || agent.isDeleted || agent.organisationId !== createCallDto.organisationId) {
      throw new NotFoundException('Agent not found');
    }

    // Verify lead exists and belongs to organisation
    const lead = await this.prisma.lead.findUnique({
      where: { id: createCallDto.leadId },
    });

    if (!lead || lead.isDeleted || lead.organisationId !== createCallDto.organisationId) {
      throw new NotFoundException('Lead not found');
    }

    // Check if externalId is unique (if provided)
    if (createCallDto.externalId) {
      const existingCall = await this.prisma.call.findUnique({
        where: { externalId: createCallDto.externalId },
      });

      if (existingCall) {
        throw new ConflictException('A call with this external ID already exists');
      }
    }

    const call = await this.prisma.call.create({
      data: createCallDto,
    });

    return new CallEntity(call);
  }

  async findAll(
    organisationId: string,
    userId: string,
    isSuperAdmin: boolean,
    queryDto: QueryCallDto,
  ): Promise<PaginatedResponse<CallEntity>> {
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
      organisationId,
      isDeleted: false,
    };

    if (queryDto.status) {
      where.status = queryDto.status;
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

    const limit = queryDto.limit || 50;
    const offset = queryDto.offset || 0;
    const sortOrder = queryDto.sortOrder || 'desc';

    // Get total count
    const total = await this.prisma.call.count({ where });

    // Get paginated records
    const calls = await this.prisma.call.findMany({
      where,
      orderBy: { createdAt: sortOrder },
      take: limit,
      skip: offset,
    });

    return {
      data: calls.map((call) => new CallEntity(call)),
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
  ): Promise<CallEntity> {
    // Try to find by id first, then by externalId
    let call = await this.prisma.call.findUnique({
      where: { id },
    });

    // If not found by id, try externalId
    if (!call) {
      call = await this.prisma.call.findUnique({
        where: { externalId: id },
      });
    }

    if (!call || call.isDeleted || call.organisationId !== organisationId) {
      throw new NotFoundException('Call not found');
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

    return new CallEntity(call);
  }

  async update(
    id: string,
    organisationId: string,
    updateCallDto: UpdateCallDto,
    userId: string,
    isSuperAdmin: boolean,
  ): Promise<CallEntity> {
    // Try to find by id first, then by externalId
    let call = await this.prisma.call.findUnique({
      where: { id },
    });

    // If not found by id, try externalId
    if (!call) {
      call = await this.prisma.call.findUnique({
        where: { externalId: id },
      });
    }

    if (!call || call.isDeleted || call.organisationId !== organisationId) {
      throw new NotFoundException('Call not found');
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

    // Check if externalId is unique (if provided and different from current)
    if (updateCallDto.externalId && updateCallDto.externalId !== call.externalId) {
      const existingCall = await this.prisma.call.findUnique({
        where: { externalId: updateCallDto.externalId },
      });

      if (existingCall) {
        throw new ConflictException('A call with this external ID already exists');
      }
    }

    const updated = await this.prisma.call.update({
      where: { id: call.id },
      data: updateCallDto,
    });

    return new CallEntity(updated);
  }

  async remove(
    id: string,
    organisationId: string,
    userId: string,
    isSuperAdmin: boolean,
  ): Promise<CallEntity> {
    // Try to find by id first, then by externalId
    let call = await this.prisma.call.findUnique({
      where: { id },
    });

    // If not found by id, try externalId
    if (!call) {
      call = await this.prisma.call.findUnique({
        where: { externalId: id },
      });
    }

    if (!call || call.isDeleted || call.organisationId !== organisationId) {
      throw new NotFoundException('Call not found');
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
    const deleted = await this.prisma.call.update({
      where: { id: call.id },
      data: { isDeleted: true },
    });

    return new CallEntity(deleted);
  }
}
