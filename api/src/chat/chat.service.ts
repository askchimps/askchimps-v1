import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { UpdateChatDto } from './dto/update-chat.dto';
import { CheckInstagramMessageDto } from './dto/check-instagram-message.dto';
import { ChatEntity } from './entities/chat.entity';
import { CHAT_STATUS } from '@prisma/client';

@Injectable()
export class ChatService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Helper method to find chat by either id or sourceId
   * Automatically detects which identifier is being used
   */
  private async findChatByIdOrSourceId(
    organisationId: string,
    identifier: string,
  ) {
    return this.prisma.chat.findFirst({
      where: {
        organisationId,
        isDeleted: false,
        OR: [{ id: identifier }, { sourceId: identifier }],
      },
    });
  }

  async create(
    organisationId: string,
    createChatDto: CreateChatDto,
  ): Promise<ChatEntity> {
    // Verify organisation exists
    const organisation = await this.prisma.organisation.findUnique({
      where: { id: organisationId, isDeleted: false },
    });

    if (!organisation) {
      throw new NotFoundException('Organisation not found');
    }

    // Verify all agents exist and belong to organisation
    if (createChatDto.agentIds && createChatDto.agentIds.length > 0) {
      const agents = await this.prisma.agent.findMany({
        where: {
          id: { in: createChatDto.agentIds },
          organisationId,
          isDeleted: false,
        },
      });

      if (agents.length !== createChatDto.agentIds.length) {
        throw new NotFoundException(
          'One or more agents not found or do not belong to this organisation',
        );
      }
    }

    // If leadId provided, verify it exists and belongs to organisation
    if (createChatDto.leadId) {
      const lead = await this.prisma.lead.findFirst({
        where: {
          id: createChatDto.leadId,
          organisationId,
          isDeleted: false,
        },
      });

      if (!lead) {
        throw new BadRequestException(
          'Lead not found or does not belong to this organisation',
        );
      }
    }

    // Check for duplicate sourceId in organisation
    const existingChat = await this.prisma.chat.findFirst({
      where: {
        organisationId,
        sourceId: createChatDto.sourceId,
        source: createChatDto.source,
        isDeleted: false,
      },
    });

    if (existingChat) {
      throw new BadRequestException(
        `Chat with source ${createChatDto.source} and sourceId ${createChatDto.sourceId} already exists`,
      );
    }

    // Verify tags exist and belong to organisation if provided
    if (createChatDto.tagIds && createChatDto.tagIds.length > 0) {
      const tags = await this.prisma.tag.findMany({
        where: {
          id: { in: createChatDto.tagIds },
          organisationId,
          isDeleted: false,
        },
      });

      if (tags.length !== createChatDto.tagIds.length) {
        throw new NotFoundException(
          'One or more tags not found or do not belong to this organisation',
        );
      }
    }

    const { tagIds, agentIds, ...chatData } = createChatDto;

    const chat = await this.prisma.chat.create({
      data: {
        ...chatData,
        organisationId,
        status: chatData.status || CHAT_STATUS.NEW,
        ...(agentIds && agentIds.length > 0
          ? {
              agents: {
                create: agentIds.map((agentId) => ({
                  agentId,
                  isActive: true,
                })),
              },
            }
          : {}),
        ...(tagIds && tagIds.length > 0
          ? {
              tags: {
                connect: tagIds.map((id) => ({ id })),
              },
            }
          : {}),
      },
      include: {
        lead: true,
        tags: true,
        agents: {
          where: { isDeleted: false },
          include: {
            agent: {
              select: {
                id: true,
                name: true,
                type: true,
                role: true,
                workflowId: true,
              },
            },
          },
        },
      },
    });

    return new ChatEntity(chat);
  }

  async findAll(organisationId: string): Promise<ChatEntity[]> {
    const chats = await this.prisma.chat.findMany({
      where: {
        organisationId,
        isDeleted: false,
      },
      include: {
        lead: true,
        agents: {
          where: { isDeleted: false },
          include: {
            agent: {
              select: {
                id: true,
                name: true,
                type: true,
                role: true,
                workflowId: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return chats.map((chat) => new ChatEntity(chat));
  }

  async findOne(
    organisationId: string,
    idOrSourceId: string,
  ): Promise<ChatEntity> {
    const chat = await this.prisma.chat.findFirst({
      where: {
        organisationId,
        isDeleted: false,
        OR: [{ id: idOrSourceId }, { sourceId: idOrSourceId }],
      },
      include: {
        lead: true,
        agents: {
          where: { isDeleted: false },
          include: {
            agent: {
              select: {
                id: true,
                name: true,
                type: true,
                role: true,
                workflowId: true,
              },
            },
          },
        },
        messages: {
          where: { isDeleted: false },
          orderBy: { createdAt: 'asc' },
          include: {
            attachments: {
              where: { isDeleted: false },
            },
          },
        },
      },
    });

    if (!chat) {
      throw new NotFoundException('Chat not found');
    }

    return new ChatEntity(chat);
  }

  async update(
    organisationId: string,
    idOrSourceId: string,
    updateChatDto: UpdateChatDto,
  ): Promise<ChatEntity> {
    // Verify chat exists and belongs to organisation
    const existingChat = await this.prisma.chat.findFirst({
      where: {
        organisationId,
        isDeleted: false,
        OR: [{ id: idOrSourceId }, { sourceId: idOrSourceId }],
      },
    });

    if (!existingChat) {
      throw new NotFoundException('Chat not found');
    }

    // If updating leadId, verify it exists and belongs to organisation
    if (updateChatDto.leadId) {
      const lead = await this.prisma.lead.findFirst({
        where: {
          id: updateChatDto.leadId,
          organisationId,
          isDeleted: false,
        },
      });

      if (!lead) {
        throw new BadRequestException(
          'Lead not found or does not belong to this organisation',
        );
      }
    }

    // Verify agents exist and belong to organisation if provided
    if (updateChatDto.agentIds && updateChatDto.agentIds.length > 0) {
      const agents = await this.prisma.agent.findMany({
        where: {
          id: { in: updateChatDto.agentIds },
          organisationId,
          isDeleted: false,
        },
      });

      if (agents.length !== updateChatDto.agentIds.length) {
        throw new NotFoundException(
          'One or more agents not found or do not belong to this organisation',
        );
      }
    }

    // Verify tags exist and belong to organisation if provided
    if (updateChatDto.tagIds && updateChatDto.tagIds.length > 0) {
      const tags = await this.prisma.tag.findMany({
        where: {
          id: { in: updateChatDto.tagIds },
          organisationId,
          isDeleted: false,
        },
      });

      if (tags.length !== updateChatDto.tagIds.length) {
        throw new NotFoundException(
          'One or more tags not found or do not belong to this organisation',
        );
      }
    }

    const { tagIds, agentIds, ...chatData } = updateChatDto;

    const chat = await this.prisma.chat.update({
      where: { id: existingChat.id },
      data: {
        ...chatData,
        ...(agentIds !== undefined
          ? {
              agents: {
                deleteMany: { chatId: existingChat.id },
                create: agentIds.map((agentId) => ({
                  agentId,
                  isActive: true,
                })),
              },
            }
          : {}),
        ...(tagIds !== undefined
          ? {
              tags: {
                set: tagIds.map((id) => ({ id })),
              },
            }
          : {}),
      },
      include: {
        lead: true,
        tags: true,
        agents: {
          where: { isDeleted: false },
          include: {
            agent: {
              select: {
                id: true,
                name: true,
                type: true,
                role: true,
                workflowId: true,
              },
            },
          },
        },
      },
    });

    return new ChatEntity(chat);
  }

  async remove(organisationId: string, idOrSourceId: string): Promise<void> {
    // Verify chat exists and belongs to organisation
    const chat = await this.prisma.chat.findFirst({
      where: {
        organisationId,
        isDeleted: false,
        OR: [{ id: idOrSourceId }, { sourceId: idOrSourceId }],
      },
    });

    if (!chat) {
      throw new NotFoundException('Chat not found');
    }

    // Soft delete
    await this.prisma.chat.update({
      where: { id: chat.id },
      data: { isDeleted: true },
    });
  }

  async findByLead(
    organisationId: string,
    leadId: string,
  ): Promise<ChatEntity[]> {
    const chats = await this.prisma.chat.findMany({
      where: {
        organisationId,
        leadId,
        isDeleted: false,
      },
      include: {
        lead: true,
        agents: {
          where: { isDeleted: false },
          include: {
            agent: {
              select: {
                id: true,
                name: true,
                type: true,
                role: true,
                workflowId: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return chats.map((chat) => new ChatEntity(chat));
  }

  async findBySource(
    organisationId: string,
    source: string,
    sourceId: string,
  ): Promise<ChatEntity | null> {
    const chat = await this.prisma.chat.findFirst({
      where: {
        organisationId,
        source: source as any,
        sourceId,
        isDeleted: false,
      },
      include: {
        lead: true,
        agents: {
          where: { isDeleted: false },
          include: {
            agent: {
              select: {
                id: true,
                name: true,
                type: true,
                role: true,
                workflowId: true,
              },
            },
          },
        },
      },
    });

    return chat ? new ChatEntity(chat) : null;
  }

  async updateStatus(
    organisationId: string,
    idOrSourceId: string,
    status: CHAT_STATUS,
  ): Promise<ChatEntity> {
    const chat = await this.prisma.chat.findFirst({
      where: {
        organisationId,
        isDeleted: false,
        OR: [{ id: idOrSourceId }, { sourceId: idOrSourceId }],
      },
    });

    if (!chat) {
      throw new NotFoundException('Chat not found');
    }

    const updatedChat = await this.prisma.chat.update({
      where: { id: chat.id },
      data: { status },
      include: {
        lead: true,
        agents: {
          where: { isDeleted: false },
          include: {
            agent: {
              select: {
                id: true,
                name: true,
                type: true,
                role: true,
                workflowId: true,
              },
            },
          },
        },
      },
    });

    return new ChatEntity(updatedChat);
  }

  /**
   * Check if Instagram message exists in cache, create if not
   * @param checkInstagramMessageDto - DTO containing messageId
   * @returns Object with exists flag and appropriate message
   * @throws ConflictException if message already exists
   */
  async checkInstagramMessage(
    checkInstagramMessageDto: CheckInstagramMessageDto,
  ): Promise<{ exists: boolean; message: string }> {
    const { messageId } = checkInstagramMessageDto;

    // Check if message already exists
    const existingMessage = await this.prisma.instagramMessageCache.findUnique({
      where: { messageId },
    });

    if (existingMessage) {
      throw new ConflictException('Instagram message already processed');
    }

    // Create new cache entry
    await this.prisma.instagramMessageCache.create({
      data: { messageId },
    });

    return {
      exists: false,
      message: 'Instagram message cached successfully',
    };
  }
}
