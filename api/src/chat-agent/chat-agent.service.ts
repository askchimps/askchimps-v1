import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateChatAgentDto } from './dto/create-chat-agent.dto';
import { UpdateChatAgentDto } from './dto/update-chat-agent.dto';
import { QueryChatAgentDto } from './dto/query-chat-agent.dto';
import { ChatAgentEntity } from '../chat/entities/chat-agent.entity';

@Injectable()
export class ChatAgentService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    createChatAgentDto: CreateChatAgentDto,
    userId: string,
    isSuperAdmin: boolean,
  ): Promise<ChatAgentEntity> {
    // Verify chat exists
    const chat = await this.prisma.chat.findUnique({
      where: { id: createChatAgentDto.chatId },
      include: { organisation: true },
    });

    if (!chat || chat.isDeleted) {
      throw new NotFoundException('Chat not found');
    }

    // Check user has access to organisation
    if (!isSuperAdmin) {
      const userOrg = await this.prisma.userOrganisation.findFirst({
        where: {
          userId,
          organisationId: chat.organisationId,
          isDeleted: false,
        },
      });

      if (!userOrg) {
        throw new ForbiddenException(
          'You do not have access to this organisation',
        );
      }
    }

    // Verify agent exists and belongs to same organisation
    const agent = await this.prisma.agent.findUnique({
      where: { id: createChatAgentDto.agentId },
    });

    if (
      !agent ||
      agent.isDeleted ||
      agent.organisationId !== chat.organisationId
    ) {
      throw new NotFoundException(
        'Agent not found or does not belong to this organisation',
      );
    }

    // Check if this chat-agent relationship already exists
    const existing = await this.prisma.chatAgent.findFirst({
      where: {
        chatId: createChatAgentDto.chatId,
        agentId: createChatAgentDto.agentId,
        isDeleted: false,
      },
    });

    if (existing) {
      throw new ConflictException(
        'This agent is already assigned to this chat',
      );
    }

    const chatAgent = await this.prisma.chatAgent.create({
      data: {
        chatId: createChatAgentDto.chatId,
        agentId: createChatAgentDto.agentId,
        isActive: createChatAgentDto.isActive ?? true,
      },
      include: {
        agent: {
          select: { id: true, name: true, type: true, role: true, workflowId: true },
        },
        chat: {
          select: { id: true, name: true, source: true },
        },
      },
    });

    return new ChatAgentEntity(chatAgent);
  }

  async findAll(queryDto: QueryChatAgentDto): Promise<ChatAgentEntity[]> {
    const where: any = {
      isDeleted: false,
    };

    if (queryDto.chatId) {
      where.chatId = queryDto.chatId;
    }

    if (queryDto.agentId) {
      where.agentId = queryDto.agentId;
    }

    if (queryDto.isActive !== undefined) {
      where.isActive = queryDto.isActive;
    }

    const chatAgents = await this.prisma.chatAgent.findMany({
      where,
      include: {
        agent: {
          select: { id: true, name: true, type: true, role: true, workflowId: true },
        },
        chat: {
          select: { id: true, name: true, source: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return chatAgents.map((ca) => new ChatAgentEntity(ca));
  }

  async findOne(id: string): Promise<ChatAgentEntity> {
    const chatAgent = await this.prisma.chatAgent.findUnique({
      where: { id },
      include: {
        agent: {
          select: { id: true, name: true, type: true, role: true, workflowId: true },
        },
        chat: {
          select: { id: true, name: true, source: true },
        },
      },
    });

    if (!chatAgent || chatAgent.isDeleted) {
      throw new NotFoundException('Chat-Agent relationship not found');
    }

    return new ChatAgentEntity(chatAgent);
  }

  async update(
    id: string,
    updateChatAgentDto: UpdateChatAgentDto,
    userId: string,
    isSuperAdmin: boolean,
  ): Promise<ChatAgentEntity> {
    const chatAgent = await this.prisma.chatAgent.findUnique({
      where: { id },
      include: { chat: { include: { organisation: true } } },
    });

    if (!chatAgent || chatAgent.isDeleted) {
      throw new NotFoundException('Chat-Agent relationship not found');
    }

    // Check user has access to organisation
    if (!isSuperAdmin) {
      const userOrg = await this.prisma.userOrganisation.findFirst({
        where: {
          userId,
          organisationId: chatAgent.chat.organisationId,
          isDeleted: false,
        },
      });

      if (!userOrg) {
        throw new ForbiddenException(
          'You do not have access to this organisation',
        );
      }
    }

    const updated = await this.prisma.chatAgent.update({
      where: { id },
      data: updateChatAgentDto,
      include: {
        agent: {
          select: { id: true, name: true, type: true, role: true, workflowId: true },
        },
        chat: {
          select: { id: true, name: true, source: true },
        },
      },
    });

    return new ChatAgentEntity(updated);
  }

  async remove(
    id: string,
    userId: string,
    isSuperAdmin: boolean,
  ): Promise<ChatAgentEntity> {
    const chatAgent = await this.prisma.chatAgent.findUnique({
      where: { id },
      include: { chat: { include: { organisation: true } } },
    });

    if (!chatAgent || chatAgent.isDeleted) {
      throw new NotFoundException('Chat-Agent relationship not found');
    }

    // Check user has access to organisation
    if (!isSuperAdmin) {
      const userOrg = await this.prisma.userOrganisation.findFirst({
        where: {
          userId,
          organisationId: chatAgent.chat.organisationId,
          isDeleted: false,
        },
      });

      if (!userOrg) {
        throw new ForbiddenException(
          'You do not have access to this organisation',
        );
      }
    }

    const deleted = await this.prisma.chatAgent.update({
      where: { id },
      data: { isDeleted: true },
      include: {
        agent: {
          select: { id: true, name: true, type: true, role: true, workflowId: true },
        },
        chat: {
          select: { id: true, name: true, source: true },
        },
      },
    });

    return new ChatAgentEntity(deleted);
  }
}

