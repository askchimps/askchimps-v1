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
import { Role } from '../common/enums';
import { CHAT_STATUS } from '@prisma/client';

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
  @ApiOperation({ summary: 'Create a new chat' })
  @ApiParam({ name: 'organisationId', description: 'Organisation ID' })
  create(
    @Param('organisationId') organisationId: string,
    @Body() createChatDto: CreateChatDto,
  ) {
    return this.chatService.create(organisationId, createChatDto);
  }

  @Get()
  @UseGuards(RbacGuard)
  @Roles(Role.OWNER, Role.ADMIN, Role.MEMBER)
  @ApiOperation({ summary: 'Get all chats in organisation with pagination' })
  @ApiParam({ name: 'organisationId', description: 'Organisation ID' })
  @ApiResponse({ status: 200, description: 'Chats retrieved successfully' })
  findAll(
    @Param('organisationId') organisationId: string,
    @Query() queryDto: QueryChatDto,
  ) {
    return this.chatService.findAll(organisationId, queryDto);
  }

  @Get(':id')
  @UseGuards(RbacGuard)
  @Roles(Role.OWNER, Role.ADMIN, Role.MEMBER)
  @ApiOperation({ summary: 'Get chat by ID or sourceId with messages' })
  @ApiParam({ name: 'organisationId', description: 'Organisation ID' })
  @ApiParam({ name: 'id', description: 'Chat ID or sourceId (e.g., whatsapp_919876543210_1234567890)' })
  findOne(
    @Param('organisationId') organisationId: string,
    @Param('id') id: string,
  ) {
    return this.chatService.findOne(organisationId, id);
  }

  @Patch(':id')
  @UseGuards(RbacGuard)
  @Roles(Role.OWNER, Role.ADMIN)
  @ApiOperation({ summary: 'Update chat details' })
  @ApiParam({ name: 'organisationId', description: 'Organisation ID' })
  @ApiParam({ name: 'id', description: 'Chat ID or sourceId (e.g., whatsapp_919876543210_1234567890)' })
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
  @ApiParam({ name: 'id', description: 'Chat ID or sourceId (e.g., whatsapp_919876543210_1234567890)' })
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
  @ApiParam({ name: 'id', description: 'Chat ID or sourceId (e.g., whatsapp_919876543210_1234567890)' })
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
        message: { type: 'string', example: 'Instagram message cached successfully' },
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
        message: { type: 'string', example: 'Instagram message already processed' },
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

