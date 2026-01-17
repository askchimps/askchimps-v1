import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards,
} from '@nestjs/common';
import {
    ApiTags,
    ApiBearerAuth,
    ApiOperation,
    ApiParam,
    ApiResponse,
    ApiBody,
} from '@nestjs/swagger';
import { CallMessageService } from './call-message.service';
import {
    CreateCallMessageDto,
    CreateBulkCallMessageDto,
} from './dto/create-call-message.dto';
import { UpdateCallMessageDto } from './dto/update-call-message.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RbacGuard } from '../common/guards/rbac.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Role } from '../common/enums';
import type { UserPayload } from '../common/interfaces/request-with-user.interface';

@ApiTags('Call Message')
@ApiBearerAuth('JWT-auth')
@Controller({
    path: 'organisation/:organisationId/call/:callId/message',
    version: '1',
})
@UseGuards(JwtAuthGuard)
export class CallMessageController {
    constructor(private readonly callMessageService: CallMessageService) {}

    @Post()
    @UseGuards(RbacGuard)
    @Roles(Role.OWNER, Role.ADMIN, Role.MEMBER)
    @ApiOperation({
        summary: 'Create a new call message',
        description:
            'Create a single message in a call conversation. Typically used for recording conversation turns between user and assistant.',
    })
    @ApiParam({
        name: 'organisationId',
        description: 'Organisation ID (ULID format)',
        example: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
    })
    @ApiParam({
        name: 'callId',
        description: 'Call ID (ULID format)',
        example: '01HZXYZ1234567890ABCDEFGHJK',
    })
    @ApiBody({
        type: CreateCallMessageDto,
        description: 'Call message data',
        examples: {
            'User Message': {
                value: {
                    callId: '01HZXYZ1234567890ABCDEFGHJK',
                    organisationId: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
                    role: 'user',
                    content:
                        'I am interested in solar panel installation for my home.',
                },
            },
            'Assistant Message': {
                value: {
                    callId: '01HZXYZ1234567890ABCDEFGHJK',
                    organisationId: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
                    role: 'assistant',
                    content:
                        'Great! I can help you with that. What is the size of your roof?',
                },
            },
        },
    })
    @ApiResponse({
        status: 201,
        description: 'Call message created successfully',
        schema: {
            example: {
                data: {
                    id: '01HZXYZ1234567890ABCDEFGHJK',
                    callId: '01HZXYZ1234567890ABCDEFGHJK',
                    organisationId: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
                    role: 'user',
                    content:
                        'I am interested in solar panel installation for my home.',
                    createdAt: '2024-01-15T10:30:00.000Z',
                    updatedAt: '2024-01-15T10:30:00.000Z',
                },
                statusCode: 201,
                timestamp: '2024-01-15T10:30:00.000Z',
            },
        },
    })
    @ApiResponse({ status: 400, description: 'Invalid input data' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({
        status: 403,
        description: 'Forbidden - Insufficient permissions',
    })
    @ApiResponse({ status: 404, description: 'Call not found' })
    create(
        @Param('organisationId') organisationId: string,
        @Param('callId') callId: string,
        @Body() createCallMessageDto: CreateCallMessageDto,
        @CurrentUser() user: UserPayload,
    ) {
        // Ensure IDs from params match body
        createCallMessageDto.organisationId = organisationId;
        createCallMessageDto.callId = callId;
        return this.callMessageService.create(
            createCallMessageDto,
            user.sub,
            user.isSuperAdmin,
        );
    }

    @Post('bulk')
    @UseGuards(RbacGuard)
    @Roles(Role.OWNER, Role.ADMIN, Role.MEMBER)
    @ApiOperation({
        summary: 'Create multiple call messages in bulk',
        description:
            'Create multiple messages in a single transaction. Useful for importing entire call transcripts or conversation histories.',
    })
    @ApiParam({
        name: 'organisationId',
        description: 'Organisation ID (ULID format)',
        example: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
    })
    @ApiParam({
        name: 'callId',
        description: 'Call ID (ULID format)',
        example: '01HZXYZ1234567890ABCDEFGHJK',
    })
    @ApiBody({
        type: CreateBulkCallMessageDto,
        description: 'Array of call messages to create',
        examples: {
            'Conversation Transcript': {
                value: {
                    messages: [
                        {
                            role: 'user',
                            content:
                                'Hello, I would like to inquire about your solar panel services.',
                        },
                        {
                            role: 'assistant',
                            content:
                                'Hello! I would be happy to help you. What would you like to know?',
                        },
                        {
                            role: 'user',
                            content: 'What is the cost for a 5kW system?',
                        },
                        {
                            role: 'assistant',
                            content:
                                'A 5kW system typically costs between $15,000 to $20,000 depending on your location and roof type.',
                        },
                    ],
                },
            },
        },
    })
    @ApiResponse({
        status: 201,
        description: 'Call messages created successfully',
        schema: {
            example: {
                data: [
                    {
                        id: '01HZXYZ1234567890ABCDEFGHJK',
                        callId: '01HZXYZ1234567890ABCDEFGHJK',
                        organisationId: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
                        role: 'user',
                        content:
                            'Hello, I would like to inquire about your solar panel services.',
                        createdAt: '2024-01-15T10:30:00.000Z',
                        updatedAt: '2024-01-15T10:30:00.000Z',
                    },
                    {
                        id: '01HZXYZ1234567890ABCDEFGHJL',
                        callId: '01HZXYZ1234567890ABCDEFGHJK',
                        organisationId: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
                        role: 'assistant',
                        content:
                            'Hello! I would be happy to help you. What would you like to know?',
                        createdAt: '2024-01-15T10:30:01.000Z',
                        updatedAt: '2024-01-15T10:30:01.000Z',
                    },
                ],
                statusCode: 201,
                timestamp: '2024-01-15T10:30:00.000Z',
            },
        },
    })
    @ApiResponse({ status: 400, description: 'Invalid input data' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({
        status: 403,
        description: 'Forbidden - Insufficient permissions',
    })
    @ApiResponse({ status: 404, description: 'Call not found' })
    createBulk(
        @Param('organisationId') organisationId: string,
        @Param('callId') callId: string,
        @Body() createBulkCallMessageDto: CreateBulkCallMessageDto,
        @CurrentUser() user: UserPayload,
    ) {
        return this.callMessageService.createMany(
            callId,
            organisationId,
            createBulkCallMessageDto,
            user.sub,
            user.isSuperAdmin,
        );
    }

    @Get()
    @UseGuards(RbacGuard)
    @Roles(Role.OWNER, Role.ADMIN, Role.MEMBER)
    @ApiOperation({
        summary: 'Get all messages in a call',
        description:
            'Retrieve all messages in a call conversation, ordered by creation time. Useful for displaying call transcripts.',
    })
    @ApiParam({
        name: 'organisationId',
        description: 'Organisation ID (ULID format)',
        example: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
    })
    @ApiParam({
        name: 'callId',
        description: 'Call ID (ULID format)',
        example: '01HZXYZ1234567890ABCDEFGHJK',
    })
    @ApiResponse({
        status: 200,
        description: 'Call messages retrieved successfully',
        schema: {
            example: {
                data: [
                    {
                        id: '01HZXYZ1234567890ABCDEFGHJK',
                        callId: '01HZXYZ1234567890ABCDEFGHJK',
                        organisationId: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
                        role: 'user',
                        content: 'I am interested in solar panel installation.',
                        createdAt: '2024-01-15T10:30:00.000Z',
                        updatedAt: '2024-01-15T10:30:00.000Z',
                    },
                    {
                        id: '01HZXYZ1234567890ABCDEFGHJL',
                        callId: '01HZXYZ1234567890ABCDEFGHJK',
                        organisationId: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
                        role: 'assistant',
                        content:
                            'Great! I can help you with that. What is your roof size?',
                        createdAt: '2024-01-15T10:31:00.000Z',
                        updatedAt: '2024-01-15T10:31:00.000Z',
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
    @ApiResponse({ status: 404, description: 'Call not found' })
    findAll(
        @Param('organisationId') organisationId: string,
        @Param('callId') callId: string,
        @CurrentUser() user: UserPayload,
    ) {
        return this.callMessageService.findAll(
            callId,
            organisationId,
            user.sub,
            user.isSuperAdmin,
        );
    }

    @Get(':id')
    @UseGuards(RbacGuard)
    @Roles(Role.OWNER, Role.ADMIN, Role.MEMBER)
    @ApiOperation({
        summary: 'Get call message by ID',
        description: 'Retrieve a specific call message by its ID.',
    })
    @ApiParam({
        name: 'organisationId',
        description: 'Organisation ID (ULID format)',
        example: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
    })
    @ApiParam({
        name: 'callId',
        description: 'Call ID (ULID format)',
        example: '01HZXYZ1234567890ABCDEFGHJK',
    })
    @ApiParam({
        name: 'id',
        description: 'Call Message ID (ULID format)',
        example: '01HZXYZ1234567890ABCDEFGHJK',
    })
    @ApiResponse({
        status: 200,
        description: 'Call message retrieved successfully',
        schema: {
            example: {
                data: {
                    id: '01HZXYZ1234567890ABCDEFGHJK',
                    callId: '01HZXYZ1234567890ABCDEFGHJK',
                    organisationId: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
                    role: 'user',
                    content: 'I am interested in solar panel installation.',
                    createdAt: '2024-01-15T10:30:00.000Z',
                    updatedAt: '2024-01-15T10:30:00.000Z',
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
    @ApiResponse({ status: 404, description: 'Call message not found' })
    findOne(
        @Param('organisationId') organisationId: string,
        @Param('callId') callId: string,
        @Param('id') id: string,
        @CurrentUser() user: UserPayload,
    ) {
        return this.callMessageService.findOne(
            id,
            callId,
            organisationId,
            user.sub,
            user.isSuperAdmin,
        );
    }

    @Patch(':id')
    @UseGuards(RbacGuard)
    @Roles(Role.OWNER, Role.ADMIN, Role.MEMBER)
    @ApiOperation({
        summary: 'Update call message',
        description:
            'Update the content or role of an existing call message. Typically used for correcting transcription errors.',
    })
    @ApiParam({
        name: 'organisationId',
        description: 'Organisation ID (ULID format)',
        example: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
    })
    @ApiParam({
        name: 'callId',
        description: 'Call ID (ULID format)',
        example: '01HZXYZ1234567890ABCDEFGHJK',
    })
    @ApiParam({
        name: 'id',
        description: 'Call Message ID (ULID format)',
        example: '01HZXYZ1234567890ABCDEFGHJK',
    })
    @ApiBody({
        type: UpdateCallMessageDto,
        description: 'Call message update data. All fields are optional.',
        examples: {
            'Update Content': {
                value: {
                    content: 'Corrected message content',
                },
            },
            'Update Role': {
                value: {
                    role: 'system',
                },
            },
        },
    })
    @ApiResponse({
        status: 200,
        description: 'Call message updated successfully',
        schema: {
            example: {
                data: {
                    id: '01HZXYZ1234567890ABCDEFGHJK',
                    callId: '01HZXYZ1234567890ABCDEFGHJK',
                    organisationId: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
                    role: 'user',
                    content: 'Corrected message content',
                    createdAt: '2024-01-15T10:30:00.000Z',
                    updatedAt: '2024-01-15T14:45:00.000Z',
                },
                statusCode: 200,
                timestamp: '2024-01-15T14:45:00.000Z',
            },
        },
    })
    @ApiResponse({ status: 400, description: 'Invalid input data' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({
        status: 403,
        description: 'Forbidden - Insufficient permissions',
    })
    @ApiResponse({ status: 404, description: 'Call message not found' })
    update(
        @Param('organisationId') organisationId: string,
        @Param('callId') callId: string,
        @Param('id') id: string,
        @Body() updateCallMessageDto: UpdateCallMessageDto,
        @CurrentUser() user: UserPayload,
    ) {
        return this.callMessageService.update(
            id,
            callId,
            organisationId,
            updateCallMessageDto,
            user.sub,
            user.isSuperAdmin,
        );
    }

    @Delete(':id')
    @UseGuards(RbacGuard)
    @Roles(Role.OWNER, Role.ADMIN)
    @ApiOperation({
        summary: 'Delete call message (soft delete)',
        description:
            'Soft delete a call message. Only OWNER and ADMIN roles can delete messages. The message is marked as deleted but retained in the database.',
    })
    @ApiParam({
        name: 'organisationId',
        description: 'Organisation ID (ULID format)',
        example: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
    })
    @ApiParam({
        name: 'callId',
        description: 'Call ID (ULID format)',
        example: '01HZXYZ1234567890ABCDEFGHJK',
    })
    @ApiParam({
        name: 'id',
        description: 'Call Message ID (ULID format)',
        example: '01HZXYZ1234567890ABCDEFGHJK',
    })
    @ApiResponse({
        status: 200,
        description: 'Call message deleted successfully',
        schema: {
            example: {
                data: {
                    id: '01HZXYZ1234567890ABCDEFGHJK',
                    callId: '01HZXYZ1234567890ABCDEFGHJK',
                    organisationId: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
                    role: 'user',
                    content: 'This message was deleted',
                    createdAt: '2024-01-15T10:30:00.000Z',
                    updatedAt: '2024-01-15T15:00:00.000Z',
                },
                statusCode: 200,
                timestamp: '2024-01-15T15:00:00.000Z',
            },
        },
    })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({
        status: 403,
        description: 'Forbidden - Only OWNER and ADMIN can delete messages',
    })
    @ApiResponse({ status: 404, description: 'Call message not found' })
    remove(
        @Param('organisationId') organisationId: string,
        @Param('callId') callId: string,
        @Param('id') id: string,
        @CurrentUser() user: UserPayload,
    ) {
        return this.callMessageService.remove(
            id,
            callId,
            organisationId,
            user.sub,
            user.isSuperAdmin,
        );
    }
}
