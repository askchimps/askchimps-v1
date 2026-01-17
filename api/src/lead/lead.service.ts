import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { QueryLeadDto } from './dto/query-lead.dto';
import { LeadEntity } from './entities/lead.entity';
import { Role } from '../common/enums';
import type { PaginatedResponse } from '../common/dto/pagination-query.dto';

@Injectable()
export class LeadService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    createLeadDto: CreateLeadDto,
    userId: string,
    isSuperAdmin: boolean,
  ): Promise<LeadEntity> {
    // Verify organisation exists and user has access
    const organisation = await this.prisma.organisation.findUnique({
      where: { id: createLeadDto.organisationId },
    });

    if (!organisation || organisation.isDeleted) {
      throw new NotFoundException('Organisation not found');
    }

    // Check user has access to organisation
    if (!isSuperAdmin) {
      const userOrg = await this.prisma.userOrganisation.findFirst({
        where: {
          userId,
          organisationId: createLeadDto.organisationId,
          isDeleted: false,
        },
      });

      if (!userOrg) {
        throw new ForbiddenException(
          'You do not have access to this organisation',
        );
      }
    }

    // Verify agent exists and belongs to organisation
    const agent = await this.prisma.agent.findUnique({
      where: { id: createLeadDto.agentId },
    });

    if (
      !agent ||
      agent.isDeleted ||
      agent.organisationId !== createLeadDto.organisationId
    ) {
      throw new NotFoundException('Agent not found');
    }

    // Verify lead owner exists if provided
    if (createLeadDto.ownerId) {
      const owner = await this.prisma.leadOwner.findUnique({
        where: { id: createLeadDto.ownerId },
      });

      if (!owner || owner.isDeleted) {
        throw new NotFoundException('Lead owner not found');
      }
    }

    // Check for duplicate email or phone within organisation
    if (createLeadDto.email || createLeadDto.phone) {
      const existingLead = await this.prisma.lead.findFirst({
        where: {
          organisationId: createLeadDto.organisationId,
          isDeleted: false,
          OR: [
            createLeadDto.email ? { email: createLeadDto.email } : {},
            createLeadDto.phone ? { phone: createLeadDto.phone } : {},
          ].filter((condition) => Object.keys(condition).length > 0),
        },
      });

      if (existingLead) {
        if (existingLead.email === createLeadDto.email) {
          throw new ConflictException(
            'A lead with this email already exists in this organisation',
          );
        }
        if (existingLead.phone === createLeadDto.phone) {
          throw new ConflictException(
            'A lead with this phone number already exists in this organisation',
          );
        }
      }
    }

    // Verify tags exist and belong to organisation if provided
    if (createLeadDto.tagIds && createLeadDto.tagIds.length > 0) {
      const tags = await this.prisma.tag.findMany({
        where: {
          id: { in: createLeadDto.tagIds },
          organisationId: createLeadDto.organisationId,
          isDeleted: false,
        },
      });

      if (tags.length !== createLeadDto.tagIds.length) {
        throw new NotFoundException(
          'One or more tags not found or do not belong to this organisation',
        );
      }
    }

    const { tagIds, ...leadData } = createLeadDto;

    const lead = await this.prisma.lead.create({
      data: {
        ...leadData,
        ...(tagIds && tagIds.length > 0
          ? {
              tags: {
                connect: tagIds.map((id) => ({ id })),
              },
            }
          : {}),
      },
      include: {
        tags: true,
      },
    });

    return new LeadEntity(lead);
  }

  async findAll(
    organisationId: string,
    userId: string,
    isSuperAdmin: boolean,
    queryDto: QueryLeadDto,
  ): Promise<
    PaginatedResponse<LeadEntity> & {
      statuses: string[];
      dispositions: string[];
    }
  > {
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
        throw new ForbiddenException(
          'You do not have access to this organisation',
        );
      }
    }

    const where: any = {
      organisationId,
      isDeleted: false,
    };

    if (queryDto.agentId) {
      where.agentId = queryDto.agentId;
    }

    if (queryDto.status) {
      where.status = queryDto.status;
    }

    if (queryDto.disposition) {
      where.disposition = queryDto.disposition;
    }

    if (queryDto.source) {
      where.source = queryDto.source;
    }

    if (queryDto.search) {
      where.OR = [
        { firstName: { contains: queryDto.search, mode: 'insensitive' } },
        { lastName: { contains: queryDto.search, mode: 'insensitive' } },
        { email: { contains: queryDto.search, mode: 'insensitive' } },
        { phone: { contains: queryDto.search, mode: 'insensitive' } },
      ];
    }

    const limit = queryDto.limit || 50;
    const offset = queryDto.offset || 0;
    const sortOrder = queryDto.sortOrder || 'desc';

    // Get total count
    const total = await this.prisma.lead.count({ where });

    // Get paginated records
    const leads = await this.prisma.lead.findMany({
      where,
      include: {
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: sortOrder },
      take: limit,
      skip: offset,
    });

    // Get unique statuses and dispositions for the organisation
    const uniqueStatuses = await this.prisma.lead.findMany({
      where: {
        organisationId,
        isDeleted: false,
        status: { not: null },
      },
      select: { status: true },
      distinct: ['status'],
    });

    const uniqueDispositions = await this.prisma.lead.findMany({
      where: {
        organisationId,
        isDeleted: false,
        disposition: { not: null },
      },
      select: { disposition: true },
      distinct: ['disposition'],
    });

    return {
      data: leads.map((lead) => new LeadEntity(lead)),
      total,
      limit,
      offset,
      statuses: uniqueStatuses
        .map((s) => s.status)
        .filter((s): s is string => s !== null),
      dispositions: uniqueDispositions
        .map((d) => d.disposition)
        .filter((d): d is string => d !== null),
    };
  }

  async findOne(
    id: string,
    organisationId: string,
    userId: string,
    isSuperAdmin: boolean,
  ): Promise<LeadEntity> {
    const lead = await this.prisma.lead.findUnique({
      where: { id },
      include: {
        owner: true,
        organisation: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    if (!lead || lead.isDeleted) {
      throw new NotFoundException('Lead not found');
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
        throw new ForbiddenException(
          'You do not have access to this organisation',
        );
      }
    }

    return new LeadEntity(lead);
  }

  async update(
    id: string,
    organisationId: string,
    updateLeadDto: UpdateLeadDto,
    userId: string,
    isSuperAdmin: boolean,
  ): Promise<LeadEntity> {
    const lead = await this.prisma.lead.findUnique({
      where: { id },
    });

    if (!lead || lead.isDeleted) {
      throw new NotFoundException('Lead not found');
    }

    // Verify lead belongs to the specified organisation
    if (lead.organisationId !== organisationId) {
      throw new ForbiddenException('Lead does not belong to this organisation');
    }

    // Check user has access to organisation (OWNER or ADMIN can update)
    if (!isSuperAdmin) {
      const userOrg = await this.prisma.userOrganisation.findFirst({
        where: {
          userId,
          organisationId,
          isDeleted: false,
        },
      });

      if (
        !userOrg ||
        (userOrg.role !== Role.OWNER && userOrg.role !== Role.ADMIN)
      ) {
        throw new ForbiddenException(
          'Insufficient permissions to update leads',
        );
      }
    }

    // Verify lead owner exists if being updated
    if (updateLeadDto.ownerId) {
      const owner = await this.prisma.leadOwner.findUnique({
        where: { id: updateLeadDto.ownerId },
      });

      if (!owner || owner.isDeleted) {
        throw new NotFoundException('Lead owner not found');
      }
    }

    // Check for duplicate email or phone if being updated
    if (updateLeadDto.email || updateLeadDto.phone) {
      const existingLead = await this.prisma.lead.findFirst({
        where: {
          organisationId,
          isDeleted: false,
          id: { not: id },
          OR: [
            updateLeadDto.email ? { email: updateLeadDto.email } : {},
            updateLeadDto.phone ? { phone: updateLeadDto.phone } : {},
          ].filter((condition) => Object.keys(condition).length > 0),
        },
      });

      if (existingLead) {
        if (existingLead.email === updateLeadDto.email) {
          throw new ConflictException(
            'A lead with this email already exists in this organisation',
          );
        }
        if (existingLead.phone === updateLeadDto.phone) {
          throw new ConflictException(
            'A lead with this phone number already exists in this organisation',
          );
        }
      }
    }

    // Verify tags exist and belong to organisation if provided
    if (updateLeadDto.tagIds && updateLeadDto.tagIds.length > 0) {
      const tags = await this.prisma.tag.findMany({
        where: {
          id: { in: updateLeadDto.tagIds },
          organisationId,
          isDeleted: false,
        },
      });

      if (tags.length !== updateLeadDto.tagIds.length) {
        throw new NotFoundException(
          'One or more tags not found or do not belong to this organisation',
        );
      }
    }

    const { tagIds, ...leadData } = updateLeadDto;

    const updated = await this.prisma.lead.update({
      where: { id },
      data: {
        ...leadData,
        ...(tagIds !== undefined
          ? {
              tags: {
                set: tagIds.map((id) => ({ id })),
              },
            }
          : {}),
      },
      include: {
        tags: true,
      },
    });

    return new LeadEntity(updated);
  }

  async remove(
    id: string,
    organisationId: string,
    userId: string,
    isSuperAdmin: boolean,
  ): Promise<LeadEntity> {
    const lead = await this.prisma.lead.findUnique({
      where: { id },
    });

    if (!lead || lead.isDeleted) {
      throw new NotFoundException('Lead not found');
    }

    // Verify lead belongs to the specified organisation
    if (lead.organisationId !== organisationId) {
      throw new ForbiddenException('Lead does not belong to this organisation');
    }

    // Check user has access to organisation (OWNER or ADMIN can delete)
    if (!isSuperAdmin) {
      const userOrg = await this.prisma.userOrganisation.findFirst({
        where: {
          userId,
          organisationId,
          isDeleted: false,
        },
      });

      if (
        !userOrg ||
        (userOrg.role !== Role.OWNER && userOrg.role !== Role.ADMIN)
      ) {
        throw new ForbiddenException(
          'Insufficient permissions to delete leads',
        );
      }
    }

    // Soft delete
    const deleted = await this.prisma.lead.update({
      where: { id },
      data: { isDeleted: true },
    });

    return new LeadEntity(deleted);
  }
}
