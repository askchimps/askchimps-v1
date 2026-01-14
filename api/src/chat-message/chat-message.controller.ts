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
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags, ApiParam, ApiResponse, ApiBody } from '@nestjs/swagger';
import { ChatMessageService } from './chat-message.service';
import { CreateChatMessageDto } from './dto/create-chat-message.dto';
import { UpdateChatMessageDto } from './dto/update-chat-message.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RbacGuard } from '../common/guards/rbac.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums';

@ApiTags('Chat Message')
@ApiBearerAuth('JWT-auth')
@Controller({ path: 'organisation/:organisationId/chat/:chatId/message', version: '1' })
@UseGuards(JwtAuthGuard)
@UseInterceptors(ClassSerializerInterceptor)
export class ChatMessageController {
  constructor(private readonly ChatMessageService: ChatMessageService) {}

  @Post()
  @UseGuards(RbacGuard)
  @Roles(Role.OWNER, Role.ADMIN, Role.MEMBER)
  @ApiOperation({
    summary: 'Create a new message in chat',
    description: 'Create a new message in a chat conversation. Supports text messages and various media types (IMAGE, VIDEO, AUDIO, FILE, GIF, DOCUMENT) with attachments.',
  })
  @ApiParam({
    name: 'organisationId',
    description: 'Organisation ID (ULID format)',
    example: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
  })
  @ApiParam({
    name: 'chatId',
    description: 'Chat ID (ULID format) or sourceId (e.g., whatsapp_919876543210_1234567890)',
    example: '01HZXYZ1234567890ABCDEFGHJK',
  })
  @ApiBody({
    type: CreateChatMessageDto,
    description: 'Message data with optional attachments',
    examples: {
      'Text Message': {
        value: {
          role: 'user',
          content: 'Hello! I would like to know more about your solar panel installation services.',
          type: 'TEXT',
        },
      },
      'Image Message': {
        value: {
          role: 'user',
          content: 'Here is a photo of my roof',
          type: 'IMAGE',
          attachments: [
            {
              url: 'https://cdn.example.com/images/roof-photo.jpg',
              filename: 'roof-photo.jpg',
              filesize: 2048576,
              filetype: 'image/jpeg',
            },
          ],
        },
      },
      'Document Message': {
        value: {
          role: 'assistant',
          content: 'Here is the solar panel brochure you requested',
          type: 'DOCUMENT',
          attachments: [
            {
              url: 'https://cdn.example.com/files/solar-brochure.pdf',
              filename: 'solar-panel-brochure.pdf',
              filesize: 5242880,
              filetype: 'application/pdf',
            },
          ],
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Message created successfully',
    schema: {
      example: {
        data: {
          id: '01HZXYZ1234567890ABCDEFGHJK',
          chatId: '01HZXYZ1234567890ABCDEFGHJK',
          organisationId: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
          role: 'user',
          content: 'Hello! I would like to know more about your solar panel installation services.',
          type: 'TEXT',
          createdAt: '2024-01-15T10:30:00.000Z',
          updatedAt: '2024-01-15T10:30:00.000Z',
          attachments: [],
        },
        statusCode: 201,
        timestamp: '2024-01-15T10:30:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Chat not found' })
  create(
    @Param('organisationId') organisationId: string,
    @Param('chatId') chatId: string,
    @Body() createChatMessageDto: CreateChatMessageDto,
  ) {
    return this.ChatMessageService.create(organisationId, chatId, createChatMessageDto);
  }

  @Get()
  @UseGuards(RbacGuard)
  @Roles(Role.OWNER, Role.ADMIN, Role.MEMBER)
  @ApiOperation({
    summary: 'Get all messages in chat',
    description: 'Retrieve all messages in a chat conversation, ordered by creation time. Includes attachments for each message.',
  })
  @ApiParam({
    name: 'organisationId',
    description: 'Organisation ID (ULID format)',
    example: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
  })
  @ApiParam({
    name: 'chatId',
    description: 'Chat ID (ULID format) or sourceId (e.g., whatsapp_919876543210_1234567890)',
    example: '01HZXYZ1234567890ABCDEFGHJK',
  })
  @ApiResponse({
    status: 200,
    description: 'Messages retrieved successfully',
    schema: {
      example: {
        data: [
          {
            id: '01HZXYZ1234567890ABCDEFGHJK',
            chatId: '01HZXYZ1234567890ABCDEFGHJK',
            organisationId: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
            role: 'user',
            content: 'Hi, I am interested in solar panels',
            type: 'TEXT',
            createdAt: '2024-01-15T10:30:00.000Z',
            updatedAt: '2024-01-15T10:30:00.000Z',
            attachments: [],
          },
          {
            id: '01HZXYZ1234567890ABCDEFGHJL',
            chatId: '01HZXYZ1234567890ABCDEFGHJK',
            organisationId: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
            role: 'assistant',
            content: 'Great! I can help you with that. What is your roof size?',
            type: 'TEXT',
            createdAt: '2024-01-15T10:31:00.000Z',
            updatedAt: '2024-01-15T10:31:00.000Z',
            attachments: [],
          },
        ],
        statusCode: 200,
        timestamp: '2024-01-15T10:30:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Chat not found' })
  findAll(
    @Param('organisationId') organisationId: string,
    @Param('chatId') chatId: string,
  ) {
    return this.ChatMessageService.findAll(organisationId, chatId);
  }

  @Get(':id')
  @UseGuards(RbacGuard)
  @Roles(Role.OWNER, Role.ADMIN, Role.MEMBER)
  @ApiOperation({
    summary: 'Get message by ID',
    description: 'Retrieve a specific message by its ID. Includes attachments.',
  })
  @ApiParam({
    name: 'organisationId',
    description: 'Organisation ID (ULID format)',
    example: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
  })
  @ApiParam({
    name: 'chatId',
    description: 'Chat ID (ULID format) or sourceId (e.g., whatsapp_919876543210_1234567890)',
    example: '01HZXYZ1234567890ABCDEFGHJK',
  })
  @ApiParam({
    name: 'id',
    description: 'Message ID (ULID format)',
    example: '01HZXYZ1234567890ABCDEFGHJK',
  })
  @ApiResponse({
    status: 200,
    description: 'Message retrieved successfully',
    schema: {
      example: {
        data: {
          id: '01HZXYZ1234567890ABCDEFGHJK',
          chatId: '01HZXYZ1234567890ABCDEFGHJK',
          organisationId: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
          role: 'user',
          content: 'Here is a photo of my roof',
          type: 'IMAGE',
          createdAt: '2024-01-15T10:30:00.000Z',
          updatedAt: '2024-01-15T10:30:00.000Z',
          attachments: [
            {
              id: '01HZXYZ1234567890ABCDEFGHJM',
              messageId: '01HZXYZ1234567890ABCDEFGHJK',
              url: 'https://cdn.example.com/images/roof-photo.jpg',
              filename: 'roof-photo.jpg',
              filesize: 2048576,
              filetype: 'image/jpeg',
              createdAt: '2024-01-15T10:30:00.000Z',
              updatedAt: '2024-01-15T10:30:00.000Z',
            },
          ],
        },
        statusCode: 200,
        timestamp: '2024-01-15T10:30:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Message not found' })
  findOne(
    @Param('organisationId') organisationId: string,
    @Param('chatId') chatId: string,
    @Param('id') id: string,
  ) {
    return this.ChatMessageService.findOne(organisationId, chatId, id);
  }

  @Patch(':id')
  @UseGuards(RbacGuard)
  @Roles(Role.OWNER, Role.ADMIN, Role.MEMBER)
  @ApiOperation({
    summary: 'Update message content',
    description: 'Update the content of an existing message. Typically used for editing sent messages.',
  })
  @ApiParam({
    name: 'organisationId',
    description: 'Organisation ID (ULID format)',
    example: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
  })
  @ApiParam({
    name: 'chatId',
    description: 'Chat ID (ULID format) or sourceId (e.g., whatsapp_919876543210_1234567890)',
    example: '01HZXYZ1234567890ABCDEFGHJK',
  })
  @ApiParam({
    name: 'id',
    description: 'Message ID (ULID format)',
    example: '01HZXYZ1234567890ABCDEFGHJK',
  })
  @ApiBody({
    type: UpdateChatMessageDto,
    description: 'Message update data. All fields are optional.',
    examples: {
      'Update Content': {
        value: {
          content: 'Updated message content',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Message updated successfully',
    schema: {
      example: {
        data: {
          id: '01HZXYZ1234567890ABCDEFGHJK',
          chatId: '01HZXYZ1234567890ABCDEFGHJK',
          organisationId: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
          role: 'user',
          content: 'Updated message content',
          type: 'TEXT',
          createdAt: '2024-01-15T10:30:00.000Z',
          updatedAt: '2024-01-15T14:45:00.000Z',
          attachments: [],
        },
        statusCode: 200,
        timestamp: '2024-01-15T14:45:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Message not found' })
  update(
    @Param('organisationId') organisationId: string,
    @Param('chatId') chatId: string,
    @Param('id') id: string,
    @Body() updateChatMessageDto: UpdateChatMessageDto,
  ) {
    return this.ChatMessageService.update(organisationId, chatId, id, updateChatMessageDto);
  }

  @Delete(':id')
  @UseGuards(RbacGuard)
  @Roles(Role.OWNER, Role.ADMIN)
  @ApiOperation({
    summary: 'Delete message (soft delete)',
    description: 'Soft delete a message. Only OWNER and ADMIN roles can delete messages. The message is marked as deleted but retained in the database.',
  })
  @ApiParam({
    name: 'organisationId',
    description: 'Organisation ID (ULID format)',
    example: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
  })
  @ApiParam({
    name: 'chatId',
    description: 'Chat ID (ULID format) or sourceId (e.g., whatsapp_919876543210_1234567890)',
    example: '01HZXYZ1234567890ABCDEFGHJK',
  })
  @ApiParam({
    name: 'id',
    description: 'Message ID (ULID format)',
    example: '01HZXYZ1234567890ABCDEFGHJK',
  })
  @ApiResponse({
    status: 200,
    description: 'Message deleted successfully',
    schema: {
      example: {
        data: {
          id: '01HZXYZ1234567890ABCDEFGHJK',
          chatId: '01HZXYZ1234567890ABCDEFGHJK',
          organisationId: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
          role: 'user',
          content: 'This message was deleted',
          type: 'TEXT',
          createdAt: '2024-01-15T10:30:00.000Z',
          updatedAt: '2024-01-15T15:00:00.000Z',
          attachments: [],
        },
        statusCode: 200,
        timestamp: '2024-01-15T15:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Only OWNER and ADMIN can delete messages' })
  @ApiResponse({ status: 404, description: 'Message not found' })
  remove(
    @Param('organisationId') organisationId: string,
    @Param('chatId') chatId: string,
    @Param('id') id: string,
  ) {
    return this.ChatMessageService.remove(organisationId, chatId, id);
  }
}

