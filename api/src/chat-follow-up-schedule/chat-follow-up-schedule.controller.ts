import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards,
    Query,
} from '@nestjs/common';
import {
    ApiTags,
    ApiBearerAuth,
    ApiOperation,
    ApiParam,
    ApiResponse,
    ApiBody,
    ApiQuery,
} from '@nestjs/swagger';
import { ChatFollowUpScheduleService } from './chat-follow-up-schedule.service';
import { CreateChatFollowUpScheduleDto } from './dto/create-chat-follow-up-schedule.dto';
import { UpdateChatFollowUpScheduleDto } from './dto/update-chat-follow-up-schedule.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RbacGuard } from '../common/guards/rbac.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Role } from '../common/enums';
import type { UserPayload } from '../common/interfaces/request-with-user.interface';

@ApiTags('Chat Follow-Up Schedules')
@ApiBearerAuth('JWT-auth')
@Controller({
    path: 'organisation/:organisationId/chat-follow-up-schedule',
    version: '1',
})
@UseGuards(JwtAuthGuard)
export class ChatFollowUpScheduleController {
    constructor(private readonly service: ChatFollowUpScheduleService) {}

    @Post()
    @UseGuards(RbacGuard)
    @Roles(Role.OWNER, Role.ADMIN, Role.MEMBER)
    @ApiOperation({
        summary: 'Schedule a follow-up message for a chat',
        description:
            'Create a schedule to send a follow-up message to a chat at a specific time. The scheduled time must be in the future.',
    })
    @ApiParam({
        name: 'organisationId',
        description: 'Organisation ID (ULID format)',
        example: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
    })
    @ApiBody({
        type: CreateChatFollowUpScheduleDto,
        description: 'Follow-up schedule data',
        examples: {
            'Payment Reminder': {
                value: {
                    chatId: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
                    followUpMessageId: '01HZXYZ1234567890ABCDEFGHJK',
                    scheduledAt: '2024-01-20T14:30:00.000Z',
                    isSent: false,
                },
            },
            'Order Status Check': {
                value: {
                    chatId: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
                    followUpMessageId: '01HZXYZ1234567890ABCDEFGHJL',
                    scheduledAt: '2024-01-22T10:00:00.000Z',
                },
            },
        },
    })
    @ApiResponse({
        status: 201,
        description: 'Follow-up schedule created successfully',
        schema: {
            example: {
                data: {
                    id: '01HZXYZ1234567890ABCDEFGHJM',
                    chatId: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
                    followUpMessageId: '01HZXYZ1234567890ABCDEFGHJK',
                    scheduledAt: '2024-01-20T14:30:00.000Z',
                    isSent: false,
                    sentAt: null,
                    isDeleted: false,
                    createdAt: '2024-01-15T10:30:00.000Z',
                    updatedAt: '2024-01-15T10:30:00.000Z',
                    chat: {
                        id: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
                        organisationId: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
                    },
                    followUpMessage: {
                        id: '01HZXYZ1234567890ABCDEFGHJK',
                        slug: 'payment-reminder',
                        content: 'Hi! Just following up on your payment.',
                    },
                },
                statusCode: 201,
                timestamp: '2024-01-15T10:30:00.000Z',
            },
        },
    })
    @ApiResponse({
        status: 400,
        description:
            'Invalid input data or scheduled time is not in the future',
    })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({
        status: 403,
        description: 'Forbidden - Insufficient permissions',
    })
    @ApiResponse({
        status: 404,
        description: 'Chat or follow-up message not found',
    })
    create(
        @Param('organisationId') organisationId: string,
        @Body() createDto: CreateChatFollowUpScheduleDto,
        @CurrentUser() user: UserPayload,
    ) {
        return this.service.create(createDto, user.sub, user.isSuperAdmin);
    }

