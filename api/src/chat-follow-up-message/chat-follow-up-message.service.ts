import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateChatFollowUpMessageDto } from './dto/create-chat-follow-up-message.dto';
import { UpdateChatFollowUpMessageDto } from './dto/update-chat-follow-up-message.dto';

@Injectable()
export class ChatFollowUpMessageService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    createDto: CreateChatFollowUpMessageDto,
    userId: string,
    isSuperAdmin: boolean,
  ) {
    // Check if user has access to organisation
    if (!isSuperAdmin) {
      const userOrg = await this.prisma.userOrganisation.findFirst({
        where: {
          userId,
          organisationId: createDto.organisationId,
          isDeleted: false,
        },
      });

      if (!userOrg) {
        throw new ForbiddenException(
          'You do not have access to this organisation',
        );
      }
    }

    // Check if slug + sequence combination already exists in organisation
    const existing = await this.prisma.chatFollowUpMessages.findFirst({
      where: {
        slug: createDto.slug,
        organisationId: createDto.organisationId,
        sequence: createDto.sequence ?? 1,
        isDeleted: false,
      },
    });

    if (existing) {
      throw new ConflictException(
        'Follow-up message with this slug and sequence already exists in this organisation',
      );
    }

    return this.prisma.chatFollowUpMessages.create({
      data: createDto,
    });
  }

  async findAll(
    organisationId: string,
    userId: string,
    isSuperAdmin: boolean,
    slug?: string,
    sequence?: number,
  ) {
    // Check if user has access to organisation
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

    // Build where clause with optional filters
    const where: any = {
      organisationId,
      isDeleted: false,
    };

    if (slug) {
      where.slug = slug;
    }

    if (sequence !== undefined) {
      where.sequence = sequence;
    }

    return this.prisma.chatFollowUpMessages.findMany({
      where,
      orderBy: [{ slug: 'asc' }, { sequence: 'asc' }],
    });
  }

  async findOne(
    id: string,
    organisationId: string,
    userId: string,
    isSuperAdmin: boolean,
  ) {
    // Check if user has access to organisation
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

    const message = await this.prisma.chatFollowUpMessages.findFirst({
      where: {
        id,
        organisationId,
        isDeleted: false,
      },
    });

    if (!message) {
      throw new NotFoundException('Follow-up message not found');
    }

    return message;
  }

  async update(
    id: string,
    organisationId: string,
    updateDto: UpdateChatFollowUpMessageDto,
    userId: string,
    isSuperAdmin: boolean,
  ) {
    // Check if user has access to organisation
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

    // Check if message exists
    const message = await this.prisma.chatFollowUpMessages.findFirst({
      where: {
        id,
        organisationId,
        isDeleted: false,
      },
    });

    if (!message) {
      throw new NotFoundException('Follow-up message not found');
    }

    // If slug or sequence is being updated, check for conflicts
    const newSlug = updateDto.slug ?? message.slug;
    const newSequence = updateDto.sequence ?? message.sequence;

    if (
      (updateDto.slug && updateDto.slug !== message.slug) ||
      (updateDto.sequence !== undefined &&
        updateDto.sequence !== message.sequence)
    ) {
      const existing = await this.prisma.chatFollowUpMessages.findFirst({
        where: {
          slug: newSlug,
          organisationId,
          sequence: newSequence,
          isDeleted: false,
          id: { not: id },
        },
      });

      if (existing) {
        throw new ConflictException(
          'Follow-up message with this slug and sequence combination already exists in this organisation',
        );
      }
    }

    return this.prisma.chatFollowUpMessages.update({
      where: { id },
      data: updateDto,
    });
  }

  async remove(
    id: string,
    organisationId: string,
    userId: string,
    isSuperAdmin: boolean,
  ) {
    // Check if user has access to organisation
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

    // Check if message exists
    const message = await this.prisma.chatFollowUpMessages.findFirst({
      where: {
        id,
        organisationId,
        isDeleted: false,
      },
    });

    if (!message) {
      throw new NotFoundException('Follow-up message not found');
    }

    // Soft delete
    return this.prisma.chatFollowUpMessages.update({
      where: { id },
      data: { isDeleted: true },
    });
  }
}
