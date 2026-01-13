import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateChatMessageDto } from './dto/create-chat-message.dto';
import { UpdateChatMessageDto } from './dto/update-chat-message.dto';
import { QueryChatMessageDto } from './dto/query-chat-message.dto';
import { ChatMessageEntity } from './entities/chat-message.entity';
import { CHAT_MESSAGE_TYPE } from '@prisma/client';
import type { PaginatedResponse } from '../common/dto/pagination-query.dto';

@Injectable()
export class ChatMessageService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    organisationId: string,
    chatIdOrSourceId: string,
    createChatMessageDto: CreateChatMessageDto,
  ): Promise<ChatMessageEntity> {
    // Verify chat exists and belongs to organisation (support both id and sourceId)
    const chat = await this.prisma.chat.findFirst({
      where: {
        organisationId,
        isDeleted: false,
        OR: [
          { id: chatIdOrSourceId },
          { sourceId: chatIdOrSourceId },
        ],
      },
    });

    if (!chat) {
      throw new NotFoundException('Chat not found');
    }

    // Create message with attachments
    const message = await this.prisma.chatMessage.create({
      data: {
        chatId: chat.id,
        organisationId,
        role: createChatMessageDto.role,
        content: createChatMessageDto.content,
        type: createChatMessageDto.type || CHAT_MESSAGE_TYPE.TEXT,
        attachments: createChatMessageDto.attachments
          ? {
              create: createChatMessageDto.attachments,
            }
          : undefined,
      },
      include: {
        attachments: {
          where: { isDeleted: false },
        },
      },
    });

    return new ChatMessageEntity(message);
  }

  async findAll(
    organisationId: string,
    chatIdOrSourceId: string,
    queryDto: QueryChatMessageDto,
  ): Promise<PaginatedResponse<ChatMessageEntity>> {
    // Verify chat exists and belongs to organisation (support both id and sourceId)
    const chat = await this.prisma.chat.findFirst({
      where: {
        organisationId,
        isDeleted: false,
        OR: [
          { id: chatIdOrSourceId },
          { sourceId: chatIdOrSourceId },
        ],
      },
    });

    if (!chat) {
      throw new NotFoundException('Chat not found');
    }

    const where: any = {
      chatId: chat.id,
      organisationId,
      isDeleted: false,
    };

    if (queryDto.type) {
      where.type = queryDto.type;
    }

    if (queryDto.role) {
      where.role = queryDto.role;
    }

    if (queryDto.search) {
      where.content = { contains: queryDto.search, mode: 'insensitive' };
    }

    const limit = queryDto.limit || 50;
    const offset = queryDto.offset || 0;
    const sortOrder = queryDto.sortOrder || 'asc';

    // Get total count
    const total = await this.prisma.chatMessage.count({ where });

    // Get paginated records
    const messages = await this.prisma.chatMessage.findMany({
      where,
      include: {
        attachments: {
          where: { isDeleted: false },
        },
      },
      orderBy: {
        createdAt: sortOrder,
      },
      take: limit,
      skip: offset,
    });

    return {
      data: messages.map((message) => new ChatMessageEntity(message)),
      total,
      limit,
      offset,
    };
  }

  async findOne(
    organisationId: string,
    chatIdOrSourceId: string,
    id: string,
  ): Promise<ChatMessageEntity> {
    // First find the chat to get its actual id
    const chat = await this.prisma.chat.findFirst({
      where: {
        organisationId,
        isDeleted: false,
        OR: [
          { id: chatIdOrSourceId },
          { sourceId: chatIdOrSourceId },
        ],
      },
    });

    if (!chat) {
      throw new NotFoundException('Chat not found');
    }

    const message = await this.prisma.chatMessage.findFirst({
      where: {
        id,
        chatId: chat.id,
        organisationId,
        isDeleted: false,
      },
      include: {
        attachments: {
          where: { isDeleted: false },
        },
      },
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    return new ChatMessageEntity(message);
  }

  async update(
    organisationId: string,
    chatIdOrSourceId: string,
    id: string,
    updateChatMessageDto: UpdateChatMessageDto,
  ): Promise<ChatMessageEntity> {
    // First find the chat to get its actual id
    const chat = await this.prisma.chat.findFirst({
      where: {
        organisationId,
        isDeleted: false,
        OR: [
          { id: chatIdOrSourceId },
          { sourceId: chatIdOrSourceId },
        ],
      },
    });

    if (!chat) {
      throw new NotFoundException('Chat not found');
    }

    // Verify message exists
    const existingMessage = await this.prisma.chatMessage.findFirst({
      where: {
        id,
        chatId: chat.id,
        organisationId,
        isDeleted: false,
      },
    });

    if (!existingMessage) {
      throw new NotFoundException('Message not found');
    }

    // Extract attachments from DTO
    const { attachments, ...messageData } = updateChatMessageDto;

    const message = await this.prisma.chatMessage.update({
      where: { id },
      data: messageData,
      include: {
        attachments: {
          where: { isDeleted: false },
        },
      },
    });

    return new ChatMessageEntity(message);
  }

  async remove(
    organisationId: string,
    chatIdOrSourceId: string,
    id: string,
  ): Promise<void> {
    // First find the chat to get its actual id
    const chat = await this.prisma.chat.findFirst({
      where: {
        organisationId,
        isDeleted: false,
        OR: [
          { id: chatIdOrSourceId },
          { sourceId: chatIdOrSourceId },
        ],
      },
    });

    if (!chat) {
      throw new NotFoundException('Chat not found');
    }

    // Verify message exists
    const message = await this.prisma.chatMessage.findFirst({
      where: {
        id,
        chatId: chat.id,
        organisationId,
        isDeleted: false,
      },
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    // Soft delete message and its attachments
    await this.prisma.$transaction([
      this.prisma.chatMessage.update({
        where: { id },
        data: { isDeleted: true },
      }),
      this.prisma.messageAttachment.updateMany({
        where: { messageId: id },
        data: { isDeleted: true },
      }),
    ]);
  }
}