    @Get()
    @UseGuards(RbacGuard)
    @Roles(Role.OWNER, Role.ADMIN, Role.MEMBER)
    @ApiOperation({
        summary: 'Get all follow-up schedules',
        description:
            'Retrieve all follow-up schedules for an organisation. Optionally filter by chat ID, time range, and/or sent status. Schedules are sorted by scheduled time (ascending).',
    })
    @ApiParam({
        name: 'organisationId',
        description: 'Organisation ID (ULID format)',
        example: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
    })
    @ApiQuery({
        name: 'chatId',
        description: 'Optional: Filter by chat ID (ULID format)',
        required: false,
        example: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
    })
    @ApiQuery({
        name: 'scheduledFrom',
        description:
            'Optional: Filter schedules from this date/time (ISO 8601 format). Inclusive.',
        required: false,
        type: String,
        example: '2024-01-20T00:00:00.000Z',
    })
    @ApiQuery({
        name: 'scheduledTo',
        description:
            'Optional: Filter schedules up to this date/time (ISO 8601 format). Inclusive.',
        required: false,
        type: String,
        example: '2024-01-31T23:59:59.999Z',
    })
    @ApiQuery({
        name: 'isSent',
        description:
            'Optional: Filter by sent status. Use "true" for sent schedules, "false" for pending schedules.',
        required: false,
        type: String,
        enum: ['true', 'false'],
        example: 'false',
    })
    @ApiResponse({
        status: 200,
        description: 'Follow-up schedules retrieved successfully',
        schema: {
            example: {
                data: [
                    {
                        id: '01HZXYZ1234567890ABCDEFGHJM',
                        chatId: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
                        followUpMessageId: '01HZXYZ1234567890ABCDEFGHJK',
                        scheduledAt: '2024-01-20T14:30:00.000Z',
                        isSent: false,
                        sentAt: null,
                        isDeleted: false,
                        createdAt: '2024-01-15T10:30:00.000Z',
                        updatedAt: '2024-01-15T10:30:00.000Z',
                        chat: {
                            id: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
                            organisationId: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
                        },
                        followUpMessage: {
                            id: '01HZXYZ1234567890ABCDEFGHJK',
                            slug: 'payment-reminder',
                            content: 'Hi! Just following up on your payment.',
                        },
                    },
                ],
                statusCode: 200,
                timestamp: '2024-01-15T10:30:00.000Z',
            },
        },
    })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({
        status: 403,
        description: 'Forbidden - Insufficient permissions',
    })
    @ApiResponse({
        status: 400,
        description: 'Invalid date format for scheduledFrom or scheduledTo',
    })
    findAll(
        @Param('organisationId') organisationId: string,
        @Query('chatId') chatId: string | undefined,
        @Query('scheduledFrom') scheduledFrom: string | undefined,
        @Query('scheduledTo') scheduledTo: string | undefined,
        @Query('isSent') isSent: string | undefined,
        @CurrentUser() user: UserPayload,
    ) {
        // Parse dates if provided
        const scheduledFromDate = scheduledFrom
            ? new Date(scheduledFrom)
            : undefined;
        const scheduledToDate = scheduledTo ? new Date(scheduledTo) : undefined;

        // Parse isSent boolean if provided
        const isSentBoolean =
            isSent !== undefined ? isSent === 'true' : undefined;

        return this.service.findAll(
            organisationId,
            user.sub,
            user.isSuperAdmin,
            chatId,
            scheduledFromDate,
            scheduledToDate,
            isSentBoolean,
        );
    }

    @Get(':id')
    @UseGuards(RbacGuard)
    @Roles(Role.OWNER, Role.ADMIN, Role.MEMBER)
    @ApiOperation({
        summary: 'Get follow-up schedule by ID',
        description: 'Retrieve a specific follow-up schedule by its ID.',
    })
    @ApiParam({
        name: 'organisationId',
        description: 'Organisation ID (ULID format)',
        example: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
    })
    @ApiParam({
        name: 'id',
        description: 'Schedule ID (ULID format)',
        example: '01HZXYZ1234567890ABCDEFGHJM',
    })
    @ApiResponse({
        status: 200,
        description: 'Follow-up schedule retrieved successfully',
        schema: {
            example: {
                data: {
                    id: '01HZXYZ1234567890ABCDEFGHJM',
                    chatId: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
                    followUpMessageId: '01HZXYZ1234567890ABCDEFGHJK',
                    scheduledAt: '2024-01-20T14:30:00.000Z',
                    isSent: false,
                    sentAt: null,
                    isDeleted: false,
                    createdAt: '2024-01-15T10:30:00.000Z',
                    updatedAt: '2024-01-15T10:30:00.000Z',
                    chat: {
                        id: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
                        organisationId: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
                    },
                    followUpMessage: {
                        id: '01HZXYZ1234567890ABCDEFGHJK',
                        slug: 'payment-reminder',
                        content: 'Hi! Just following up on your payment.',
                    },
                },
                statusCode: 200,
                timestamp: '2024-01-15T10:30:00.000Z',
            },
        },
    })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({
        status: 403,
        description: 'Forbidden - Insufficient permissions',
    })
    @ApiResponse({ status: 404, description: 'Follow-up schedule not found' })
    findOne(
        @Param('organisationId') organisationId: string,
        @Param('id') id: string,
        @CurrentUser() user: UserPayload,
    ) {
        return this.service.findOne(
            id,
            organisationId,
            user.sub,
            user.isSuperAdmin,
        );
    }

