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
import { ApiTags, ApiBearerAuth, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { AgentService } from './agent.service';
import { CreateAgentDto } from './dto/create-agent.dto';
import { UpdateAgentDto } from './dto/update-agent.dto';
import { QueryAgentDto } from './dto/query-agent.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RbacGuard } from '../common/guards/rbac.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Role } from '../common/enums';
import type { UserPayload } from '../common/interfaces/request-with-user.interface';

@ApiTags('Agent')
@ApiBearerAuth('JWT-auth')
@Controller({ path: 'organisation/:organisationId/agent', version: '1' })
@UseGuards(JwtAuthGuard)
export class AgentController {
  constructor(private readonly agentService: AgentService) {}

  @Post()
  @UseGuards(RbacGuard)
  @Roles(Role.OWNER, Role.ADMIN)
  @ApiOperation({ summary: 'Create a new agent' })
  @ApiParam({ name: 'organisationId', description: 'Organisation ID' })
  @ApiResponse({ status: 201, description: 'Agent created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 409, description: 'Agent slug already exists' })
  create(
    @Param('organisationId') organisationId: string,
    @Body() createAgentDto: CreateAgentDto,
    @CurrentUser() user: UserPayload,
  ) {
    // Ensure organisationId from params matches body
    createAgentDto.organisationId = organisationId;
    return this.agentService.create(createAgentDto, user.sub, user.isSuperAdmin);
  }

  @Get()
  @UseGuards(RbacGuard)
  @Roles(Role.OWNER, Role.ADMIN, Role.MEMBER)
  @ApiOperation({ summary: 'Get all agents in organisation with pagination' })
  @ApiParam({ name: 'organisationId', description: 'Organisation ID' })
  @ApiResponse({ status: 200, description: 'Agents retrieved successfully' })
  findAll(
    @Param('organisationId') organisationId: string,
    @Query() queryDto: QueryAgentDto,
    @CurrentUser() user: UserPayload,
  ) {
    return this.agentService.findAll(organisationId, user.sub, user.isSuperAdmin, queryDto);
  }

  @Get(':id')
  @UseGuards(RbacGuard)
  @Roles(Role.OWNER, Role.ADMIN, Role.MEMBER)
  @ApiOperation({ summary: 'Get agent by ID' })
  @ApiParam({ name: 'organisationId', description: 'Organisation ID' })
  @ApiParam({ name: 'id', description: 'Agent ID' })
  @ApiResponse({ status: 200, description: 'Agent retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Agent not found' })
  findOne(
    @Param('organisationId') organisationId: string,
    @Param('id') id: string,
    @CurrentUser() user: UserPayload,
  ) {
    return this.agentService.findOne(id, organisationId, user.sub, user.isSuperAdmin);
  }

  @Patch(':id')
  @UseGuards(RbacGuard)
  @Roles(Role.OWNER, Role.ADMIN)
  @ApiOperation({ summary: 'Update agent' })
  @ApiParam({ name: 'organisationId', description: 'Organisation ID' })
  @ApiParam({ name: 'id', description: 'Agent ID' })
  @ApiResponse({ status: 200, description: 'Agent updated successfully' })
  @ApiResponse({ status: 404, description: 'Agent not found' })
  update(
    @Param('organisationId') organisationId: string,
    @Param('id') id: string,
    @Body() updateAgentDto: UpdateAgentDto,
    @CurrentUser() user: UserPayload,
  ) {
    return this.agentService.update(
      id,
      organisationId,
      updateAgentDto,
      user.sub,
      user.isSuperAdmin,
    );
  }

  @Delete(':id')
  @UseGuards(RbacGuard)
  @Roles(Role.OWNER, Role.ADMIN)
  @ApiOperation({ summary: 'Delete agent (soft delete)' })
  @ApiParam({ name: 'organisationId', description: 'Organisation ID' })
  @ApiParam({ name: 'id', description: 'Agent ID' })
  @ApiResponse({ status: 200, description: 'Agent deleted successfully' })
  @ApiResponse({ status: 404, description: 'Agent not found' })
  remove(
    @Param('organisationId') organisationId: string,
    @Param('id') id: string,
    @CurrentUser() user: UserPayload,
  ) {
    return this.agentService.remove(id, organisationId, user.sub, user.isSuperAdmin);
  }
}

