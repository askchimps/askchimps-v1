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
    ApiParam,
    ApiResponse,
    ApiBody,
} from '@nestjs/swagger';
import { TagService } from './tag.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RbacGuard } from '../common/guards/rbac.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Role } from '../common/enums';
import type { UserPayload } from '../common/interfaces/request-with-user.interface';

@ApiTags('Tags')
@ApiBearerAuth('JWT-auth')
@Controller({ path: 'organisation/:organisationId/tag', version: '1' })
@UseGuards(JwtAuthGuard)
export class TagController {
    constructor(private readonly tagService: TagService) {}

    @Post()
    @UseGuards(RbacGuard)
    @Roles(Role.OWNER, Role.ADMIN, Role.MEMBER)
    @ApiOperation({
        summary: 'Create a new tag',
        description:
            'Create a tag for organizing chats, calls, and leads. Tags help categorize and filter records. The slug must be unique within the organisation.',
    })
    @ApiParam({
        name: 'organisationId',
        description: 'Organisation ID (ULID format)',
        example: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
    })
    @ApiBody({
        type: CreateTagDto,
        description: 'Tag data',
        examples: {
            'Priority Tag': {
                value: {
                    name: 'High Priority',
                    slug: 'high-priority',
                    organisationId: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
                },
            },
            'Status Tag': {
                value: {
                    name: 'Follow Up Required',
                    slug: 'follow-up-required',
                    organisationId: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
                },
            },
            'Category Tag': {
                value: {
                    name: 'VIP Customer',
                    slug: 'vip-customer',
                    organisationId: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
                },
            },
        },
    })
    @ApiResponse({
        status: 201,
        description: 'Tag created successfully',
        schema: {
            example: {
                data: {
                    id: '01HZXYZ1234567890ABCDEFGHJK',
                    name: 'High Priority',
                    slug: 'high-priority',
                    organisationId: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
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
        status: 403,
        description: 'Forbidden - Insufficient permissions',
    })
    @ApiResponse({
        status: 409,
        description: 'Tag with this slug already exists in this organisation',
    })
    create(
        @Param('organisationId') organisationId: string,
        @Body() createTagDto: CreateTagDto,
        @CurrentUser() user: UserPayload,
    ) {
        createTagDto.organisationId = organisationId;
        return this.tagService.create(
            createTagDto,
            user.sub,
            user.isSuperAdmin,
        );
    }

    @Get()
    @UseGuards(RbacGuard)
    @Roles(Role.OWNER, Role.ADMIN, Role.MEMBER)
    @ApiOperation({
        summary: 'Get all tags in organisation',
        description:
            'Retrieve all tags for an organisation. Tags are sorted alphabetically by name.',
    })
    @ApiParam({
        name: 'organisationId',
        description: 'Organisation ID (ULID format)',
        example: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
    })
    @ApiResponse({
        status: 200,
        description: 'Tags retrieved successfully',
        schema: {
            example: {
                data: [
                    {
                        id: '01HZXYZ1234567890ABCDEFGHJK',
                        name: 'High Priority',
                        slug: 'high-priority',
                        organisationId: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
                        isDeleted: false,
                        createdAt: '2024-01-15T10:30:00.000Z',
                        updatedAt: '2024-01-15T10:30:00.000Z',
                    },
                    {
                        id: '01HZXYZ1234567890ABCDEFGHJL',
                        name: 'VIP Customer',
                        slug: 'vip-customer',
                        organisationId: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
                        isDeleted: false,
                        createdAt: '2024-01-15T11:00:00.000Z',
                        updatedAt: '2024-01-15T11:00:00.000Z',
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
    findAll(
        @Param('organisationId') organisationId: string,
        @CurrentUser() user: UserPayload,
    ) {
        return this.tagService.findAll(
            organisationId,
            user.sub,
            user.isSuperAdmin,
        );
    }

    @Get(':id')
    @UseGuards(RbacGuard)
    @Roles(Role.OWNER, Role.ADMIN, Role.MEMBER)
    @ApiOperation({
        summary: 'Get tag by ID',
        description: 'Retrieve a specific tag by its ID.',
    })
    @ApiParam({
        name: 'organisationId',
        description: 'Organisation ID (ULID format)',
        example: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
    })
    @ApiParam({
        name: 'id',
        description: 'Tag ID (ULID format)',
        example: '01HZXYZ1234567890ABCDEFGHJK',
    })
    @ApiResponse({
        status: 200,
        description: 'Tag retrieved successfully',
        schema: {
            example: {
                data: {
                    id: '01HZXYZ1234567890ABCDEFGHJK',
                    name: 'High Priority',
                    slug: 'high-priority',
                    organisationId: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
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
        description: 'Forbidden - Insufficient permissions',
    })
    @ApiResponse({ status: 404, description: 'Tag not found' })
    findOne(
        @Param('organisationId') organisationId: string,
        @Param('id') id: string,
        @CurrentUser() user: UserPayload,
    ) {
        return this.tagService.findOne(
            id,
            organisationId,
            user.sub,
            user.isSuperAdmin,
        );
    }

    @Patch(':id')
    @UseGuards(RbacGuard)
    @Roles(Role.OWNER, Role.ADMIN, Role.MEMBER)
    @ApiOperation({
        summary: 'Update tag',
        description:
            "Update a tag's name or slug. If updating the slug, it must remain unique within the organisation.",
    })
    @ApiParam({
        name: 'organisationId',
        description: 'Organisation ID (ULID format)',
        example: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
    })
    @ApiParam({
        name: 'id',
        description: 'Tag ID (ULID format)',
        example: '01HZXYZ1234567890ABCDEFGHJK',
    })
    @ApiBody({
        type: UpdateTagDto,
        description: 'Tag update data. All fields are optional.',
        examples: {
            'Update Name': {
                value: {
                    name: 'Critical Priority',
                },
            },
            'Update Slug': {
                value: {
                    slug: 'critical-priority',
                },
            },
            'Update Both': {
                value: {
                    name: 'Critical Priority',
                    slug: 'critical-priority',
                },
            },
        },
    })
    @ApiResponse({
        status: 200,
        description: 'Tag updated successfully',
        schema: {
            example: {
                data: {
                    id: '01HZXYZ1234567890ABCDEFGHJK',
                    name: 'Critical Priority',
                    slug: 'critical-priority',
                    organisationId: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
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
    @ApiResponse({ status: 404, description: 'Tag not found' })
    @ApiResponse({
        status: 409,
        description: 'Tag with this slug already exists in this organisation',
    })
    update(
        @Param('organisationId') organisationId: string,
        @Param('id') id: string,
        @Body() updateTagDto: UpdateTagDto,
        @CurrentUser() user: UserPayload,
    ) {
        return this.tagService.update(
            id,
            organisationId,
            updateTagDto,
            user.sub,
            user.isSuperAdmin,
        );
    }

    @Delete(':id')
    @UseGuards(RbacGuard)
    @Roles(Role.OWNER, Role.ADMIN)
    @ApiOperation({
        summary: 'Delete tag (soft delete)',
        description:
            'Soft delete a tag. The tag is marked as deleted but not removed from the database. Only OWNER and ADMIN roles can delete tags.',
    })
    @ApiParam({
        name: 'organisationId',
        description: 'Organisation ID (ULID format)',
        example: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
    })
    @ApiParam({
        name: 'id',
        description: 'Tag ID (ULID format)',
        example: '01HZXYZ1234567890ABCDEFGHJK',
    })
    @ApiResponse({
        status: 200,
        description: 'Tag deleted successfully',
        schema: {
            example: {
                data: {
                    id: '01HZXYZ1234567890ABCDEFGHJK',
                    name: 'High Priority',
                    slug: 'high-priority',
                    organisationId: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
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
        description: 'Forbidden - Only OWNER and ADMIN can delete tags',
    })
    @ApiResponse({ status: 404, description: 'Tag not found' })
    remove(
        @Param('organisationId') organisationId: string,
        @Param('id') id: string,
        @CurrentUser() user: UserPayload,
    ) {
        return this.tagService.remove(
            id,
            organisationId,
            user.sub,
            user.isSuperAdmin,
        );
    }
}
