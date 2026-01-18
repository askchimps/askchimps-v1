import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBearerAuth,
    ApiParam,
} from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { AnalyticsQueryDto } from './dto/analytics-query.dto';
import { AnalyticsData } from './entities/analytics.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RbacGuard } from '../common/guards/rbac.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

@ApiTags('Analytics')
@ApiBearerAuth('JWT-auth')
@Controller({ path: 'organisation/:organisationId/analytics', version: '1' })
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
    constructor(private readonly analyticsService: AnalyticsService) {}

    @Get()
    @UseGuards(RbacGuard)
    @Roles(Role.OWNER, Role.ADMIN, Role.MEMBER)
    @ApiOperation({
        summary: 'Get dashboard analytics',
        description:
            'Retrieve analytics data for the organisation including leads, calls, chats, and activity metrics. Supports date range filtering.',
    })
    @ApiParam({
        name: 'organisationId',
        description: 'Organisation ID (ULID format)',
        example: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
    })
    @ApiResponse({
        status: 200,
        description: 'Analytics data retrieved successfully',
        type: AnalyticsData,
    })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({
        status: 403,
        description: 'Forbidden - Insufficient permissions',
    })
    async getAnalytics(
        @Param('organisationId') organisationId: string,
        @Query() query: AnalyticsQueryDto,
        @CurrentUser() user: JwtPayload,
    ) {
        const startDate = query.startDate
            ? new Date(query.startDate)
            : undefined;
        const endDate = query.endDate ? new Date(query.endDate) : undefined;

        return this.analyticsService.getAnalytics(
            organisationId,
            startDate,
            endDate,
        );
    }
}
