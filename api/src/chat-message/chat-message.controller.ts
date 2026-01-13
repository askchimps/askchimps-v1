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
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags, ApiParam, ApiResponse } from '@nestjs/swagger';
import { ChatMessageService } from './chat-message.service';
import { CreateChatMessageDto } from './dto/create-chat-message.dto';
import { UpdateChatMessageDto } from './dto/update-chat-message.dto';
import { QueryChatMessageDto } from './dto/query-chat-message.dto';
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
  @ApiOperation({ summary: 'Create a new message in chat' })
  @ApiParam({ name: 'organisationId', description: 'Organisation ID' })
  @ApiParam({ name: 'chatId', description: 'Chat ID or sourceId (e.g., whatsapp_919876543210_1234567890)' })
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
  @ApiOperation({ summary: 'Get all messages in chat with pagination' })
  @ApiParam({ name: 'organisationId', description: 'Organisation ID' })
  @ApiParam({ name: 'chatId', description: 'Chat ID or sourceId (e.g., whatsapp_919876543210_1234567890)' })
  @ApiResponse({ status: 200, description: 'Chat messages retrieved successfully' })
  findAll(
    @Param('organisationId') organisationId: string,
    @Param('chatId') chatId: string,
    @Query() queryDto: QueryChatMessageDto,
  ) {
    return this.ChatMessageService.findAll(organisationId, chatId, queryDto);
  }

  @Get(':id')
  @UseGuards(RbacGuard)
  @Roles(Role.OWNER, Role.ADMIN, Role.MEMBER)
  @ApiOperation({ summary: 'Get message by ID' })
  @ApiParam({ name: 'organisationId', description: 'Organisation ID' })
  @ApiParam({ name: 'chatId', description: 'Chat ID or sourceId (e.g., whatsapp_919876543210_1234567890)' })
  @ApiParam({ name: 'id', description: 'Message ID' })
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
  @ApiOperation({ summary: 'Update message content' })
  @ApiParam({ name: 'organisationId', description: 'Organisation ID' })
  @ApiParam({ name: 'chatId', description: 'Chat ID or sourceId (e.g., whatsapp_919876543210_1234567890)' })
  @ApiParam({ name: 'id', description: 'Message ID' })
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
  @ApiOperation({ summary: 'Delete message (soft delete)' })
  @ApiParam({ name: 'organisationId', description: 'Organisation ID' })
  @ApiParam({ name: 'chatId', description: 'Chat ID or sourceId (e.g., whatsapp_919876543210_1234567890)' })
  @ApiParam({ name: 'id', description: 'Message ID' })
  remove(
    @Param('organisationId') organisationId: string,
    @Param('chatId') chatId: string,
    @Param('id') id: string,
  ) {
    return this.ChatMessageService.remove(organisationId, chatId, id);
  }
}

