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
import {
    ApiTags,
    ApiBearerAuth,
    ApiOperation,
    ApiResponse,
    ApiParam,
} from '@nestjs/swagger';
import { OrganisationService } from './organisation.service';
import { CreateOrganisationDto } from './dto/create-organisation.dto';
import { UpdateOrganisationDto } from './dto/update-organisation.dto';
import { UpdateCreditsDto } from './dto/update-credits.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RbacGuard } from '../common/guards/rbac.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Role } from '../common/enums';
import type { UserPayload } from '../common/interfaces/request-with-user.interface';

@ApiTags('Organisation')
@ApiBearerAuth('JWT-auth')
@Controller({ path: 'organisation', version: '1' })
@UseGuards(JwtAuthGuard)
export class OrganisationController {
    constructor(private readonly OrganisationService: OrganisationService) {}

    @Post()
    @ApiOperation({
        summary: 'Create a new organisation',
        description:
            'Create a new organisation. The authenticated user will automatically become the owner.',
    })
    @ApiResponse({
        status: 201,
        description: 'Organisation created successfully',
        schema: {
            example: {
                data: {
                    id: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
                    name: 'Acme Corporation',
                    slug: 'acme-corp',
                    availableIndianChannels: 100,
                    availableInternationalChannels: 50,
                    credits: 5000,
                    chatCredits: 1000,
                    callCredits: 500,
                    isDeleted: false,
                    createdAt: '2024-01-15T10:30:00.000Z',
                    updatedAt: '2024-01-15T10:30:00.000Z',
                },
                statusCode: 201,
                timestamp: '2024-01-15T10:30:00.000Z',
            },
        },
    })
    @ApiResponse({ status: 400, description: 'Invalid input data' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({
        status: 409,
        description: 'Organisation with this slug already exists',
    })
    create(
        @Body() createOrganisationDto: CreateOrganisationDto,
        @CurrentUser() user: UserPayload,
    ) {
        return this.OrganisationService.create(createOrganisationDto, user.sub);
    }

    @Get()
    @ApiOperation({
        summary: 'Get all organisations',
        description:
            'Retrieve all organisations the user has access to. Super admins can see all organisations.',
    })
    @ApiResponse({
        status: 200,
        description: 'Organisations retrieved successfully',
        schema: {
            example: {
                data: [
                    {
                        id: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
                        name: 'Acme Corporation',
                        slug: 'acme-corp',
                        availableIndianChannels: 100,
                        availableInternationalChannels: 50,
                        credits: 5000,
                        chatCredits: 1000,
                        callCredits: 500,
                        isDeleted: false,
                        createdAt: '2024-01-15T10:30:00.000Z',
                        updatedAt: '2024-01-15T10:30:00.000Z',
                    },
                ],
                statusCode: 200,
                timestamp: '2024-01-15T10:30:00.000Z',
            },
        },
    })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    findAll(@CurrentUser() user: UserPayload) {
        return this.OrganisationService.findAll(user.sub, user.isSuperAdmin);
    }

    @Get(':id')
    @ApiOperation({
        summary: 'Get organisation by ID',
        description:
            'Retrieve detailed information about a specific organisation.',
    })
    @ApiParam({
        name: 'id',
        description: 'Organisation ID (ULID format)',
        example: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
    })
    @ApiResponse({
        status: 200,
        description: 'Organisation retrieved successfully',
        schema: {
            example: {
                data: {
                    id: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
                    name: 'Acme Corporation',
                    slug: 'acme-corp',
                    availableIndianChannels: 100,
                    availableInternationalChannels: 50,
                    credits: 5000,
                    chatCredits: 1000,
                    callCredits: 500,
                    isDeleted: false,
                    createdAt: '2024-01-15T10:30:00.000Z',
                    updatedAt: '2024-01-15T10:30:00.000Z',
                },
                statusCode: 200,
                timestamp: '2024-01-15T10:30:00.000Z',
            },
        },
    })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({
        status: 403,
        description: 'Forbidden - No access to this organisation',
    })
    @ApiResponse({ status: 404, description: 'Organisation not found' })
    findOne(@Param('id') id: string, @CurrentUser() user: UserPayload) {
        return this.OrganisationService.findOne(
            id,
            user.sub,
            user.isSuperAdmin,
        );
    }

    @Patch(':organisationId')
    @UseGuards(RbacGuard)
    @Roles(Role.OWNER, Role.ADMIN)
    @ApiOperation({
        summary: 'Update organisation',
        description:
            'Update organisation details. Only owners and admins can update organisations.',
    })
    @ApiParam({
        name: 'organisationId',
        description: 'Organisation ID (ULID format)',
        example: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
    })
    @ApiResponse({
        status: 200,
        description: 'Organisation updated successfully',
        schema: {
            example: {
                data: {
                    id: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
                    name: 'Acme Corporation Updated',
                    slug: 'acme-corp',
                    availableIndianChannels: 150,
                    availableInternationalChannels: 75,
                    credits: 7500,
                    chatCredits: 1500,
                    callCredits: 750,
                    isDeleted: false,
                    createdAt: '2024-01-15T10:30:00.000Z',
                    updatedAt: '2024-01-15T14:45:00.000Z',
                },
                statusCode: 200,
                timestamp: '2024-01-15T14:45:00.000Z',
            },
        },
    })
    @ApiResponse({ status: 400, description: 'Invalid input data' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({
        status: 403,
        description: 'Forbidden - Insufficient permissions',
    })
    @ApiResponse({ status: 404, description: 'Organisation not found' })
    update(
        @Param('organisationId') organisationId: string,
        @Body() updateOrganisationDto: UpdateOrganisationDto,
        @CurrentUser() user: UserPayload,
    ) {
        return this.OrganisationService.update(
            organisationId,
            updateOrganisationDto,
            user.sub,
            user.isSuperAdmin,
        );
    }

    @Patch(':organisationId/credits')
    @UseGuards(RbacGuard)
    @Roles(Role.OWNER, Role.ADMIN)
    @ApiOperation({
        summary: 'Update organisation credits',
        description:
            'Increment or decrement organisation credits. Only owners and admins can update credits.',
    })
    @ApiParam({
        name: 'organisationId',
        description: 'Organisation ID (ULID format)',
        example: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
    })
    @ApiResponse({
        status: 200,
        description: 'Credits updated successfully',
        schema: {
            example: {
                data: {
                    id: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
                    name: 'Acme Corporation',
                    slug: 'acme-corp',
                    availableIndianChannels: 100,
                    availableInternationalChannels: 50,
                    credits: 5100,
                    chatCredits: 1000,
                    callCredits: 500,
                    isDeleted: false,
                    createdAt: '2024-01-15T10:30:00.000Z',
                    updatedAt: '2024-01-15T14:45:00.000Z',
                },
                statusCode: 200,
                timestamp: '2024-01-15T14:45:00.000Z',
            },
        },
    })
    @ApiResponse({ status: 400, description: 'Invalid input or insufficient credits' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({
        status: 403,
        description: 'Forbidden - Insufficient permissions',
    })
    @ApiResponse({ status: 404, description: 'Organisation not found' })
    updateCredits(
        @Param('organisationId') organisationId: string,
        @Body() updateCreditsDto: UpdateCreditsDto,
        @CurrentUser() user: UserPayload,
    ) {
        return this.OrganisationService.updateCredits(
            organisationId,
            updateCreditsDto,
            user.sub,
            user.isSuperAdmin,
        );
    }

    @Delete(':organisationId')
    @UseGuards(RbacGuard)
    @Roles(Role.OWNER)
    @ApiOperation({
        summary: 'Delete organisation',
        description:
            'Soft delete an organisation. Only the owner can delete an organisation.',
    })
    @ApiParam({
        name: 'organisationId',
        description: 'Organisation ID (ULID format)',
        example: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
    })
    @ApiResponse({
        status: 200,
        description: 'Organisation deleted successfully',
        schema: {
            example: {
                data: {
                    id: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
                    name: 'Acme Corporation',
                    slug: 'acme-corp',
                    availableIndianChannels: 100,
                    availableInternationalChannels: 50,
                    chatCredits: 1000,
                    callCredits: 500,
                    isDeleted: true,
                    createdAt: '2024-01-15T10:30:00.000Z',
                    updatedAt: '2024-01-15T15:00:00.000Z',
                },
                statusCode: 200,
                timestamp: '2024-01-15T15:00:00.000Z',
            },
        },
    })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({
        status: 403,
        description: 'Forbidden - Only owners can delete organisations',
    })
    @ApiResponse({ status: 404, description: 'Organisation not found' })
    remove(
        @Param('organisationId') organisationId: string,
        @CurrentUser() user: UserPayload,
    ) {
        return this.OrganisationService.remove(
            organisationId,
            user.sub,
            user.isSuperAdmin,
        );
    }
}
