import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateOrganisationDto } from './dto/create-organisation.dto';
import { UpdateOrganisationDto } from './dto/update-organisation.dto';
import { OrganisationEntity } from './entities/organisation.entity';
import { Role } from '../common/enums';

@Injectable()
export class OrganisationService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    createOrganisationDto: CreateOrganisationDto,
    userId: string,
  ): Promise<OrganisationEntity> {
    // Check if slug already exists
    const existingOrg = await this.prisma.organisation.findUnique({
      where: { slug: createOrganisationDto.slug },
    });

    if (existingOrg && !existingOrg.isDeleted) {
      throw new ConflictException('Organisation slug already exists');
    }

    // Create organisation and assign creator as OWNER
    const organisation = await this.prisma.organisation.create({
      data: {
        name: createOrganisationDto.name,
        slug: createOrganisationDto.slug,
        ...(createOrganisationDto.availableIndianChannels !== undefined && {
          availableIndianChannels: createOrganisationDto.availableIndianChannels,
        }),
        ...(createOrganisationDto.availableInternationalChannels !== undefined && {
          availableInternationalChannels: createOrganisationDto.availableInternationalChannels,
        }),
        ...(createOrganisationDto.chatCredits !== undefined && {
          chatCredits: createOrganisationDto.chatCredits,
        }),
        ...(createOrganisationDto.callCredits !== undefined && {
          callCredits: createOrganisationDto.callCredits,
        }),
        userOrganisations: {
          create: {
            userId,
            role: Role.OWNER,
          },
        },
      },
    });

    return new OrganisationEntity(organisation);
  }

  async findAll(userId: string, isSuperAdmin: boolean): Promise<OrganisationEntity[]> {
    const where = isSuperAdmin
      ? { isDeleted: false }
      : {
          isDeleted: false,
          userOrganisations: {
            some: {
              userId,
              isDeleted: false,
            },
          },
        };

    const organisations = await this.prisma.organisation.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return organisations.map((org) => new OrganisationEntity(org));
  }

  async findOne(id: string, userId: string, isSuperAdmin: boolean): Promise<OrganisationEntity> {
    const organisation = await this.prisma.organisation.findUnique({
      where: { id },
      include: {
        userOrganisations: {
          where: { isDeleted: false },
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    if (!organisation || organisation.isDeleted) {
      throw new NotFoundException('Organisation not found');
    }

    // Check access
    if (!isSuperAdmin) {
      const hasAccess = organisation.userOrganisations.some(
        (uo) => uo.userId === userId,
      );
      if (!hasAccess) {
        throw new ForbiddenException('You do not have access to this organisation');
      }
    }

    return new OrganisationEntity(organisation);
  }

  async update(
    id: string,
    updateOrganisationDto: UpdateOrganisationDto,
    userId: string,
    isSuperAdmin: boolean,
  ): Promise<OrganisationEntity> {
    const organisation = await this.prisma.organisation.findUnique({
      where: { id },
      include: {
        userOrganisations: {
          where: { userId, isDeleted: false },
        },
      },
    });

    if (!organisation || organisation.isDeleted) {
      throw new NotFoundException('Organisation not found');
    }

    // Check permissions (OWNER or ADMIN or SuperAdmin)
    if (!isSuperAdmin) {
      const userOrg = organisation.userOrganisations[0];
      if (!userOrg || (userOrg.role !== Role.OWNER && userOrg.role !== Role.ADMIN)) {
        throw new ForbiddenException('Insufficient permissions to update organisation');
      }
    }

    // Check slug uniqueness if being updated
    if (updateOrganisationDto.slug && updateOrganisationDto.slug !== organisation.slug) {
      const existingOrg = await this.prisma.organisation.findUnique({
        where: { slug: updateOrganisationDto.slug },
      });

      if (existingOrg && !existingOrg.isDeleted) {
        throw new ConflictException('Organisation slug already exists');
      }
    }

    const updated = await this.prisma.organisation.update({
      where: { id },
      data: updateOrganisationDto,
    });

    return new OrganisationEntity(updated);
  }

  async remove(id: string, userId: string, isSuperAdmin: boolean): Promise<OrganisationEntity> {
    const organisation = await this.prisma.organisation.findUnique({
      where: { id },
      include: {
        userOrganisations: {
          where: { userId, isDeleted: false },
        },
      },
    });

    if (!organisation || organisation.isDeleted) {
      throw new NotFoundException('Organisation not found');
    }

    // Only OWNER or SuperAdmin can delete
    if (!isSuperAdmin) {
      const userOrg = organisation.userOrganisations[0];
      if (!userOrg || userOrg.role !== Role.OWNER) {
        throw new ForbiddenException('Only organisation owners can delete organisations');
      }
    }

    // Soft delete
    const deleted = await this.prisma.organisation.update({
      where: { id },
      data: { isDeleted: true },
    });

    return new OrganisationEntity(deleted);
  }
}
