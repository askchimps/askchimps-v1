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
import { ApiTags, ApiBearerAuth, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
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
  @ApiOperation({ summary: 'Create a new execution' })
  @ApiParam({ name: 'organisationId', description: 'Organisation ID' })
  @ApiResponse({ status: 201, description: 'Execution created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input or execution ID already exists' })
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
  @ApiOperation({ summary: 'Get all executions for an organisation' })
  @ApiParam({ name: 'organisationId', description: 'Organisation ID' })
  @ApiResponse({ status: 200, description: 'Executions retrieved successfully' })
  findAll(
    @Param('organisationId') organisationId: string,
    @CurrentUser() user: UserPayload,
  ) {
    return this.executionService.findAll(organisationId, user.sub, user.isSuperAdmin);
  }

  @Get(':id')
  @UseGuards(RbacGuard)
  @Roles(Role.OWNER, Role.ADMIN, Role.MEMBER)
  @ApiOperation({ summary: 'Get execution by ID or External ID' })
  @ApiParam({ name: 'organisationId', description: 'Organisation ID' })
  @ApiParam({ name: 'id', description: 'Execution ID (ULID) or External ID' })
  @ApiResponse({ status: 200, description: 'Execution retrieved successfully' })
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
  @ApiOperation({ summary: 'Update execution by ID or External ID' })
  @ApiParam({ name: 'organisationId', description: 'Organisation ID' })
  @ApiParam({ name: 'id', description: 'Execution ID (ULID) or External ID' })
  @ApiResponse({ status: 200, description: 'Execution updated successfully' })
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
  @ApiOperation({ summary: 'Delete execution by ID or External ID (hard delete)' })
  @ApiParam({ name: 'organisationId', description: 'Organisation ID' })
  @ApiParam({ name: 'id', description: 'Execution ID (ULID) or External ID' })
  @ApiResponse({ status: 200, description: 'Execution deleted successfully' })
  @ApiResponse({ status: 404, description: 'Execution not found' })
  remove(
    @Param('organisationId') organisationId: string,
    @Param('id') id: string,
    @CurrentUser() user: UserPayload,
  ) {
    return this.executionService.remove(id, organisationId, user.sub, user.isSuperAdmin);
  }
}

