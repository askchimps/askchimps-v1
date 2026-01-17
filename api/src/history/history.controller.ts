import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Query,
    UseGuards,
} from '@nestjs/common';
import {
    ApiTags,
    ApiBearerAuth,
    ApiOperation,
    ApiParam,
    ApiResponse,
    ApiQuery,
    ApiBody,
} from '@nestjs/swagger';
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
    @ApiOperation({
        summary: 'Create a history record (Admin only)',
        description:
            'Create a single audit history record. This endpoint is typically used by system integrations to log changes. Only OWNER and ADMIN roles can create history records manually.',
    })
    @ApiParam({
        name: 'organisationId',
        description: 'Organisation ID (ULID format)',
        example: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
    })
    @ApiBody({
        type: CreateHistoryDto,
        description: 'History record data',
        examples: {
            'Field Update': {
                value: {
                    tableName: 'organisations',
                    recordId: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
                    action: 'UPDATE',
                    trigger: 'USER_ACTION',
                    userId: '01HZXYZ1234567890ABCDEFGHJK',
                    userEmail: 'admin@example.com',
                    userName: 'John Admin',
                    fieldName: 'name',
                    oldValue: 'Old Company Name',
                    newValue: 'New Company Name',
                    reason: 'Company rebranding',
                    description:
                        'Organisation name was updated from "Old Company Name" to "New Company Name"',
                    requestId: 'req_123456789',
                    ipAddress: '192.168.1.1',
                    apiEndpoint: '/v1/organisation/01ARZ3NDEKTSV4RRFFQ69G5FAV',
                    httpMethod: 'PATCH',
                },
            },
            'Record Creation': {
                value: {
                    tableName: 'leads',
                    recordId: '01HZXYZ1234567890ABCDEFGHJL',
                    action: 'CREATE',
                    trigger: 'API_CALL',
                    userId: '01HZXYZ1234567890ABCDEFGHJK',
                    organisationId: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
                    description: 'New lead created via API',
                    requestId: 'req_987654321',
                },
            },
        },
    })
    @ApiResponse({
        status: 201,
        description: 'History record created successfully',
        schema: {
            example: {
                data: {
                    id: '01HZXYZ1234567890ABCDEFGHJK',
                    tableName: 'organisations',
                    recordId: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
                    action: 'UPDATE',
                    trigger: 'USER_ACTION',
                    userId: '01HZXYZ1234567890ABCDEFGHJK',
                    userEmail: 'admin@example.com',
                    userName: 'John Admin',
                    fieldName: 'name',
                    oldValue: 'Old Company Name',
                    newValue: 'New Company Name',
                    reason: 'Company rebranding',
                    description: 'Organisation name was updated',
                    createdAt: '2024-01-15T10:30:00.000Z',
                },
                statusCode: 201,
                timestamp: '2024-01-15T10:30:00.000Z',
            },
        },
    })
    @ApiResponse({ status: 400, description: 'Invalid input data' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({
        status: 403,
        description:
            'Forbidden - Only OWNER and ADMIN can create history records',
    })
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
    @ApiOperation({
        summary: 'Bulk create multiple history records (Admin only)',
        description:
            'Create multiple audit history records in a single transaction. Useful for importing historical data or batch logging changes.',
    })
    @ApiParam({
        name: 'organisationId',
        description: 'Organisation ID (ULID format)',
        example: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
    })
    @ApiBody({
        type: BulkCreateHistoryDto,
        description: 'Array of history records to create',
        examples: {
            'Multiple Updates': {
                value: {
                    records: [
                        {
                            tableName: 'organisations',
                            recordId: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
                            action: 'UPDATE',
                            trigger: 'USER_ACTION',
                            fieldName: 'name',
                            oldValue: 'Old Name',
                            newValue: 'New Name',
                        },
                        {
                            tableName: 'organisations',
                            recordId: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
                            action: 'UPDATE',
                            trigger: 'USER_ACTION',
                            fieldName: 'email',
                            oldValue: 'old@example.com',
                            newValue: 'new@example.com',
                        },
                    ],
                },
            },
        },
    })
    @ApiResponse({
        status: 201,
        description: 'History records created successfully',
        schema: {
            example: {
                data: {
                    count: 2,
                    records: [
                        {
                            id: '01HZXYZ1234567890ABCDEFGHJK',
                            tableName: 'organisations',
                            recordId: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
                            action: 'UPDATE',
                            trigger: 'USER_ACTION',
                            fieldName: 'name',
                            oldValue: 'Old Name',
                            newValue: 'New Name',
                            createdAt: '2024-01-15T10:30:00.000Z',
                        },
                        {
                            id: '01HZXYZ1234567890ABCDEFGHJL',
                            tableName: 'organisations',
                            recordId: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
                            action: 'UPDATE',
                            trigger: 'USER_ACTION',
                            fieldName: 'email',
                            oldValue: 'old@example.com',
                            newValue: 'new@example.com',
                            createdAt: '2024-01-15T10:30:01.000Z',
                        },
                    ],
                },
                statusCode: 201,
                timestamp: '2024-01-15T10:30:00.000Z',
            },
        },
    })
    @ApiResponse({ status: 400, description: 'Invalid input data' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({
        status: 403,
        description:
            'Forbidden - Only OWNER and ADMIN can create history records',
    })
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
    @ApiOperation({
        summary: 'Query history records with filters',
        description:
            'Retrieve audit history records with advanced filtering options. Supports filtering by table, record, field, action, trigger, user, date range, and more. Results are paginated and sorted by creation time.',
    })
    @ApiParam({
        name: 'organisationId',
        description: 'Organisation ID (ULID format)',
        example: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
    })
    @ApiQuery({ type: QueryHistoryDto })
    @ApiResponse({
        status: 200,
        description: 'History records retrieved successfully',
        schema: {
            example: {
                data: {
                    records: [
                        {
                            id: '01HZXYZ1234567890ABCDEFGHJK',
                            tableName: 'organisations',
                            recordId: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
                            action: 'UPDATE',
                            trigger: 'USER_ACTION',
                            userId: '01HZXYZ1234567890ABCDEFGHJK',
                            userEmail: 'admin@example.com',
                            userName: 'John Admin',
                            fieldName: 'name',
                            oldValue: 'Old Name',
                            newValue: 'New Name',
                            reason: 'Company rebranding',
                            description: 'Organisation name was updated',
                            createdAt: '2024-01-15T10:30:00.000Z',
                        },
                    ],
                    total: 1,
                    limit: 50,
                    offset: 0,
                },
                statusCode: 200,
                timestamp: '2024-01-15T10:30:00.000Z',
            },
        },
    })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({
        status: 403,
        description: 'Forbidden - Insufficient permissions',
    })
    findAll(
        @Param('organisationId') organisationId: string,
        @Query() queryDto: QueryHistoryDto,
        @CurrentUser() user: UserPayload,
    ) {
        // Ensure organisation ID filter is applied
        queryDto.organisationId = organisationId;
        return this.historyService.findAll(
            queryDto,
            user.sub,
            user.isSuperAdmin,
        );
    }

    @Get('record/:tableName/:recordId')
    @UseGuards(RbacGuard)
    @Roles(Role.OWNER, Role.ADMIN, Role.MEMBER)
    @ApiOperation({
        summary: 'Get history for a specific record',
        description:
            'Retrieve the complete audit history for a specific record. Shows all changes made to the record over time.',
    })
    @ApiParam({
        name: 'organisationId',
        description: 'Organisation ID (ULID format)',
        example: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
    })
    @ApiParam({
        name: 'tableName',
        description: 'Table name (e.g., organisations, leads, calls, chats)',
        example: 'organisations',
    })
    @ApiParam({
        name: 'recordId',
        description: 'Record ID (ULID format)',
        example: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
    })
    @ApiResponse({
        status: 200,
        description: 'History records retrieved successfully',
        schema: {
            example: {
                data: [
                    {
                        id: '01HZXYZ1234567890ABCDEFGHJK',
                        tableName: 'organisations',
                        recordId: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
                        action: 'CREATE',
                        trigger: 'USER_ACTION',
                        userId: '01HZXYZ1234567890ABCDEFGHJK',
                        description: 'Organisation created',
                        createdAt: '2024-01-15T09:00:00.000Z',
                    },
                    {
                        id: '01HZXYZ1234567890ABCDEFGHJL',
                        tableName: 'organisations',
                        recordId: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
                        action: 'UPDATE',
                        trigger: 'USER_ACTION',
                        userId: '01HZXYZ1234567890ABCDEFGHJK',
                        fieldName: 'name',
                        oldValue: 'Old Name',
                        newValue: 'New Name',
                        description: 'Organisation name updated',
                        createdAt: '2024-01-15T10:30:00.000Z',
                    },
                ],
                statusCode: 200,
                timestamp: '2024-01-15T10:30:00.000Z',
            },
        },
    })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({
        status: 403,
        description: 'Forbidden - Insufficient permissions',
    })
    findByRecord(
        @Param('organisationId') organisationId: string,
        @Param('tableName') tableName: string,
        @Param('recordId') recordId: string,
        @CurrentUser() user: UserPayload,
    ) {
        return this.historyService.findByRecord(
            tableName,
            recordId,
            user.sub,
            user.isSuperAdmin,
        );
    }
}
