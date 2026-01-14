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
import { ApiTags, ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiBody } from '@nestjs/swagger';
import { ExecutionService } from './execution.service';
import { CreateExecutionDto } from './dto/create-execution.dto';
import { UpdateExecutionDto } from './dto/update-execution.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RbacGuard } from '../common/guards/rbac.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Role } from '../common/enums';
import type { UserPayload } from '../common/interfaces/request-with-user.interface';

@ApiTags('Execution')
@ApiBearerAuth('JWT-auth')
@Controller({ path: 'organisation/:organisationId/execution', version: '1' })
@UseGuards(JwtAuthGuard)
export class ExecutionController {
  constructor(private readonly executionService: ExecutionService) {}

  @Post()
  @UseGuards(RbacGuard)
  @Roles(Role.OWNER, Role.ADMIN, Role.MEMBER)
  @ApiOperation({
    summary: 'Create a new execution',
    description: 'Create a new execution record to track workflow events. Executions can be of type SYNC_LEAD, CALL_TRIGGER, CALL_END, or CALL_ANALYSIS. Each execution is identified by an external ID from the workflow system.',
  })
  @ApiParam({
    name: 'organisationId',
    description: 'Organisation ID (ULID format)',
    example: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
  })
  @ApiBody({
    type: CreateExecutionDto,
    description: 'Execution data',
    examples: {
      'Call Trigger Execution': {
        value: {
          externalId: 'ext_exec_call_trigger_123456',
          type: 'CALL_TRIGGER',
          organisationId: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
          agentId: '01HZXYZ1234567890ABCDEFGHJK',
          leadId: '01HZXYZ1234567890ABCDEFGHJL',
          callId: '01HZXYZ1234567890ABCDEFGHJM',
        },
      },
      'Call Analysis Execution': {
        value: {
          externalId: 'ext_exec_call_analysis_789012',
          type: 'CALL_ANALYSIS',
          organisationId: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
          agentId: '01HZXYZ1234567890ABCDEFGHJK',
          leadId: '01HZXYZ1234567890ABCDEFGHJL',
          callId: '01HZXYZ1234567890ABCDEFGHJM',
        },
      },
      'Lead Sync Execution': {
        value: {
          externalId: 'ext_exec_sync_lead_345678',
          type: 'SYNC_LEAD',
          organisationId: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
          agentId: '01HZXYZ1234567890ABCDEFGHJK',
          leadId: '01HZXYZ1234567890ABCDEFGHJL',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Execution created successfully',
    schema: {
      example: {
        data: {
          id: '01HZXYZ1234567890ABCDEFGHJK',
          externalId: 'ext_exec_call_trigger_123456',
          type: 'CALL_TRIGGER',
          organisationId: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
          agentId: '01HZXYZ1234567890ABCDEFGHJK',
          leadId: '01HZXYZ1234567890ABCDEFGHJL',
          callId: '01HZXYZ1234567890ABCDEFGHJM',
          chatId: null,
          createdAt: '2024-01-15T10:30:00.000Z',
          updatedAt: '2024-01-15T10:30:00.000Z',
        },
        statusCode: 201,
        timestamp: '2024-01-15T10:30:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input or execution with this external ID already exists',
    schema: {
      example: {
        message: 'Execution with this external ID already exists',
        error: 'Bad Request',
        statusCode: 400,
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  create(
    @Param('organisationId') organisationId: string,
    @Body() createExecutionDto: CreateExecutionDto,
    @CurrentUser() user: UserPayload,
  ) {
    // Ensure organisationId from params matches body
    createExecutionDto.organisationId = organisationId;
    return this.executionService.create(createExecutionDto, user.sub, user.isSuperAdmin);
  }

  @Get()
  @UseGuards(RbacGuard)
  @Roles(Role.OWNER, Role.ADMIN, Role.MEMBER)
  @ApiOperation({
    summary: 'Get all executions for an organisation',
    description: 'Retrieve all execution records for an organisation. Useful for tracking workflow history and debugging.',
  })
  @ApiParam({
    name: 'organisationId',
    description: 'Organisation ID (ULID format)',
    example: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
  })
  @ApiResponse({
    status: 200,
    description: 'Executions retrieved successfully',
    schema: {
      example: {
        data: [
          {
            id: '01HZXYZ1234567890ABCDEFGHJK',
            externalId: 'ext_exec_call_trigger_123456',
            type: 'CALL_TRIGGER',
            organisationId: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
            agentId: '01HZXYZ1234567890ABCDEFGHJK',
            leadId: '01HZXYZ1234567890ABCDEFGHJL',
            callId: '01HZXYZ1234567890ABCDEFGHJM',
            chatId: null,
            createdAt: '2024-01-15T10:30:00.000Z',
            updatedAt: '2024-01-15T10:30:00.000Z',
          },
          {
            id: '01HZXYZ1234567890ABCDEFGHJN',
            externalId: 'ext_exec_call_analysis_789012',
            type: 'CALL_ANALYSIS',
            organisationId: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
            agentId: '01HZXYZ1234567890ABCDEFGHJK',
            leadId: '01HZXYZ1234567890ABCDEFGHJL',
            callId: '01HZXYZ1234567890ABCDEFGHJM',
            chatId: null,
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
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  findAll(
    @Param('organisationId') organisationId: string,
    @CurrentUser() user: UserPayload,
  ) {
    return this.executionService.findAll(organisationId, user.sub, user.isSuperAdmin);
  }

  @Get(':id')
  @UseGuards(RbacGuard)
  @Roles(Role.OWNER, Role.ADMIN, Role.MEMBER)
  @ApiOperation({
    summary: 'Get execution by ID or External ID',
    description: 'Retrieve a specific execution by its internal ID (ULID) or external ID from the workflow system.',
  })
  @ApiParam({
    name: 'organisationId',
    description: 'Organisation ID (ULID format)',
    example: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
  })
  @ApiParam({
    name: 'id',
    description: 'Execution ID (ULID format) or External ID',
    examples: {
      'Internal ID': {
        value: '01HZXYZ1234567890ABCDEFGHJK',
      },
      'External ID': {
        value: 'ext_exec_call_trigger_123456',
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Execution retrieved successfully',
    schema: {
      example: {
        data: {
          id: '01HZXYZ1234567890ABCDEFGHJK',
          externalId: 'ext_exec_call_trigger_123456',
          type: 'CALL_TRIGGER',
          organisationId: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
          agentId: '01HZXYZ1234567890ABCDEFGHJK',
          leadId: '01HZXYZ1234567890ABCDEFGHJL',
          callId: '01HZXYZ1234567890ABCDEFGHJM',
          chatId: null,
          createdAt: '2024-01-15T10:30:00.000Z',
          updatedAt: '2024-01-15T10:30:00.000Z',
        },
        statusCode: 200,
        timestamp: '2024-01-15T10:30:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Execution not found' })
  findOne(
    @Param('organisationId') organisationId: string,
    @Param('id') id: string,
    @CurrentUser() user: UserPayload,
  ) {
    return this.executionService.findOne(id, organisationId, user.sub, user.isSuperAdmin);
  }

  @Patch(':id')
  @UseGuards(RbacGuard)
  @Roles(Role.OWNER, Role.ADMIN)
  @ApiOperation({
    summary: 'Update execution by ID or External ID',
    description: 'Update an execution record. Typically used to update associated IDs after workflow completion.',
  })
  @ApiParam({
    name: 'organisationId',
    description: 'Organisation ID (ULID format)',
    example: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
  })
  @ApiParam({
    name: 'id',
    description: 'Execution ID (ULID format) or External ID',
    example: '01HZXYZ1234567890ABCDEFGHJK',
  })
  @ApiBody({
    type: UpdateExecutionDto,
    description: 'Execution update data. All fields are optional.',
    examples: {
      'Update Call ID': {
        value: {
          callId: '01HZXYZ1234567890ABCDEFGHJM',
        },
      },
      'Update Chat ID': {
        value: {
          chatId: '01HZXYZ1234567890ABCDEFGHJN',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Execution updated successfully',
    schema: {
      example: {
        data: {
          id: '01HZXYZ1234567890ABCDEFGHJK',
          externalId: 'ext_exec_call_trigger_123456',
          type: 'CALL_TRIGGER',
          organisationId: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
          agentId: '01HZXYZ1234567890ABCDEFGHJK',
          leadId: '01HZXYZ1234567890ABCDEFGHJL',
          callId: '01HZXYZ1234567890ABCDEFGHJM',
          chatId: null,
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
  @ApiResponse({ status: 403, description: 'Forbidden - Only OWNER and ADMIN can update executions' })
  @ApiResponse({ status: 404, description: 'Execution not found' })
  update(
    @Param('organisationId') organisationId: string,
    @Param('id') id: string,
    @Body() updateExecutionDto: UpdateExecutionDto,
    @CurrentUser() user: UserPayload,
  ) {
    return this.executionService.update(
      id,
      organisationId,
      updateExecutionDto,
      user.sub,
      user.isSuperAdmin,
    );
  }

  @Delete(':id')
  @UseGuards(RbacGuard)
  @Roles(Role.OWNER, Role.ADMIN)
  @ApiOperation({
    summary: 'Delete execution by ID or External ID (hard delete)',
    description: 'Permanently delete an execution record. Only OWNER and ADMIN roles can delete executions. This is a hard delete and cannot be undone.',
  })
  @ApiParam({
    name: 'organisationId',
    description: 'Organisation ID (ULID format)',
    example: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
  })
  @ApiParam({
    name: 'id',
    description: 'Execution ID (ULID format) or External ID',
    example: '01HZXYZ1234567890ABCDEFGHJK',
  })
  @ApiResponse({
    status: 200,
    description: 'Execution deleted successfully',
    schema: {
      example: {
        data: {
          id: '01HZXYZ1234567890ABCDEFGHJK',
          externalId: 'ext_exec_call_trigger_123456',
          type: 'CALL_TRIGGER',
          organisationId: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
          agentId: '01HZXYZ1234567890ABCDEFGHJK',
          leadId: '01HZXYZ1234567890ABCDEFGHJL',
          callId: '01HZXYZ1234567890ABCDEFGHJM',
          chatId: null,
          createdAt: '2024-01-15T10:30:00.000Z',
          updatedAt: '2024-01-15T15:00:00.000Z',
        },
        statusCode: 200,
        timestamp: '2024-01-15T15:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Only OWNER and ADMIN can delete executions' })
  @ApiResponse({ status: 404, description: 'Execution not found' })
  remove(
    @Param('organisationId') organisationId: string,
    @Param('id') id: string,
    @CurrentUser() user: UserPayload,
  ) {
    return this.executionService.remove(id, organisationId, user.sub, user.isSuperAdmin);
  }
}

