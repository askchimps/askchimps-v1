import {
    Injectable,
    NotFoundException,
    ForbiddenException,
    BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateChatFollowUpScheduleDto } from './dto/create-chat-follow-up-schedule.dto';
import { UpdateChatFollowUpScheduleDto } from './dto/update-chat-follow-up-schedule.dto';

@Injectable()
export class ChatFollowUpScheduleService {
    constructor(private readonly prisma: PrismaService) {}

    async create(
        createDto: CreateChatFollowUpScheduleDto,
        userId: string,
        isSuperAdmin: boolean,
    ) {
        // Verify chat exists and get organisation
        const chat = await this.prisma.chat.findFirst({
            where: {
                id: createDto.chatId,
                isDeleted: false,
            },
            select: {
                id: true,
                organisationId: true,
            },
        });

        if (!chat) {
            throw new NotFoundException('Chat not found');
        }

        // Check if user has access to organisation
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

        // Verify follow-up message exists and belongs to same organisation
        const followUpMessage =
            await this.prisma.chatFollowUpMessages.findFirst({
                where: {
                    id: createDto.followUpMessageId,
                    organisationId: chat.organisationId,
                    isDeleted: false,
                },
            });

        if (!followUpMessage) {
            throw new NotFoundException(
                'Follow-up message not found or does not belong to this organisation',
            );
        }

        // Validate scheduledAt is in the future
        const scheduledDate = new Date(createDto.scheduledAt);
        if (scheduledDate <= new Date()) {
            throw new BadRequestException(
                'Scheduled time must be in the future',
            );
        }

        return this.prisma.chatFollowUpSchedule.create({
            data: {
                chatId: createDto.chatId,
                followUpMessageId: createDto.followUpMessageId,
                scheduledAt: scheduledDate,
                isSent: createDto.isSent ?? false,
                sentAt: createDto.sentAt ? new Date(createDto.sentAt) : null,
            },
            include: {
                chat: {
                    select: {
                        id: true,
                        organisationId: true,
                    },
                },
                followUpMessage: {
                    select: {
                        id: true,
                        slug: true,
                        content: true,
                    },
                },
            },
        });
    }

    async findAll(
        organisationId: string,
        userId: string,
        isSuperAdmin: boolean,
        chatId?: string,
        scheduledFrom?: Date,
        scheduledTo?: Date,
        isSent?: boolean,
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

        const where: any = {
            isDeleted: false,
            chat: {
                organisationId,
                isDeleted: false,
            },
        };

        if (chatId) {
            where.chatId = chatId;
        }

        // Add time range filters for scheduledAt
        if (scheduledFrom || scheduledTo) {
            where.scheduledAt = {};

            if (scheduledFrom) {
                where.scheduledAt.gte = scheduledFrom;
            }

            if (scheduledTo) {
                where.scheduledAt.lte = scheduledTo;
            }
        }

        // Add isSent filter if provided
        if (isSent !== undefined) {
            where.isSent = isSent;
        }

        const result = this.prisma.chatFollowUpSchedule.findMany({
            where,
            include: {
                chat: {
                    select: {
                        id: true,
                        organisationId: true,
                        source: true,
                        sourceId: true,
                    },
                },
                followUpMessage: {
                    select: {
                        id: true,
                        slug: true,
                        content: true,
                        sequence: true,
                    },
                },
            },
            orderBy: {
                scheduledAt: 'asc',
            },
        });

        return result;
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

        const schedule = await this.prisma.chatFollowUpSchedule.findFirst({
            where: {
                id,
                isDeleted: false,
                chat: {
                    organisationId,
                    isDeleted: false,
                },
            },
            include: {
                chat: {
                    select: {
                        id: true,
                        organisationId: true,
                    },
                },
                followUpMessage: {
                    select: {
                        id: true,
                        slug: true,
                        content: true,
                    },
                },
            },
        });

        if (!schedule) {
            throw new NotFoundException('Follow-up schedule not found');
        }

        return schedule;
    }

    async update(
        id: string,
        organisationId: string,
        updateDto: UpdateChatFollowUpScheduleDto,
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

        // Check if schedule exists
        const schedule = await this.prisma.chatFollowUpSchedule.findFirst({
            where: {
                id,
                isDeleted: false,
                chat: {
                    organisationId,
                    isDeleted: false,
                },
            },
            include: {
                chat: true,
            },
        });

        if (!schedule) {
            throw new NotFoundException('Follow-up schedule not found');
        }

        // If updating follow-up message, verify it exists and belongs to same organisation
        if (updateDto.followUpMessageId) {
            const followUpMessage =
                await this.prisma.chatFollowUpMessages.findFirst({
                    where: {
                        id: updateDto.followUpMessageId,
                        organisationId: schedule.chat.organisationId,
                        isDeleted: false,
                    },
                });

            if (!followUpMessage) {
                throw new NotFoundException(
                    'Follow-up message not found or does not belong to this organisation',
                );
            }
        }

        // Validate scheduledAt is in the future if being updated
        if (updateDto.scheduledAt) {
            const scheduledDate = new Date(updateDto.scheduledAt);
            if (scheduledDate <= new Date()) {
                throw new BadRequestException(
                    'Scheduled time must be in the future',
                );
            }
        }

        const updateData: any = {};
        if (updateDto.chatId) updateData.chatId = updateDto.chatId;
        if (updateDto.followUpMessageId)
            updateData.followUpMessageId = updateDto.followUpMessageId;
        if (updateDto.scheduledAt)
            updateData.scheduledAt = new Date(updateDto.scheduledAt);
        if (updateDto.isSent !== undefined)
            updateData.isSent = updateDto.isSent;
        if (updateDto.sentAt) updateData.sentAt = new Date(updateDto.sentAt);

        const updatedSchedule = this.prisma.chatFollowUpSchedule.update({
            where: { id },
            data: updateData,
            include: {
                chat: {
                    select: {
                        id: true,
                        organisationId: true,
                    },
                },
                followUpMessage: {
                    select: {
                        id: true,
                        slug: true,
                        content: true,
                    },
                },
            },
        });

        return updatedSchedule;
    }

    async remove(
        id: string,
        organisationId: string,
        userId: string,
        isSuperAdmin: boolean,
        hardDelete: boolean = false,
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

        // Check if schedule exists
        const schedule = await this.prisma.chatFollowUpSchedule.findFirst({
            where: {
                id,
                isDeleted: false,
                chat: {
                    organisationId,
                    isDeleted: false,
                },
            },
        });

        if (!schedule) {
            throw new NotFoundException('Follow-up schedule not found');
        }

        // Hard delete - permanently remove from database
        if (hardDelete) {
            return this.prisma.chatFollowUpSchedule.delete({
                where: { id },
            });
        }

        // Soft delete - mark as deleted
        return this.prisma.chatFollowUpSchedule.update({
            where: { id },
            data: { isDeleted: true },
            include: {
                chat: {
                    select: {
                        id: true,
                        organisationId: true,
                    },
                },
                followUpMessage: {
                    select: {
                        id: true,
                        slug: true,
                        content: true,
                    },
                },
            },
        });
    }
}
