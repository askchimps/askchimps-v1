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
import { QueryChatDto } from './dto/query-chat.dto';
import { CheckInstagramMessageDto } from './dto/check-instagram-message.dto';
import { ChatEntity } from './entities/chat.entity';
import { CHAT_STATUS } from '@prisma/client';
import type { PaginatedResponse } from '../common/dto/pagination-query.dto';

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

        // Verify agent exists and belongs to organisation
        const agent = await this.prisma.agent.findUnique({
            where: { id: createChatDto.agentId },
        });

        if (
            !agent ||
            agent.isDeleted ||
            agent.organisationId !== organisationId
        ) {
            throw new NotFoundException('Agent not found');
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

        const { tagIds, ...chatData } = createChatDto;

        const chat = await this.prisma.chat.create({
            data: {
                ...chatData,
                organisationId,
                status: chatData.status || CHAT_STATUS.NEW,
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
            },
        });

        return new ChatEntity(chat);
    }

    async findAll(
        organisationId: string,
        userId: string,
        isSuperAdmin: boolean,
        queryDto: QueryChatDto,
    ): Promise<PaginatedResponse<ChatEntity>> {
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
                throw new ForbiddenException(
                    'You do not have access to this organisation',
                );
            }
        }

        const where: any = {
            organisationId,
            isDeleted: false,
        };

        if (queryDto.status) {
            where.status = queryDto.status;
        }

        if (queryDto.source) {
            where.source = queryDto.source;
        }

        if (queryDto.agentId) {
            // Verify agent belongs to organisation
            const agent = await this.prisma.agent.findUnique({
                where: { id: queryDto.agentId },
            });

            if (
                !agent ||
                agent.isDeleted ||
                agent.organisationId !== organisationId
            ) {
                throw new NotFoundException('Agent not found');
            }

            where.agentId = queryDto.agentId;
        }

        if (queryDto.leadId) {
            // Verify lead belongs to organisation
            const lead = await this.prisma.lead.findUnique({
                where: { id: queryDto.leadId },
            });

            if (
                !lead ||
                lead.isDeleted ||
                lead.organisationId !== organisationId
            ) {
                throw new NotFoundException('Lead not found');
            }

            where.leadId = queryDto.leadId;
        }

        if (queryDto.search) {
            // Search by chat name, lead name (firstName + lastName), or phone number
            where.OR = [
                { name: { contains: queryDto.search, mode: 'insensitive' } },
                {
                    lead: {
                        firstName: {
                            contains: queryDto.search,
                            mode: 'insensitive',
                        },
                    },
                },
                {
                    lead: {
                        lastName: {
                            contains: queryDto.search,
                            mode: 'insensitive',
                        },
                    },
                },
                {
                    lead: {
                        phone: {
                            contains: queryDto.search,
                            mode: 'insensitive',
                        },
                    },
                },
            ];
        }

        const limit = queryDto.limit || 50;
        const offset = queryDto.offset || 0;
        const sortOrder = queryDto.sortOrder || 'desc';

        // Get total count
        const total = await this.prisma.chat.count({ where });

        // Get paginated records with lead data
        const chats = await this.prisma.chat.findMany({
            where,
            include: {
                lead: true,
            },
            orderBy: { createdAt: sortOrder },
            take: limit,
            skip: offset,
        });

        return {
            data: chats.map((chat) => new ChatEntity(chat)),
            total,
            limit,
            offset,
        };
    }

    async findOne(
        organisationId: string,
        idOrSourceId: string,
        userId: string,
        isSuperAdmin: boolean,
        includeMessages: boolean = false,
    ): Promise<ChatEntity> {
        // Build include object
        const includeObj: any = {
            lead: true,
        };

        if (includeMessages) {
            includeObj.messages = {
                where: { isDeleted: false },
                orderBy: { createdAt: 'asc' },
                include: {
                    attachments: {
                        where: { isDeleted: false },
                    },
                },
            };
        }

        const chat = await this.prisma.chat.findFirst({
            where: {
                organisationId,
                isDeleted: false,
                OR: [{ id: idOrSourceId }, { sourceId: idOrSourceId }],
            },
            include: includeObj,
        });

        if (!chat) {
            throw new NotFoundException('Chat not found');
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

        const { tagIds, ...chatData } = updateChatDto;

        const chat = await this.prisma.chat.update({
            where: { id: existingChat.id },
            data: {
                ...chatData,
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
        const existingMessage =
            await this.prisma.instagramMessageCache.findUnique({
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
