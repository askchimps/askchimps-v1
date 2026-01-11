import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { HistoryService } from './history.service';
import { CreateHistoryDto } from './dto/create-history.dto';
import { BulkCreateHistoryDto } from './dto/bulk-create-history.dto';
import { QueryHistoryDto } from './dto/query-history.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RbacGuard } from '../common/guards/rbac.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Role } from '../common/enums';
import type { UserPayload } from '../common/interfaces/request-with-user.interface';

@ApiTags('History')
@ApiBearerAuth('JWT-auth')
@Controller({ path: 'organisation/:organisationId/history', version: '1' })
@UseGuards(JwtAuthGuard)
export class HistoryController {
  constructor(private readonly historyService: HistoryService) {}

  @Post()
  @UseGuards(RbacGuard)
  @Roles(Role.OWNER, Role.ADMIN)
  @ApiOperation({ summary: 'Create a history record (Admin only)' })
  @ApiParam({ name: 'organisationId', description: 'Organisation ID' })
  @ApiResponse({ status: 201, description: 'History record created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  create(
    @Param('organisationId') organisationId: string,
    @Body() createHistoryDto: CreateHistoryDto,
    @CurrentUser() user: UserPayload,
  ) {
    // Ensure organisation ID from params is used
    createHistoryDto.organisationId = organisationId;
    return this.historyService.create(createHistoryDto);
  }

  @Post('bulk')
  @UseGuards(RbacGuard)
  @Roles(Role.OWNER, Role.ADMIN)
  @ApiOperation({ summary: 'Bulk create multiple history records (Admin only)' })
  @ApiParam({ name: 'organisationId', description: 'Organisation ID' })
  @ApiResponse({ status: 201, description: 'History records created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  bulkCreate(
    @Param('organisationId') organisationId: string,
    @Body() bulkCreateHistoryDto: BulkCreateHistoryDto,
    @CurrentUser() user: UserPayload,
  ) {
    // Ensure organisation ID from params is used for all records
    bulkCreateHistoryDto.records.forEach((record) => {
      record.organisationId = organisationId;
    });
    return this.historyService.bulkCreate(bulkCreateHistoryDto);
  }

  @Get()
  @UseGuards(RbacGuard)
  @Roles(Role.OWNER, Role.ADMIN, Role.MEMBER)
  @ApiOperation({ summary: 'Query history records with filters' })
  @ApiParam({ name: 'organisationId', description: 'Organisation ID' })
  @ApiResponse({ status: 200, description: 'History records retrieved successfully' })
  findAll(
    @Param('organisationId') organisationId: string,
    @Query() queryDto: QueryHistoryDto,
    @CurrentUser() user: UserPayload,
  ) {
    // Ensure organisation ID filter is applied
    queryDto.organisationId = organisationId;
    return this.historyService.findAll(queryDto, user.sub, user.isSuperAdmin);
  }

  @Get('record/:tableName/:recordId')
  @UseGuards(RbacGuard)
  @Roles(Role.OWNER, Role.ADMIN, Role.MEMBER)
  @ApiOperation({ summary: 'Get history for a specific record' })
  @ApiParam({ name: 'organisationId', description: 'Organisation ID' })
  @ApiParam({ name: 'tableName', description: 'Table name' })
  @ApiParam({ name: 'recordId', description: 'Record ID' })
  @ApiResponse({ status: 200, description: 'History records retrieved successfully' })
  findByRecord(
    @Param('organisationId') organisationId: string,
    @Param('tableName') tableName: string,
    @Param('recordId') recordId: string,
    @CurrentUser() user: UserPayload,
  ) {
    return this.historyService.findByRecord(tableName, recordId, user.sub, user.isSuperAdmin);
  }
}

