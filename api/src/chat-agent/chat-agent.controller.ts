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
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { ChatAgentService } from './chat-agent.service';
import { CreateChatAgentDto } from './dto/create-chat-agent.dto';
import { UpdateChatAgentDto } from './dto/update-chat-agent.dto';
import { QueryChatAgentDto } from './dto/query-chat-agent.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RbacGuard } from '../common/guards/rbac.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Role } from '../common/enums';
import type { UserPayload } from '../common/interfaces/request-with-user.interface';

@ApiTags('Chat Agent')
@ApiBearerAuth('JWT-auth')
@Controller({ path: 'chat-agent', version: '1' })
@UseGuards(JwtAuthGuard)
export class ChatAgentController {
  constructor(private readonly chatAgentService: ChatAgentService) {}

  @Post()
  @UseGuards(RbacGuard)
  @Roles(Role.OWNER, Role.ADMIN, Role.MEMBER)
  @ApiOperation({
    summary: 'Assign an agent to a chat',
    description: 'Create a new chat-agent relationship',
  })
  @ApiResponse({
    status: 201,
    description: 'Agent assigned to chat successfully',
    schema: {
      example: {
        data: {
          id: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
          chatId: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
          agentId: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
          isActive: true,
          createdAt: '2024-01-15T10:30:00.000Z',
          updatedAt: '2024-01-15T10:30:00.000Z',
          agent: {
            id: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
            name: 'John Doe',
            type: 'HUMAN',
            role: 'INBOUND_CHAT',
            workflowId: null,
          },
          chat: {
            id: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
            name: 'Customer Support Chat',
            source: 'WHATSAPP',
          },
        },
        statusCode: 201,
        timestamp: '2024-01-15T10:30:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 404, description: 'Chat or Agent not found' })
  @ApiResponse({ status: 409, description: 'Agent already assigned to this chat' })
  create(
    @Body() createChatAgentDto: CreateChatAgentDto,
    @CurrentUser() user: UserPayload,
  ) {
    return this.chatAgentService.create(
      createChatAgentDto,
      user.sub,
      user.isSuperAdmin,
    );
  }

  @Get()
  @ApiOperation({
    summary: 'Get all chat-agent relationships',
    description: 'Retrieve all chat-agent assignments with optional filters',
  })
  @ApiQuery({
    name: 'chatId',
    required: false,
    description: 'Filter by Chat ID',
    example: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
  })
  @ApiQuery({
    name: 'agentId',
    required: false,
    description: 'Filter by Agent ID',
    example: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
  })
  @ApiQuery({
    name: 'isActive',
    required: false,
    description: 'Filter by active status',
    example: true,
  })
  @ApiResponse({
    status: 200,
    description: 'List of chat-agent relationships retrieved successfully',
    schema: {
      example: {
        data: [
          {
            id: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
            chatId: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
            agentId: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
            isActive: true,
            createdAt: '2024-01-15T10:30:00.000Z',
            updatedAt: '2024-01-15T10:30:00.000Z',
            agent: {
              id: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
              name: 'John Doe',
              type: 'HUMAN',
              role: 'INBOUND_CHAT',
              workflowId: null,
            },
            chat: {
              id: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
              name: 'Customer Support Chat',
              source: 'WHATSAPP',
            },
          },
        ],
        statusCode: 200,
        timestamp: '2024-01-15T10:30:00.000Z',
      },
    },
  })
  findAll(@Query() queryDto: QueryChatAgentDto) {
    return this.chatAgentService.findAll(queryDto);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get a chat-agent relationship by ID',
    description: 'Retrieve a specific chat-agent assignment',
  })
  @ApiParam({
    name: 'id',
    description: 'Chat-Agent relationship ID (ULID format)',
    example: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
  })
  @ApiResponse({
    status: 200,
    description: 'Chat-agent relationship retrieved successfully',
    schema: {
      example: {
        data: {
          id: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
          chatId: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
          agentId: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
          isActive: true,
          createdAt: '2024-01-15T10:30:00.000Z',
          updatedAt: '2024-01-15T10:30:00.000Z',
          agent: {
            id: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
            name: 'John Doe',
            type: 'HUMAN',
            role: 'INBOUND_CHAT',
            workflowId: null,
          },
          chat: {
            id: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
            name: 'Customer Support Chat',
            source: 'WHATSAPP',
          },
        },
        statusCode: 200,
        timestamp: '2024-01-15T10:30:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Chat-agent relationship not found' })
  findOne(@Param('id') id: string) {
    return this.chatAgentService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(RbacGuard)
  @Roles(Role.OWNER, Role.ADMIN)
  @ApiOperation({
    summary: 'Update a chat-agent relationship',
    description: 'Update the active status of a chat-agent assignment',
  })
  @ApiParam({
    name: 'id',
    description: 'Chat-Agent relationship ID (ULID format)',
    example: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
  })
  @ApiResponse({
    status: 200,
    description: 'Chat-agent relationship updated successfully',
    schema: {
      example: {
        data: {
          id: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
          chatId: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
          agentId: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
          isActive: false,
          createdAt: '2024-01-15T10:30:00.000Z',
          updatedAt: '2024-01-15T11:00:00.000Z',
        },
        statusCode: 200,
        timestamp: '2024-01-15T11:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Chat-agent relationship not found' })
  update(
    @Param('id') id: string,
    @Body() updateChatAgentDto: UpdateChatAgentDto,
    @CurrentUser() user: UserPayload,
  ) {
    return this.chatAgentService.update(
      id,
      updateChatAgentDto,
      user.sub,
      user.isSuperAdmin,
    );
  }

  @Delete(':id')
  @UseGuards(RbacGuard)
  @Roles(Role.OWNER, Role.ADMIN)
  @ApiOperation({
    summary: 'Remove an agent from a chat',
    description: 'Soft delete a chat-agent relationship',
  })
  @ApiParam({
    name: 'id',
    description: 'Chat-Agent relationship ID (ULID format)',
    example: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
  })
  @ApiResponse({
    status: 200,
    description: 'Agent removed from chat successfully',
    schema: {
      example: {
        data: {
          id: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
          chatId: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
          agentId: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
          isActive: true,
          createdAt: '2024-01-15T10:30:00.000Z',
          updatedAt: '2024-01-15T12:00:00.000Z',
        },
        statusCode: 200,
        timestamp: '2024-01-15T12:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Chat-agent relationship not found' })
  remove(@Param('id') id: string, @CurrentUser() user: UserPayload) {
    return this.chatAgentService.remove(id, user.sub, user.isSuperAdmin);
  }
}
