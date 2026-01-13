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
import { CallMessageService } from './call-message.service';
import { CreateCallMessageDto, CreateBulkCallMessageDto } from './dto/create-call-message.dto';
import { UpdateCallMessageDto } from './dto/update-call-message.dto';
import { QueryCallMessageDto } from './dto/query-call-message.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RbacGuard } from '../common/guards/rbac.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Role } from '../common/enums';
import type { UserPayload } from '../common/interfaces/request-with-user.interface';

@ApiTags('Call Message')
@ApiBearerAuth('JWT-auth')
@Controller({ path: 'organisation/:organisationId/call/:callId/message', version: '1' })
@UseGuards(JwtAuthGuard)
export class CallMessageController {
  constructor(private readonly callMessageService: CallMessageService) {}

  @Post()
  @UseGuards(RbacGuard)
  @Roles(Role.OWNER, Role.ADMIN, Role.MEMBER)
  @ApiOperation({ summary: 'Create a new call message' })
  @ApiParam({ name: 'organisationId', description: 'Organisation ID' })
  @ApiParam({ name: 'callId', description: 'Call ID' })
  @ApiResponse({ status: 201, description: 'Call message created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  create(
    @Param('organisationId') organisationId: string,
    @Param('callId') callId: string,
    @Body() createCallMessageDto: CreateCallMessageDto,
    @CurrentUser() user: UserPayload,
  ) {
    // Ensure IDs from params match body
    createCallMessageDto.organisationId = organisationId;
    createCallMessageDto.callId = callId;
    return this.callMessageService.create(createCallMessageDto, user.sub, user.isSuperAdmin);
  }

  @Post('bulk')
  @UseGuards(RbacGuard)
  @Roles(Role.OWNER, Role.ADMIN, Role.MEMBER)
  @ApiOperation({ summary: 'Create multiple call messages in bulk' })
  @ApiParam({ name: 'organisationId', description: 'Organisation ID' })
  @ApiParam({ name: 'callId', description: 'Call ID' })
  @ApiResponse({ status: 201, description: 'Call messages created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  createBulk(
    @Param('organisationId') organisationId: string,
    @Param('callId') callId: string,
    @Body() createBulkCallMessageDto: CreateBulkCallMessageDto,
    @CurrentUser() user: UserPayload,
  ) {
    return this.callMessageService.createMany(
      callId,
      organisationId,
      createBulkCallMessageDto,
      user.sub,
      user.isSuperAdmin,
    );
  }

  @Get()
  @UseGuards(RbacGuard)
  @Roles(Role.OWNER, Role.ADMIN, Role.MEMBER)
  @ApiOperation({ summary: 'Get all messages in a call with pagination' })
  @ApiParam({ name: 'organisationId', description: 'Organisation ID' })
  @ApiParam({ name: 'callId', description: 'Call ID' })
  @ApiResponse({ status: 200, description: 'Call messages retrieved successfully' })
  findAll(
    @Param('organisationId') organisationId: string,
    @Param('callId') callId: string,
    @Query() queryDto: QueryCallMessageDto,
    @CurrentUser() user: UserPayload,
  ) {
    return this.callMessageService.findAll(callId, organisationId, user.sub, user.isSuperAdmin, queryDto);
  }

  @Get(':id')
  @UseGuards(RbacGuard)
  @Roles(Role.OWNER, Role.ADMIN, Role.MEMBER)
  @ApiOperation({ summary: 'Get call message by ID' })
  @ApiParam({ name: 'organisationId', description: 'Organisation ID' })
  @ApiParam({ name: 'callId', description: 'Call ID' })
  @ApiParam({ name: 'id', description: 'Call Message ID' })
  @ApiResponse({ status: 200, description: 'Call message retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Call message not found' })
  findOne(
    @Param('organisationId') organisationId: string,
    @Param('callId') callId: string,
    @Param('id') id: string,
    @CurrentUser() user: UserPayload,
  ) {
    return this.callMessageService.findOne(id, callId, organisationId, user.sub, user.isSuperAdmin);
  }

  @Patch(':id')
  @UseGuards(RbacGuard)
  @Roles(Role.OWNER, Role.ADMIN, Role.MEMBER)
  @ApiOperation({ summary: 'Update call message' })
  @ApiParam({ name: 'organisationId', description: 'Organisation ID' })
  @ApiParam({ name: 'callId', description: 'Call ID' })
  @ApiParam({ name: 'id', description: 'Call Message ID' })
  @ApiResponse({ status: 200, description: 'Call message updated successfully' })
  @ApiResponse({ status: 404, description: 'Call message not found' })
  update(
    @Param('organisationId') organisationId: string,
    @Param('callId') callId: string,
    @Param('id') id: string,
    @Body() updateCallMessageDto: UpdateCallMessageDto,
    @CurrentUser() user: UserPayload,
  ) {
    return this.callMessageService.update(
      id,
      callId,
      organisationId,
      updateCallMessageDto,
      user.sub,
      user.isSuperAdmin,
    );
  }

  @Delete(':id')
  @UseGuards(RbacGuard)
  @Roles(Role.OWNER, Role.ADMIN)
  @ApiOperation({ summary: 'Delete call message (soft delete)' })
  @ApiParam({ name: 'organisationId', description: 'Organisation ID' })
  @ApiParam({ name: 'callId', description: 'Call ID' })
  @ApiParam({ name: 'id', description: 'Call Message ID' })
  @ApiResponse({ status: 200, description: 'Call message deleted successfully' })
  @ApiResponse({ status: 404, description: 'Call message not found' })
  remove(
    @Param('organisationId') organisationId: string,
    @Param('callId') callId: string,
    @Param('id') id: string,
    @CurrentUser() user: UserPayload,
  ) {
    return this.callMessageService.remove(id, callId, organisationId, user.sub, user.isSuperAdmin);
  }
}

