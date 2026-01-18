import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBearerAuth,
    ApiParam,
} from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { MonthQueryDto } from './dto/analytics-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RbacGuard } from '../common/guards/rbac.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

@ApiTags('Analytics')
@ApiBearerAuth('JWT-auth')
@Controller({ path: 'organisation/:organisationId/analytics', version: '1' })
@UseGuards(JwtAuthGuard, RbacGuard)
@Roles(Role.OWNER, Role.ADMIN, Role.MEMBER)
export class AnalyticsController {
    constructor(private readonly analyticsService: AnalyticsService) {}

    @Get('total-leads')
    @ApiOperation({
        summary: 'Get total leads for a month',
        description:
            'Retrieve total number of leads for a specific month. Defaults to current month if not specified.',
    })
    @ApiParam({
        name: 'organisationId',
        description: 'Organisation ID (ULID format)',
        example: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
    })
    @ApiResponse({
        status: 200,
        description: 'Total leads retrieved successfully',
    })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({
        status: 403,
        description: 'Forbidden - Insufficient permissions',
    })
    async getTotalLeads(
        @Param('organisationId') organisationId: string,
        @Query() query: MonthQueryDto,
        @CurrentUser() user: JwtPayload,
    ) {
        return this.analyticsService.getTotalLeadsForMonth(
            organisationId,
            query.month,
        );
    }

    @Get('total-calls')
    @ApiOperation({
        summary: 'Get total calls for a month',
        description:
            'Retrieve total number of calls for a specific month. Defaults to current month if not specified.',
    })
    @ApiParam({
        name: 'organisationId',
        description: 'Organisation ID (ULID format)',
        example: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
    })
    @ApiResponse({
        status: 200,
        description: 'Total calls retrieved successfully',
    })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({
        status: 403,
        description: 'Forbidden - Insufficient permissions',
    })
    async getTotalCalls(
        @Param('organisationId') organisationId: string,
        @Query() query: MonthQueryDto,
        @CurrentUser() user: JwtPayload,
    ) {
        return this.analyticsService.getTotalCallsForMonth(
            organisationId,
            query.month,
        );
    }

    @Get('total-chats')
    @ApiOperation({
        summary: 'Get total chats for a month',
        description:
            'Retrieve total number of chats for a specific month. Defaults to current month if not specified.',
    })
    @ApiParam({
        name: 'organisationId',
        description: 'Organisation ID (ULID format)',
        example: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
    })
    @ApiResponse({
        status: 200,
        description: 'Total chats retrieved successfully',
    })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({
        status: 403,
        description: 'Forbidden - Insufficient permissions',
    })
    async getTotalChats(
        @Param('organisationId') organisationId: string,
        @Query() query: MonthQueryDto,
        @CurrentUser() user: JwtPayload,
    ) {
        return this.analyticsService.getTotalChatsForMonth(
            organisationId,
            query.month,
        );
    }

    @Get('call-activity')
    @ApiOperation({
        summary: 'Get call activity by hour for a month',
        description:
            'Retrieve hourly call activity for a specific month. Defaults to current month if not specified.',
    })
    @ApiParam({
        name: 'organisationId',
        description: 'Organisation ID (ULID format)',
        example: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
    })
    @ApiResponse({
        status: 200,
        description: 'Call activity data retrieved successfully',
    })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({
        status: 403,
        description: 'Forbidden - Insufficient permissions',
    })
    async getCallActivity(
        @Param('organisationId') organisationId: string,
        @Query() query: MonthQueryDto,
        @CurrentUser() user: JwtPayload,
    ) {
        return this.analyticsService.getCallActivityByHour(
            organisationId,
            query.month,
        );
    }

    @Get('chat-activity')
    @ApiOperation({
        summary: 'Get chat activity by hour for a month',
        description:
            'Retrieve hourly chat activity for a specific month. Defaults to current month if not specified.',
    })
    @ApiParam({
        name: 'organisationId',
        description: 'Organisation ID (ULID format)',
        example: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
    })
    @ApiResponse({
        status: 200,
        description: 'Chat activity data retrieved successfully',
    })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({
        status: 403,
        description: 'Forbidden - Insufficient permissions',
    })
    async getChatActivity(
        @Param('organisationId') organisationId: string,
        @Query() query: MonthQueryDto,
        @CurrentUser() user: JwtPayload,
    ) {
        return this.analyticsService.getChatActivityByHour(
            organisationId,
            query.month,
        );
    }

    @Get('call-pickup-rate')
    @ApiOperation({
        summary: 'Get call pickup rate per day for a month',
        description:
            'Retrieve daily call pickup rate for a specific month. Defaults to current month if not specified.',
    })
    @ApiParam({
        name: 'organisationId',
        description: 'Organisation ID (ULID format)',
        example: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
    })
    @ApiResponse({
        status: 200,
        description: 'Call pickup rate data retrieved successfully',
    })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({
        status: 403,
        description: 'Forbidden - Insufficient permissions',
    })
    async getCallPickupRate(
        @Param('organisationId') organisationId: string,
        @Query() query: MonthQueryDto,
        @CurrentUser() user: JwtPayload,
    ) {
        return this.analyticsService.getCallPickupRatePerDayForMonth(
            organisationId,
            query.month,
        );
    }

    @Get('avg-call-duration')
    @ApiOperation({
        summary: 'Get average call duration per day for a month',
        description:
            'Retrieve daily average call duration for a specific month. Defaults to current month if not specified.',
    })
    @ApiParam({
        name: 'organisationId',
        description: 'Organisation ID (ULID format)',
        example: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
    })
    @ApiResponse({
        status: 200,
        description: 'Average call duration data retrieved successfully',
    })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({
        status: 403,
        description: 'Forbidden - Insufficient permissions',
    })
    async getAvgCallDuration(
        @Param('organisationId') organisationId: string,
        @Query() query: MonthQueryDto,
        @CurrentUser() user: JwtPayload,
    ) {
        return this.analyticsService.getAvgCallDurationPerDayForMonth(
            organisationId,
            query.month,
        );
    }
}
