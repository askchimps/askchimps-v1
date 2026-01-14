import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { LeadEntity } from './entities/lead.entity';
import { Role } from '../common/enums';

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
        throw new ForbiddenException('You do not have access to this organisation');
      }
    }

    // Verify agent exists and belongs to organisation
    const agent = await this.prisma.agent.findUnique({
      where: { id: createLeadDto.agentId },
    });

    if (!agent || agent.isDeleted || agent.organisationId !== createLeadDto.organisationId) {
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
          throw new ConflictException('A lead with this email already exists in this organisation');
        }
        if (existingLead.phone === createLeadDto.phone) {
          throw new ConflictException('A lead with this phone number already exists in this organisation');
        }
      }
    }

    const lead = await this.prisma.lead.create({
      data: createLeadDto,
    });

    return new LeadEntity(lead);
  }

  async findAll(
    organisationId: string,
    userId: string,
    isSuperAdmin: boolean,
  ): Promise<LeadEntity[]> {
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

    const leads = await this.prisma.lead.findMany({
      where: {
        organisationId,
        isDeleted: false,
      },
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
      orderBy: { createdAt: 'desc' },
    });

    return leads.map((lead) => new LeadEntity(lead));
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
        throw new ForbiddenException('You do not have access to this organisation');
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

      if (!userOrg || (userOrg.role !== Role.OWNER && userOrg.role !== Role.ADMIN)) {
        throw new ForbiddenException('Insufficient permissions to update leads');
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
          throw new ConflictException('A lead with this email already exists in this organisation');
        }
        if (existingLead.phone === updateLeadDto.phone) {
          throw new ConflictException('A lead with this phone number already exists in this organisation');
        }
      }
    }

    const updated = await this.prisma.lead.update({
      where: { id },
      data: updateLeadDto,
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

      if (!userOrg || (userOrg.role !== Role.OWNER && userOrg.role !== Role.ADMIN)) {
        throw new ForbiddenException('Insufficient permissions to delete leads');
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

