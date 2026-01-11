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
import { ApiTags, ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiQuery } from '@nestjs/swagger';
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
  @ApiOperation({ summary: 'Create a new call schedule' })
  @ApiParam({ name: 'organisationId', description: 'Organisation ID' })
  @ApiResponse({ status: 201, description: 'Schedule created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 409, description: 'Schedule already exists' })
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
  @ApiOperation({ summary: 'Get all call schedules in organisation' })
  @ApiParam({ name: 'organisationId', description: 'Organisation ID' })
  @ApiQuery({ name: 'agentId', required: false, description: 'Filter by Agent ID' })
  @ApiQuery({ name: 'leadId', required: false, description: 'Filter by Lead ID' })
  @ApiQuery({ name: 'startDateTime', required: false, description: 'Filter by start date time (ISO 8601 format)' })
  @ApiQuery({ name: 'endDateTime', required: false, description: 'Filter by end date time (ISO 8601 format)' })
  @ApiQuery({ name: 'limit', required: false, description: 'Maximum number of schedules to return', type: Number })
  @ApiResponse({ status: 200, description: 'Schedules retrieved successfully' })
  findAll(
    @Param('organisationId') organisationId: string,
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
  @ApiOperation({ summary: 'Get call schedule by ID' })
  @ApiParam({ name: 'organisationId', description: 'Organisation ID' })
  @ApiParam({ name: 'id', description: 'Schedule ID' })
  @ApiResponse({ status: 200, description: 'Schedule retrieved successfully' })
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
  @ApiOperation({ summary: 'Update call schedule' })
  @ApiParam({ name: 'organisationId', description: 'Organisation ID' })
  @ApiParam({ name: 'id', description: 'Schedule ID' })
  @ApiResponse({ status: 200, description: 'Schedule updated successfully' })
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
  @ApiOperation({ summary: 'Delete call schedule (soft delete)' })
  @ApiParam({ name: 'organisationId', description: 'Organisation ID' })
  @ApiParam({ name: 'id', description: 'Schedule ID' })
  @ApiResponse({ status: 200, description: 'Schedule deleted successfully' })
  @ApiResponse({ status: 404, description: 'Schedule not found' })
  remove(
    @Param('organisationId') organisationId: string,
    @Param('id') id: string,
    @CurrentUser() user: UserPayload,
  ) {
    return this.scheduleService.remove(id, organisationId, user.sub, user.isSuperAdmin);
  }
}

