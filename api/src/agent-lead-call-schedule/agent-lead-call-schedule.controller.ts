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
import { ApiTags, ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiQuery, ApiBody } from '@nestjs/swagger';
import { AgentLeadCallScheduleService } from './agent-lead-call-schedule.service';
import { CreateAgentLeadCallScheduleDto } from './dto/create-agent-lead-call-schedule.dto';
import { UpdateAgentLeadCallScheduleDto } from './dto/update-agent-lead-call-schedule.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RbacGuard } from '../common/guards/rbac.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Role } from '../common/enums';
import type { UserPayload } from '../common/interfaces/request-with-user.interface';

@ApiTags('Agent Lead Call Schedule')
@ApiBearerAuth('JWT-auth')
@Controller({ path: 'organisation/:organisationId/agent-lead-call-schedule', version: '1' })
@UseGuards(JwtAuthGuard)
export class AgentLeadCallScheduleController {
  constructor(private readonly scheduleService: AgentLeadCallScheduleService) {}

  @Post()
  @UseGuards(RbacGuard)
  @Roles(Role.OWNER, Role.ADMIN, Role.MEMBER)
  @ApiOperation({
    summary: 'Create a new call schedule',
    description: 'Schedule a call between an agent and a lead. Supports INITIAL calls, FOLLOW_UP calls, and RESCHEDULE. Prevents duplicate schedules for the same agent-lead pair.',
  })
  @ApiParam({
    name: 'organisationId',
    description: 'Organisation ID (ULID format)',
    example: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
  })
  @ApiBody({
    type: CreateAgentLeadCallScheduleDto,
    description: 'Call schedule data',
    examples: {
      'Initial Call': {
        value: {
          type: 'INITIAL',
          agentId: '01HZXYZ1234567890ABCDEFGHJK',
          leadId: '01HZXYZ1234567890ABCDEFGHJL',
          callTime: '2024-12-31T10:00:00Z',
        },
      },
      'Follow-up Call': {
        value: {
          type: 'FOLLOW_UP',
          agentId: '01HZXYZ1234567890ABCDEFGHJK',
          leadId: '01HZXYZ1234567890ABCDEFGHJL',
          callTime: '2025-01-15T14:30:00Z',
        },
      },
      'Rescheduled Call': {
        value: {
          type: 'RESCHEDULE',
          agentId: '01HZXYZ1234567890ABCDEFGHJK',
          leadId: '01HZXYZ1234567890ABCDEFGHJL',
          callTime: '2025-01-20T09:00:00Z',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Schedule created successfully',
    schema: {
      example: {
        data: {
          id: '01HZXYZ1234567890ABCDEFGHJK',
          type: 'INITIAL',
          agentId: '01HZXYZ1234567890ABCDEFGHJK',
          leadId: '01HZXYZ1234567890ABCDEFGHJL',
          callTime: '2024-12-31T10:00:00.000Z',
          createdAt: '2024-01-15T10:30:00.000Z',
          updatedAt: '2024-01-15T10:30:00.000Z',
          deletedAt: null,
        },
        statusCode: 201,
        timestamp: '2024-01-15T10:30:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Agent or lead not found' })
  @ApiResponse({ status: 409, description: 'Schedule already exists for this agent-lead pair' })
  create(
    @Param('organisationId') organisationId: string,
    @Body() createDto: CreateAgentLeadCallScheduleDto,
    @CurrentUser() user: UserPayload,
  ) {
    return this.scheduleService.create(createDto, organisationId, user.sub, user.isSuperAdmin);
  }

  @Get()
  @UseGuards(RbacGuard)
  @Roles(Role.OWNER, Role.ADMIN, Role.MEMBER)
  @ApiOperation({
    summary: 'Get all call schedules in organisation',
    description: 'Retrieve call schedules with advanced filtering. Supports filtering by type, agent, lead, date range, and limiting results. Useful for building calendar views and schedule management interfaces.',
  })
  @ApiParam({
    name: 'organisationId',
    description: 'Organisation ID (ULID format)',
    example: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
  })
  @ApiQuery({
    name: 'type',
    required: false,
    description: 'Filter by schedule type',
    enum: ['INITIAL', 'FOLLOW_UP', 'RESCHEDULE'],
    example: 'INITIAL',
  })
  @ApiQuery({
    name: 'agentId',
    required: false,
    description: 'Filter by Agent ID (ULID format)',
    example: '01HZXYZ1234567890ABCDEFGHJK',
  })
  @ApiQuery({
    name: 'leadId',
    required: false,
    description: 'Filter by Lead ID (ULID format)',
    example: '01HZXYZ1234567890ABCDEFGHJL',
  })
  @ApiQuery({
    name: 'startDateTime',
    required: false,
    description: 'Filter schedules after this date/time (ISO 8601 format)',
    example: '2024-12-01T00:00:00Z',
  })
  @ApiQuery({
    name: 'endDateTime',
    required: false,
    description: 'Filter schedules before this date/time (ISO 8601 format)',
    example: '2024-12-31T23:59:59Z',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Maximum number of schedules to return',
    type: Number,
    example: 100,
  })
  @ApiResponse({
    status: 200,
    description: 'Schedules retrieved successfully',
    schema: {
      example: {
        data: [
          {
            id: '01HZXYZ1234567890ABCDEFGHJK',
            type: 'INITIAL',
            agentId: '01HZXYZ1234567890ABCDEFGHJK',
            leadId: '01HZXYZ1234567890ABCDEFGHJL',
            callTime: '2024-12-31T10:00:00.000Z',
            createdAt: '2024-01-15T10:30:00.000Z',
            updatedAt: '2024-01-15T10:30:00.000Z',
            deletedAt: null,
          },
          {
            id: '01HZXYZ1234567890ABCDEFGHJM',
            type: 'FOLLOW_UP',
            agentId: '01HZXYZ1234567890ABCDEFGHJK',
            leadId: '01HZXYZ1234567890ABCDEFGHJN',
            callTime: '2025-01-15T14:30:00.000Z',
            createdAt: '2024-01-15T11:00:00.000Z',
            updatedAt: '2024-01-15T11:00:00.000Z',
            deletedAt: null,
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
    @Query('type') type?: string,
    @Query('agentId') agentId?: string,
    @Query('leadId') leadId?: string,
    @Query('startDateTime') startDateTime?: string,
    @Query('endDateTime') endDateTime?: string,
    @Query('limit') limit?: string,
    @CurrentUser() user?: UserPayload,
  ) {
    const limitNumber = limit ? parseInt(limit, 10) : undefined;
    return this.scheduleService.findAll(
      organisationId,
      user!.sub,
      user!.isSuperAdmin,
      type,
      agentId,
      leadId,
      startDateTime,
      endDateTime,
      limitNumber,
    );
  }

  @Get(':id')
  @UseGuards(RbacGuard)
  @Roles(Role.OWNER, Role.ADMIN, Role.MEMBER)
  @ApiOperation({
    summary: 'Get call schedule by ID',
    description: 'Retrieve a specific call schedule by its ID.',
  })
  @ApiParam({
    name: 'organisationId',
    description: 'Organisation ID (ULID format)',
    example: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
  })
  @ApiParam({
    name: 'id',
    description: 'Schedule ID (ULID format)',
    example: '01HZXYZ1234567890ABCDEFGHJK',
  })
  @ApiResponse({
    status: 200,
    description: 'Schedule retrieved successfully',
    schema: {
      example: {
        data: {
          id: '01HZXYZ1234567890ABCDEFGHJK',
          type: 'INITIAL',
          agentId: '01HZXYZ1234567890ABCDEFGHJK',
          leadId: '01HZXYZ1234567890ABCDEFGHJL',
          callTime: '2024-12-31T10:00:00.000Z',
          createdAt: '2024-01-15T10:30:00.000Z',
          updatedAt: '2024-01-15T10:30:00.000Z',
          deletedAt: null,
        },
        statusCode: 200,
        timestamp: '2024-01-15T10:30:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Schedule not found' })
  findOne(
    @Param('organisationId') organisationId: string,
    @Param('id') id: string,
    @CurrentUser() user: UserPayload,
  ) {
    return this.scheduleService.findOne(id, organisationId, user.sub, user.isSuperAdmin);
  }

  @Patch(':id')
  @UseGuards(RbacGuard)
  @Roles(Role.OWNER, Role.ADMIN, Role.MEMBER)
  @ApiOperation({
    summary: 'Update call schedule',
    description: 'Update a call schedule. Typically used to reschedule calls or change the schedule type.',
  })
  @ApiParam({
    name: 'organisationId',
    description: 'Organisation ID (ULID format)',
    example: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
  })
  @ApiParam({
    name: 'id',
    description: 'Schedule ID (ULID format)',
    example: '01HZXYZ1234567890ABCDEFGHJK',
  })
  @ApiBody({
    type: UpdateAgentLeadCallScheduleDto,
    description: 'Schedule update data. All fields are optional.',
    examples: {
      'Reschedule Time': {
        value: {
          callTime: '2025-01-20T09:00:00Z',
        },
      },
      'Change Type and Time': {
        value: {
          type: 'RESCHEDULE',
          callTime: '2025-01-20T09:00:00Z',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Schedule updated successfully',
    schema: {
      example: {
        data: {
          id: '01HZXYZ1234567890ABCDEFGHJK',
          type: 'RESCHEDULE',
          agentId: '01HZXYZ1234567890ABCDEFGHJK',
          leadId: '01HZXYZ1234567890ABCDEFGHJL',
          callTime: '2025-01-20T09:00:00.000Z',
          createdAt: '2024-01-15T10:30:00.000Z',
          updatedAt: '2024-01-15T14:45:00.000Z',
          deletedAt: null,
        },
        statusCode: 200,
        timestamp: '2024-01-15T14:45:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Schedule not found' })
  update(
    @Param('organisationId') organisationId: string,
    @Param('id') id: string,
    @Body() updateDto: UpdateAgentLeadCallScheduleDto,
    @CurrentUser() user: UserPayload,
  ) {
    return this.scheduleService.update(
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
    summary: 'Delete call schedule (soft delete)',
    description: 'Soft delete a call schedule. The schedule is marked as deleted but not removed from the database. Only OWNER and ADMIN roles can delete schedules.',
  })
  @ApiParam({
    name: 'organisationId',
    description: 'Organisation ID (ULID format)',
    example: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
  })
  @ApiParam({
    name: 'id',
    description: 'Schedule ID (ULID format)',
    example: '01HZXYZ1234567890ABCDEFGHJK',
  })
  @ApiResponse({
    status: 200,
    description: 'Schedule deleted successfully',
    schema: {
      example: {
        data: {
          id: '01HZXYZ1234567890ABCDEFGHJK',
          type: 'INITIAL',
          agentId: '01HZXYZ1234567890ABCDEFGHJK',
          leadId: '01HZXYZ1234567890ABCDEFGHJL',
          callTime: '2024-12-31T10:00:00.000Z',
          createdAt: '2024-01-15T10:30:00.000Z',
          updatedAt: '2024-01-15T15:00:00.000Z',
          deletedAt: '2024-01-15T15:00:00.000Z',
        },
        statusCode: 200,
        timestamp: '2024-01-15T15:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Only OWNER and ADMIN can delete schedules' })
  @ApiResponse({ status: 404, description: 'Schedule not found' })
  remove(
    @Param('organisationId') organisationId: string,
    @Param('id') id: string,
    @CurrentUser() user: UserPayload,
  ) {
    return this.scheduleService.remove(id, organisationId, user.sub, user.isSuperAdmin);
  }
}