    @Patch(':id')
    @UseGuards(RbacGuard)
    @Roles(Role.OWNER, Role.ADMIN, Role.MEMBER)
    @ApiOperation({
        summary: 'Update follow-up schedule',
        description:
            'Update a follow-up schedule. Can update scheduled time, mark as sent, or change the follow-up message. Scheduled time must remain in the future.',
    })
    @ApiParam({
        name: 'organisationId',
        description: 'Organisation ID (ULID format)',
        example: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
    })
    @ApiParam({
        name: 'id',
        description: 'Schedule ID (ULID format)',
        example: '01HZXYZ1234567890ABCDEFGHJM',
    })
    @ApiBody({
        type: UpdateChatFollowUpScheduleDto,
        description: 'Follow-up schedule update data. All fields are optional.',
        examples: {
            Reschedule: {
                value: {
                    scheduledAt: '2024-01-21T15:00:00.000Z',
                },
            },
            'Mark as Sent': {
                value: {
                    isSent: true,
                    sentAt: '2024-01-20T14:30:15.000Z',
                },
            },
            'Change Message': {
                value: {
                    followUpMessageId: '01HZXYZ1234567890ABCDEFGHJL',
                },
            },
        },
    })
    @ApiResponse({
        status: 200,
        description: 'Follow-up schedule updated successfully',
        schema: {
            example: {
                data: {
                    id: '01HZXYZ1234567890ABCDEFGHJM',
                    chatId: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
                    followUpMessageId: '01HZXYZ1234567890ABCDEFGHJK',
                    scheduledAt: '2024-01-21T15:00:00.000Z',
                    isSent: false,
                    sentAt: null,
                    isDeleted: false,
                    createdAt: '2024-01-15T10:30:00.000Z',
                    updatedAt: '2024-01-15T14:45:00.000Z',
                    chat: {
                        id: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
                        organisationId: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
                    },
                    followUpMessage: {
                        id: '01HZXYZ1234567890ABCDEFGHJK',
                        slug: 'payment-reminder',
                        content: 'Hi! Just following up on your payment.',
                    },
                },
                statusCode: 200,
                timestamp: '2024-01-15T14:45:00.000Z',
            },
        },
    })
    @ApiResponse({
        status: 400,
        description:
            'Invalid input data or scheduled time is not in the future',
    })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({
        status: 403,
        description: 'Forbidden - Insufficient permissions',
    })
    @ApiResponse({
        status: 404,
        description: 'Follow-up schedule or message not found',
    })
    update(
        @Param('organisationId') organisationId: string,
        @Param('id') id: string,
        @Body() updateDto: UpdateChatFollowUpScheduleDto,
        @CurrentUser() user: UserPayload,
    ) {
        return this.service.update(
            id,
            organisationId,
            updateDto,
            user.sub,
            user.isSuperAdmin,
        );
    }

    @Delete(':id')
    @UseGuards(RbacGuard)
    @Roles(Role.OWNER, Role.ADMIN)
    @ApiOperation({
        summary: 'Delete follow-up schedule',
        description:
            'Delete a follow-up schedule. By default, performs a soft delete (marks as deleted). Use hardDelete=true query parameter to permanently remove from database. Only OWNER and ADMIN roles can delete schedules.',
    })
    @ApiParam({
        name: 'organisationId',
        description: 'Organisation ID (ULID format)',
        example: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
    })
    @ApiParam({
        name: 'id',
        description: 'Schedule ID (ULID format)',
        example: '01HZXYZ1234567890ABCDEFGHJM',
    })
    @ApiQuery({
        name: 'hardDelete',
        description:
            'Whether to permanently delete the schedule from database. If false or omitted, performs soft delete (marks as deleted).',
        required: false,
        type: Boolean,
        example: false,
    })
    @ApiResponse({
        status: 200,
        description: 'Follow-up schedule deleted successfully',
        schema: {
            examples: {
                'Soft Delete': {
                    value: {
                        data: {
                            id: '01HZXYZ1234567890ABCDEFGHJM',
                            chatId: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
                            followUpMessageId: '01HZXYZ1234567890ABCDEFGHJK',
                            scheduledAt: '2024-01-20T14:30:00.000Z',
                            isSent: false,
                            sentAt: null,
                            isDeleted: true,
                            createdAt: '2024-01-15T10:30:00.000Z',
                            updatedAt: '2024-01-15T15:00:00.000Z',
                            chat: {
                                id: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
                                organisationId: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
                            },
                            followUpMessage: {
                                id: '01HZXYZ1234567890ABCDEFGHJK',
                                slug: 'payment-reminder',
                                content:
                                    'Hi! Just following up on your payment.',
                            },
                        },
                        statusCode: 200,
                        timestamp: '2024-01-15T15:00:00.000Z',
                    },
                },
                'Hard Delete': {
                    value: {
                        data: {
                            id: '01HZXYZ1234567890ABCDEFGHJM',
                            chatId: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
                            followUpMessageId: '01HZXYZ1234567890ABCDEFGHJK',
                            scheduledAt: '2024-01-20T14:30:00.000Z',
                            isSent: false,
                            sentAt: null,
                            isDeleted: false,
                            createdAt: '2024-01-15T10:30:00.000Z',
                            updatedAt: '2024-01-15T15:00:00.000Z',
                        },
                        statusCode: 200,
                        timestamp: '2024-01-15T15:00:00.000Z',
                    },
                },
            },
        },
    })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({
        status: 403,
        description: 'Forbidden - Only OWNER and ADMIN can delete schedules',
    })
    @ApiResponse({ status: 404, description: 'Follow-up schedule not found' })
    remove(
        @Param('organisationId') organisationId: string,
        @Param('id') id: string,
        @Query('hardDelete') hardDelete: string,
        @CurrentUser() user: UserPayload,
    ) {
        const isHardDelete = hardDelete === 'true';
        return this.service.remove(
            id,
            organisationId,
            user.sub,
            user.isSuperAdmin,
            isHardDelete,
        );
    }
}
