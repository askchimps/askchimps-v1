import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateUserOrganisationDto } from './dto/create-user-organisation.dto';
import { UpdateUserOrganisationDto } from './dto/update-user-organisation.dto';
import { UserOrganisationEntity } from './entities/user-organisation.entity';
import { Role } from '../common/enums';

@Injectable()
export class UserOrganisationService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    createDto: CreateUserOrganisationDto,
    requestUserId: string,
    isSuperAdmin: boolean,
  ): Promise<UserOrganisationEntity> {
    // Verify organisation exists
    const organisation = await this.prisma.organisation.findUnique({
      where: { id: createDto.organisationId },
    });

    if (!organisation || organisation.isDeleted) {
      throw new NotFoundException('Organisation not found');
    }

    // Verify user exists
    const user = await this.prisma.user.findUnique({
      where: { id: createDto.userId },
    });

    if (!user || !user.isActive) {
      throw new NotFoundException('User not found or inactive');
    }

    // Check permissions (only OWNER or ADMIN can add users)
    if (!isSuperAdmin) {
      const requestUserOrg = await this.prisma.userOrganisation.findFirst({
        where: {
          userId: requestUserId,
          organisationId: createDto.organisationId,
          isDeleted: false,
        },
      });

      if (
        !requestUserOrg ||
        (requestUserOrg.role !== Role.OWNER &&
          requestUserOrg.role !== Role.ADMIN)
      ) {
        throw new ForbiddenException(
          'Only organisation owners and admins can add users',
        );
      }

      // ADMIN cannot add OWNER
      if (requestUserOrg.role === Role.ADMIN && createDto.role === Role.OWNER) {
        throw new ForbiddenException('Admins cannot add owners');
      }
    }

    // Check if user is already in organisation
    const existing = await this.prisma.userOrganisation.findFirst({
      where: {
        userId: createDto.userId,
        organisationId: createDto.organisationId,
      },
    });

    if (existing && !existing.isDeleted) {
      throw new ConflictException(
        'User is already a member of this organisation',
      );
    }

    // If exists but deleted, restore it
    if (existing && existing.isDeleted) {
      const restored = await this.prisma.userOrganisation.update({
        where: { id: existing.id },
        data: {
          role: createDto.role,
          isDeleted: false,
        },
      });
      return new UserOrganisationEntity(restored);
    }

    // Create new user-organisation relationship
    const userOrg = await this.prisma.userOrganisation.create({
      data: createDto,
    });

    return new UserOrganisationEntity(userOrg);
  }

  async findAllByOrganisation(
    organisationId: string,
    requestUserId: string,
    isSuperAdmin: boolean,
  ): Promise<UserOrganisationEntity[]> {
    // Check access to organisation
    if (!isSuperAdmin) {
      const hasAccess = await this.prisma.userOrganisation.findFirst({
        where: {
          userId: requestUserId,
          organisationId,
          isDeleted: false,
        },
      });

      if (!hasAccess) {
        throw new ForbiddenException(
          'You do not have access to this organisation',
        );
      }
    }

    const userOrgs = await this.prisma.userOrganisation.findMany({
      where: {
        organisationId,
        isDeleted: false,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            isActive: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return userOrgs.map((uo) => new UserOrganisationEntity(uo));
  }

  async findOne(
    id: string,
    requestUserId: string,
    isSuperAdmin: boolean,
  ): Promise<UserOrganisationEntity> {
    const userOrg = await this.prisma.userOrganisation.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        organisation: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    if (!userOrg || userOrg.isDeleted) {
      throw new NotFoundException('User-organisation relationship not found');
    }

    // Check access
    if (!isSuperAdmin) {
      const hasAccess = await this.prisma.userOrganisation.findFirst({
        where: {
          userId: requestUserId,
          organisationId: userOrg.organisationId,
          isDeleted: false,
        },
      });

      if (!hasAccess) {
        throw new ForbiddenException(
          'You do not have access to this organisation',
        );
      }
    }

    return new UserOrganisationEntity(userOrg);
  }

  async update(
    id: string,
    updateDto: UpdateUserOrganisationDto,
    requestUserId: string,
    isSuperAdmin: boolean,
  ): Promise<UserOrganisationEntity> {
    const userOrg = await this.prisma.userOrganisation.findUnique({
      where: { id },
    });

    if (!userOrg || userOrg.isDeleted) {
      throw new NotFoundException('User-organisation relationship not found');
    }

    // Check permissions (only OWNER can change roles)
    if (!isSuperAdmin) {
      const requestUserOrg = await this.prisma.userOrganisation.findFirst({
        where: {
          userId: requestUserId,
          organisationId: userOrg.organisationId,
          isDeleted: false,
        },
      });

      if (!requestUserOrg || requestUserOrg.role !== Role.OWNER) {
        throw new ForbiddenException(
          'Only organisation owners can change user roles',
        );
      }

      // Cannot change own role
      if (userOrg.userId === requestUserId) {
        throw new BadRequestException('You cannot change your own role');
      }

      // Check if trying to demote the last owner
      if (userOrg.role === Role.OWNER && updateDto.role !== Role.OWNER) {
        const ownerCount = await this.prisma.userOrganisation.count({
          where: {
            organisationId: userOrg.organisationId,
            role: Role.OWNER,
            isDeleted: false,
          },
        });

        if (ownerCount <= 1) {
          throw new BadRequestException(
            'Cannot demote the last owner of the organisation',
          );
        }
      }
    }

    const updated = await this.prisma.userOrganisation.update({
      where: { id },
      data: { role: updateDto.role },
    });

    return new UserOrganisationEntity(updated);
  }

  async remove(
    id: string,
    requestUserId: string,
    isSuperAdmin: boolean,
  ): Promise<UserOrganisationEntity> {
    const userOrg = await this.prisma.userOrganisation.findUnique({
      where: { id },
    });

    if (!userOrg || userOrg.isDeleted) {
      throw new NotFoundException('User-organisation relationship not found');
    }

    // Check permissions (OWNER or ADMIN can remove users, or users can remove themselves)
    if (!isSuperAdmin) {
      const requestUserOrg = await this.prisma.userOrganisation.findFirst({
        where: {
          userId: requestUserId,
          organisationId: userOrg.organisationId,
          isDeleted: false,
        },
      });

      const isSelfRemoval = userOrg.userId === requestUserId;
      const hasPermission =
        requestUserOrg &&
        (requestUserOrg.role === Role.OWNER ||
          requestUserOrg.role === Role.ADMIN);

      if (!isSelfRemoval && !hasPermission) {
        throw new ForbiddenException(
          'Insufficient permissions to remove this user',
        );
      }

      // ADMIN cannot remove OWNER
      if (
        !isSelfRemoval &&
        requestUserOrg &&
        requestUserOrg.role === Role.ADMIN &&
        userOrg.role === Role.OWNER
      ) {
        throw new ForbiddenException('Admins cannot remove owners');
      }

      // Cannot remove the last owner
      if (userOrg.role === Role.OWNER) {
        const ownerCount = await this.prisma.userOrganisation.count({
          where: {
            organisationId: userOrg.organisationId,
            role: Role.OWNER,
            isDeleted: false,
          },
        });

        if (ownerCount <= 1) {
          throw new BadRequestException(
            'Cannot remove the last owner of the organisation',
          );
        }
      }
    }

    // Soft delete
    const deleted = await this.prisma.userOrganisation.update({
      where: { id },
      data: { isDeleted: true },
    });

    return new UserOrganisationEntity(deleted);
  }
}
