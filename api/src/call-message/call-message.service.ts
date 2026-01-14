import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateCallMessageDto, CreateBulkCallMessageDto, CallMessageItemDto } from './dto/create-call-message.dto';
import { UpdateCallMessageDto } from './dto/update-call-message.dto';
import { CallMessageEntity } from './entities/call-message.entity';

@Injectable()
export class CallMessageService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    createCallMessageDto: CreateCallMessageDto,
    userId: string,
    isSuperAdmin: boolean,
  ): Promise<CallMessageEntity> {
    // Verify organisation exists
    const organisation = await this.prisma.organisation.findUnique({
      where: { id: createCallMessageDto.organisationId },
    });

    if (!organisation || organisation.isDeleted) {
      throw new NotFoundException('Organisation not found');
    }

    // Check user has access to organisation
    if (!isSuperAdmin) {
      const userOrg = await this.prisma.userOrganisation.findFirst({
        where: {
          userId,
          organisationId: createCallMessageDto.organisationId,
          isDeleted: false,
        },
      });

      if (!userOrg) {
        throw new ForbiddenException('You do not have access to this organisation');
      }
    }

    // Verify call exists and belongs to organisation
    const call = await this.prisma.call.findUnique({
      where: { id: createCallMessageDto.callId },
    });

    if (!call || call.isDeleted || call.organisationId !== createCallMessageDto.organisationId) {
      throw new NotFoundException('Call not found');
    }

    const message = await this.prisma.callMessage.create({
      data: createCallMessageDto,
    });

    return new CallMessageEntity(message);
  }

  /**
   * Create multiple call messages in bulk
   * Uses a transaction to ensure all messages are created or none
   */
  async createMany(
    callId: string,
    organisationId: string,
    createBulkCallMessageDto: CreateBulkCallMessageDto,
    userId: string,
    isSuperAdmin: boolean,
  ): Promise<CallMessageEntity[]> {
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

    // Verify call exists and belongs to organisation
    const call = await this.prisma.call.findUnique({
      where: { id: callId },
    });

    if (!call || call.isDeleted || call.organisationId !== organisationId) {
      throw new NotFoundException('Call not found');
    }

    // Prepare messages data with callId and organisationId
    const messagesData = createBulkCallMessageDto.messages.map((message) => ({
      callId,
      organisationId,
      role: message.role,
      content: message.content,
    }));

    // Use createManyAndReturn to get the created records
    // This is more efficient than creating one by one
    const createdMessages = await this.prisma.callMessage.createManyAndReturn({
      data: messagesData,
    });

    return createdMessages.map((message) => new CallMessageEntity(message));
  }

  async findAll(
    callId: string,
    organisationId: string,
    userId: string,
    isSuperAdmin: boolean,
  ): Promise<CallMessageEntity[]> {
    // Verify call exists and belongs to organisation
    const call = await this.prisma.call.findUnique({
      where: { id: callId },
    });

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

    const messages = await this.prisma.callMessage.findMany({
      where: {
        callId,
        isDeleted: false,
      },
      orderBy: { createdAt: 'asc' },
    });

    return messages.map((message) => new CallMessageEntity(message));
  }

  async findOne(
    id: string,
    callId: string,
    organisationId: string,
    userId: string,
    isSuperAdmin: boolean,
  ): Promise<CallMessageEntity> {
    const message = await this.prisma.callMessage.findUnique({
      where: { id },
    });

    if (!message || message.isDeleted || message.callId !== callId || message.organisationId !== organisationId) {
      throw new NotFoundException('Call message not found');
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

    return new CallMessageEntity(message);
  }

  async update(
    id: string,
    callId: string,
    organisationId: string,
    updateCallMessageDto: UpdateCallMessageDto,
    userId: string,
    isSuperAdmin: boolean,
  ): Promise<CallMessageEntity> {
    const message = await this.prisma.callMessage.findUnique({
      where: { id },
    });

    if (!message || message.isDeleted || message.callId !== callId || message.organisationId !== organisationId) {
      throw new NotFoundException('Call message not found');
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

    const updated = await this.prisma.callMessage.update({
      where: { id },
      data: updateCallMessageDto,
    });

    return new CallMessageEntity(updated);
  }

  async remove(
    id: string,
    callId: string,
    organisationId: string,
    userId: string,
    isSuperAdmin: boolean,
  ): Promise<CallMessageEntity> {
    const message = await this.prisma.callMessage.findUnique({
      where: { id },
    });

    if (!message || message.isDeleted || message.callId !== callId || message.organisationId !== organisationId) {
      throw new NotFoundException('Call message not found');
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
    const deleted = await this.prisma.callMessage.update({
      where: { id },
      data: { isDeleted: true },
    });

    return new CallMessageEntity(deleted);
  }
}
