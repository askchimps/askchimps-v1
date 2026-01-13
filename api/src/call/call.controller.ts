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
import { CallService } from './call.service';
import { CreateCallDto } from './dto/create-call.dto';
import { UpdateCallDto } from './dto/update-call.dto';
import { QueryCallDto } from './dto/query-call.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RbacGuard } from '../common/guards/rbac.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Role } from '../common/enums';
import type { UserPayload } from '../common/interfaces/request-with-user.interface';

@ApiTags('Call')
@ApiBearerAuth('JWT-auth')
@Controller({ path: 'organisation/:organisationId/call', version: '1' })
@UseGuards(JwtAuthGuard)
export class CallController {
  constructor(private readonly callService: CallService) {}

  @Post()
  @UseGuards(RbacGuard)
  @Roles(Role.OWNER, Role.ADMIN, Role.MEMBER)
  @ApiOperation({ summary: 'Create a new call' })
  @ApiParam({ name: 'organisationId', description: 'Organisation ID' })
  @ApiResponse({ status: 201, description: 'Call created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  create(
    @Param('organisationId') organisationId: string,
    @Body() createCallDto: CreateCallDto,
    @CurrentUser() user: UserPayload,
  ) {
    // Ensure organisation ID from params matches body
    createCallDto.organisationId = organisationId;
    return this.callService.create(createCallDto, user.sub, user.isSuperAdmin);
  }

  @Get()
  @UseGuards(RbacGuard)
  @Roles(Role.OWNER, Role.ADMIN, Role.MEMBER)
  @ApiOperation({ summary: 'Get all calls for organisation with pagination' })
  @ApiParam({ name: 'organisationId', description: 'Organisation ID' })
  @ApiResponse({ status: 200, description: 'Calls retrieved successfully' })
  findAll(
    @Param('organisationId') organisationId: string,
    @Query() queryDto: QueryCallDto,
    @CurrentUser() user: UserPayload,
  ) {
    return this.callService.findAll(organisationId, user.sub, user.isSuperAdmin, queryDto);
  }

  @Get(':id')
  @UseGuards(RbacGuard)
  @Roles(Role.OWNER, Role.ADMIN, Role.MEMBER)
  @ApiOperation({ summary: 'Get call by ID or External ID' })
  @ApiParam({ name: 'organisationId', description: 'Organisation ID' })
  @ApiParam({ name: 'id', description: 'Call ID (ULID) or External ID' })
  @ApiResponse({ status: 200, description: 'Call retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Call not found' })
  findOne(
    @Param('organisationId') organisationId: string,
    @Param('id') id: string,
    @CurrentUser() user: UserPayload,
  ) {
    return this.callService.findOne(id, organisationId, user.sub, user.isSuperAdmin);
  }

  @Patch(':id')
  @UseGuards(RbacGuard)
  @Roles(Role.OWNER, Role.ADMIN, Role.MEMBER)
  @ApiOperation({ summary: 'Update call by ID or External ID' })
  @ApiParam({ name: 'organisationId', description: 'Organisation ID' })
  @ApiParam({ name: 'id', description: 'Call ID (ULID) or External ID' })
  @ApiResponse({ status: 200, description: 'Call updated successfully' })
  @ApiResponse({ status: 404, description: 'Call not found' })
  update(
    @Param('organisationId') organisationId: string,
    @Param('id') id: string,
    @Body() updateCallDto: UpdateCallDto,
    @CurrentUser() user: UserPayload,
  ) {
    return this.callService.update(
      id,
      organisationId,
      updateCallDto,
      user.sub,
      user.isSuperAdmin,
    );
  }

  @Delete(':id')
  @UseGuards(RbacGuard)
  @Roles(Role.OWNER, Role.ADMIN)
  @ApiOperation({ summary: 'Delete call by ID or External ID (soft delete)' })
  @ApiParam({ name: 'organisationId', description: 'Organisation ID' })
  @ApiParam({ name: 'id', description: 'Call ID (ULID) or External ID' })
  @ApiResponse({ status: 200, description: 'Call deleted successfully' })
  @ApiResponse({ status: 404, description: 'Call not found' })
  remove(
    @Param('organisationId') organisationId: string,
    @Param('id') id: string,
    @CurrentUser() user: UserPayload,
  ) {
    return this.callService.remove(id, organisationId, user.sub, user.isSuperAdmin);
  }
}

