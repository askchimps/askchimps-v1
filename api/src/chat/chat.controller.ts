import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  ClassSerializerInterceptor,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
  ApiParam,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';
import { ChatService } from './chat.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { UpdateChatDto } from './dto/update-chat.dto';
import { QueryChatDto } from './dto/query-chat.dto';
import { CheckInstagramMessageDto } from './dto/check-instagram-message.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RbacGuard } from '../common/guards/rbac.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Role } from '../common/enums';
import { CHAT_STATUS } from '@prisma/client';
import type { UserPayload } from '../common/interfaces/request-with-user.interface';

@ApiTags('Chat')
@ApiBearerAuth('JWT-auth')
@Controller({ path: 'organisation/:organisationId/chat', version: '1' })
@UseGuards(JwtAuthGuard)
@UseInterceptors(ClassSerializerInterceptor)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  @UseGuards(RbacGuard)
  @Roles(Role.OWNER, Role.ADMIN, Role.MEMBER)
  @ApiOperation({
    summary: 'Create a new chat',
    description:
      'Create a new chat session for a lead on a specific platform (WhatsApp, Instagram, etc.)',
  })
  @ApiParam({
    name: 'organisationId',
    description: 'Organisation ID (ULID format)',
    example: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
  })
  @ApiResponse({
    status: 201,
    description: 'Chat created successfully',
    schema: {
      example: {
        data: {
          id: '01HZXYZ1234567890ABCDEFGHJK',
          organisationId: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
          agentId: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
          leadId: '01HZXYZ1234567890ABCDEFGHJK',
          name: 'Product Inquiry - John Doe',
          source: 'WHATSAPP',
          sourceId: '+919876543210',
          status: 'NEW',
          shortSummary: null,
          detailedSummary: null,
          isTransferred: false,
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
  create(
    @Param('organisationId') organisationId: string,
    @Body() createChatDto: CreateChatDto,
  ) {
    return this.chatService.create(organisationId, createChatDto);
  }

  @Get()
  @UseGuards(RbacGuard)
  @Roles(Role.OWNER, Role.ADMIN, Role.MEMBER)
  @ApiOperation({
    summary: 'Get all chats in organisation with pagination',
    description:
      'Retrieve all chats for the organisation with pagination and filtering support. Filter by status, source, agent, lead, or search by name/phone.',
  })
  @ApiParam({
    name: 'organisationId',
    description: 'Organisation ID (ULID format)',
    example: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
  })
  @ApiResponse({
    status: 200,
    description: 'Chats retrieved successfully',
    schema: {
      example: {
        data: {
          data: [
            {
              id: '01HZXYZ1234567890ABCDEFGHJK',
              organisationId: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
              agentId: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
              leadId: '01HZXYZ1234567890ABCDEFGHJK',
              name: 'Product Inquiry - John Doe',
              source: 'WHATSAPP',
              sourceId: '+919876543210',
              status: 'NEW',
              shortSummary: 'Customer inquiring about solar panels',
              detailedSummary:
                'Customer John Doe contacted via WhatsApp asking about solar panel installation.',
              isTransferred: false,
              createdAt: '2024-01-15T10:30:00.000Z',
              updatedAt: '2024-01-15T10:30:00.000Z',
            },
          ],
          total: 100,
          limit: 50,
          offset: 0,
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
  findAll(
    @Param('organisationId') organisationId: string,
    @Query() queryDto: QueryChatDto,
    @CurrentUser() user: UserPayload,
  ) {
    return this.chatService.findAll(
      organisationId,
      user.sub,
      user.isSuperAdmin,
      queryDto,
    );
  }

  @Get(':id')
  @UseGuards(RbacGuard)
  @Roles(Role.OWNER, Role.ADMIN, Role.MEMBER)
  @ApiOperation({
    summary: 'Get chat by ID or sourceId',
    description:
      'Retrieve a specific chat. Optionally include all chat messages by setting includeMessages=true. Can use either the chat ID or sourceId.',
  })
  @ApiParam({
    name: 'organisationId',
    description: 'Organisation ID (ULID format)',
    example: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
  })
  @ApiParam({
    name: 'id',
    description:
      'Chat ID (ULID) or sourceId (e.g., whatsapp_919876543210_1234567890)',
    example: '01HZXYZ1234567890ABCDEFGHJK',
  })
  @ApiQuery({
    name: 'includeMessages',
    required: false,
    description: 'Include all chat messages in the response',
    example: 'true',
    schema: { type: 'boolean', default: false },
  })
  @ApiResponse({
    status: 200,
    description: 'Chat retrieved successfully',
    schema: {
      example: {
        data: {
          id: '01HZXYZ1234567890ABCDEFGHJK',
          organisationId: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
          agentId: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
          leadId: '01HZXYZ1234567890ABCDEFGHJK',
          name: 'Product Inquiry - John Doe',
          source: 'WHATSAPP',
          sourceId: '+919876543210',
          status: 'NEW',
          shortSummary: 'Customer inquiring about solar panels',
          detailedSummary:
            'Customer John Doe contacted via WhatsApp asking about solar panel installation.',
          isTransferred: false,
          createdAt: '2024-01-15T10:30:00.000Z',
          updatedAt: '2024-01-15T10:30:00.000Z',
          messages: [
            {
              id: '01HZXYZ1234567890ABCDEFGHJK',
              chatId: '01HZXYZ1234567890ABCDEFGHJK',
              type: 'TEXT',
              role: 'USER',
              content: 'Hi, I am interested in solar panels',
              createdAt: '2024-01-15T10:30:00.000Z',
            },
          ],
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
  @ApiResponse({ status: 404, description: 'Chat not found' })
  findOne(
    @Param('organisationId') organisationId: string,
    @Param('id') id: string,
    @Query('includeMessages') includeMessages: string,
    @CurrentUser() user: UserPayload,
  ) {
    const shouldIncludeMessages = includeMessages === 'true';
    return this.chatService.findOne(
      organisationId,
      id,
      user.sub,
      user.isSuperAdmin,
      shouldIncludeMessages,
    );
  }

  @Patch(':id')
  @UseGuards(RbacGuard)
  @Roles(Role.OWNER, Role.ADMIN)
  @ApiOperation({ summary: 'Update chat details' })
  @ApiParam({ name: 'organisationId', description: 'Organisation ID' })
  @ApiParam({
    name: 'id',
    description: 'Chat ID or sourceId (e.g., whatsapp_919876543210_1234567890)',
  })
  update(
    @Param('organisationId') organisationId: string,
    @Param('id') id: string,
    @Body() updateChatDto: UpdateChatDto,
  ) {
    return this.chatService.update(organisationId, id, updateChatDto);
  }

  @Patch(':id/status')
  @UseGuards(RbacGuard)
  @Roles(Role.OWNER, Role.ADMIN, Role.MEMBER)
  @ApiOperation({ summary: 'Update chat status' })
  @ApiParam({ name: 'organisationId', description: 'Organisation ID' })
  @ApiParam({
    name: 'id',
    description: 'Chat ID or sourceId (e.g., whatsapp_919876543210_1234567890)',
  })
  updateStatus(
    @Param('organisationId') organisationId: string,
    @Param('id') id: string,
    @Body('status') status: CHAT_STATUS,
  ) {
    return this.chatService.updateStatus(organisationId, id, status);
  }

  @Delete(':id')
  @UseGuards(RbacGuard)
  @Roles(Role.OWNER, Role.ADMIN)
  @ApiOperation({ summary: 'Delete chat (soft delete)' })
  @ApiParam({ name: 'organisationId', description: 'Organisation ID' })
  @ApiParam({
    name: 'id',
    description: 'Chat ID or sourceId (e.g., whatsapp_919876543210_1234567890)',
  })
  remove(
    @Param('organisationId') organisationId: string,
    @Param('id') id: string,
  ) {
    return this.chatService.remove(organisationId, id);
  }

  @Post('instagram/check-message')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(RbacGuard)
  @Roles(Role.OWNER, Role.ADMIN, Role.MEMBER)
  @ApiOperation({
    summary: 'Check and cache Instagram message ID',
    description:
      'Checks if an Instagram message has already been processed. Returns 409 if message exists, 201 if successfully cached.',
  })
  @ApiParam({ name: 'organisationId', description: 'Organisation ID' })
  @ApiResponse({
    status: 201,
    description: 'Message cached successfully',
    schema: {
      type: 'object',
      properties: {
        exists: { type: 'boolean', example: false },
        message: {
          type: 'string',
          example: 'Instagram message cached successfully',
        },
      },
    },
  })
  @ApiResponse({
    status: 409,
    description: 'Message already processed',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 409 },
        message: {
          type: 'string',
          example: 'Instagram message already processed',
        },
        error: { type: 'string', example: 'Conflict' },
      },
    },
  })
  checkInstagramMessage(
    @Param('organisationId') organisationId: string,
    @Body() checkInstagramMessageDto: CheckInstagramMessageDto,
  ) {
    return this.chatService.checkInstagramMessage(checkInstagramMessageDto);
  }
}
