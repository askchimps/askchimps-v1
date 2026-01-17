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
import { ChatFollowUpMessageService } from './chat-follow-up-message.service';
import { CreateChatFollowUpMessageDto } from './dto/create-chat-follow-up-message.dto';
import { UpdateChatFollowUpMessageDto } from './dto/update-chat-follow-up-message.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RbacGuard } from '../common/guards/rbac.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Role } from '../common/enums';
import type { UserPayload } from '../common/interfaces/request-with-user.interface';

@ApiTags('Chat Follow-Up Messages')
@ApiBearerAuth('JWT-auth')
@Controller({
  path: 'organisation/:organisationId/chat-follow-up-message',
  version: '1',
})
@UseGuards(JwtAuthGuard)
export class ChatFollowUpMessageController {
  constructor(private readonly service: ChatFollowUpMessageService) {}

  @Post()
  @UseGuards(RbacGuard)
  @Roles(Role.OWNER, Role.ADMIN, Role.MEMBER)
  @ApiOperation({
    summary: 'Create a follow-up message template',
    description:
      'Create a reusable follow-up message template that can be scheduled to be sent to chats. Templates help maintain consistency in follow-up communications. The combination of slug, organisationId, and sequence must be unique.',
  })
  @ApiParam({
    name: 'organisationId',
    description: 'Organisation ID (ULID format)',
    example: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
  })
  @ApiBody({
    type: CreateChatFollowUpMessageDto,
    description: 'Follow-up message template data',
    examples: {
      'Payment Reminder': {
        value: {
          slug: 'payment-reminder',
          organisationId: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
          content:
            'Hi! Just following up on your payment. Please let us know if you need any assistance.',
          sequence: 1,
          delayInMinutes: 60,
        },
      },
      'Order Status': {
        value: {
          slug: 'order-status-check',
          organisationId: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
          content:
            'Hello! We wanted to check in on your order status. Is everything going smoothly?',
          sequence: 2,
          delayInMinutes: 1440,
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Follow-up message template created successfully',
    schema: {
      example: {
        data: {
          id: '01HZXYZ1234567890ABCDEFGHJK',
          slug: 'payment-reminder',
          organisationId: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
          content:
            'Hi! Just following up on your payment. Please let us know if you need any assistance.',
          sequence: 1,
          delayInMinutes: 60,
          isDeleted: false,
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
  @ApiResponse({
    status: 409,
    description:
      'Follow-up message with this slug and sequence combination already exists in this organisation',
  })
  create(
    @Param('organisationId') organisationId: string,
    @Body() createDto: CreateChatFollowUpMessageDto,
    @CurrentUser() user: UserPayload,
  ) {
    createDto.organisationId = organisationId;
    return this.service.create(createDto, user.sub, user.isSuperAdmin);
  }

  @Get()
  @UseGuards(RbacGuard)
  @Roles(Role.OWNER, Role.ADMIN, Role.MEMBER)
  @ApiOperation({
    summary: 'Get all follow-up message templates',
    description:
      'Retrieve all follow-up message templates for an organisation. Optionally filter by slug and/or sequence. Templates are sorted alphabetically by slug, then by sequence.',
  })
  @ApiParam({
    name: 'organisationId',
    description: 'Organisation ID (ULID format)',
    example: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
  })
  @ApiQuery({
    name: 'slug',
    description: 'Optional: Filter by message slug',
    required: false,
    example: 'payment-reminder',
  })
  @ApiQuery({
    name: 'sequence',
    description: 'Optional: Filter by sequence number',
    required: false,
    type: Number,
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Follow-up message templates retrieved successfully',
    schema: {
      example: {
        data: [
          {
            id: '01HZXYZ1234567890ABCDEFGHJK',
            slug: 'order-status-check',
            organisationId: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
            content: 'Hello! We wanted to check in on your order status.',
            sequence: 1,
            delayInMinutes: 0,
            isDeleted: false,
            createdAt: '2024-01-15T10:30:00.000Z',
            updatedAt: '2024-01-15T10:30:00.000Z',
          },
          {
            id: '01HZXYZ1234567890ABCDEFGHJL',
            slug: 'payment-reminder',
            organisationId: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
            content: 'Hi! Just following up on your payment.',
            sequence: 2,
            delayInMinutes: 1440,
            isDeleted: false,
            createdAt: '2024-01-15T11:00:00.000Z',
            updatedAt: '2024-01-15T11:00:00.000Z',
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
  findAll(
    @Param('organisationId') organisationId: string,
    @Query('slug') slug: string | undefined,
    @Query('sequence') sequence: string | undefined,
    @CurrentUser() user: UserPayload,
  ) {
    const sequenceNumber = sequence ? parseInt(sequence, 10) : undefined;
    return this.service.findAll(
      organisationId,
      user.sub,
      user.isSuperAdmin,
      slug,
      sequenceNumber,
    );
  }

  @Get(':id')
  @UseGuards(RbacGuard)
  @Roles(Role.OWNER, Role.ADMIN, Role.MEMBER)
  @ApiOperation({
    summary: 'Get follow-up message template by ID',
    description: 'Retrieve a specific follow-up message template by its ID.',
  })
  @ApiParam({
    name: 'organisationId',
    description: 'Organisation ID (ULID format)',
    example: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
  })
  @ApiParam({
    name: 'id',
    description: 'Follow-up message ID (ULID format)',
    example: '01HZXYZ1234567890ABCDEFGHJK',
  })
  @ApiResponse({
    status: 200,
    description: 'Follow-up message template retrieved successfully',
    schema: {
      example: {
        data: {
          id: '01HZXYZ1234567890ABCDEFGHJK',
          slug: 'payment-reminder',
          organisationId: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
          content: 'Hi! Just following up on your payment.',
          sequence: 1,
          delayInMinutes: 60,
          isDeleted: false,
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
  @ApiResponse({ status: 404, description: 'Follow-up message not found' })
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
    summary: 'Update follow-up message template',
    description:
      "Update a follow-up message template's properties including slug, content, sequence, or delay. The combination of slug, organisationId, and sequence must remain unique.",
  })
  @ApiParam({
    name: 'organisationId',
    description: 'Organisation ID (ULID format)',
    example: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
  })
  @ApiParam({
    name: 'id',
    description: 'Follow-up message ID (ULID format)',
    example: '01HZXYZ1234567890ABCDEFGHJK',
  })
  @ApiBody({
    type: UpdateChatFollowUpMessageDto,
    description: 'Follow-up message update data. All fields are optional.',
    examples: {
      'Update Content': {
        value: {
          content:
            'Hi! This is a gentle reminder about your pending payment. Please contact us if you need assistance.',
        },
      },
      'Update Slug': {
        value: {
          slug: 'payment-follow-up',
        },
      },
      'Update Sequence and Delay': {
        value: {
          sequence: 3,
          delayInMinutes: 2880,
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Follow-up message template updated successfully',
    schema: {
      example: {
        data: {
          id: '01HZXYZ1234567890ABCDEFGHJK',
          slug: 'payment-follow-up',
          organisationId: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
          content: 'Hi! This is a gentle reminder about your pending payment.',
          sequence: 1,
          delayInMinutes: 60,
          isDeleted: false,
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
  @ApiResponse({ status: 404, description: 'Follow-up message not found' })
  @ApiResponse({
    status: 409,
    description:
      'Follow-up message with this slug and sequence combination already exists in this organisation',
  })
  update(
    @Param('organisationId') organisationId: string,
    @Param('id') id: string,
    @Body() updateDto: UpdateChatFollowUpMessageDto,
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
    summary: 'Delete follow-up message template (soft delete)',
    description:
      'Soft delete a follow-up message template. The template is marked as deleted but not removed from the database. Only OWNER and ADMIN roles can delete templates.',
  })
  @ApiParam({
    name: 'organisationId',
    description: 'Organisation ID (ULID format)',
    example: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
  })
  @ApiParam({
    name: 'id',
    description: 'Follow-up message ID (ULID format)',
    example: '01HZXYZ1234567890ABCDEFGHJK',
  })
  @ApiResponse({
    status: 200,
    description: 'Follow-up message template deleted successfully',
    schema: {
      example: {
        data: {
          id: '01HZXYZ1234567890ABCDEFGHJK',
          slug: 'payment-reminder',
          organisationId: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
          content: 'Hi! Just following up on your payment.',
          isDeleted: true,
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
    description: 'Forbidden - Only OWNER and ADMIN can delete templates',
  })
  @ApiResponse({ status: 404, description: 'Follow-up message not found' })
  remove(
    @Param('organisationId') organisationId: string,
    @Param('id') id: string,
    @CurrentUser() user: UserPayload,
  ) {
    return this.service.remove(id, organisationId, user.sub, user.isSuperAdmin);
  }
}
