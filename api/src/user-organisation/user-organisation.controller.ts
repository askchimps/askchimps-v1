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
import { UserOrganisationService } from './user-organisation.service';
import { CreateUserOrganisationDto } from './dto/create-user-organisation.dto';
import { UpdateUserOrganisationDto } from './dto/update-user-organisation.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RbacGuard } from '../common/guards/rbac.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Role } from '../common/enums';
import type { UserPayload } from '../common/interfaces/request-with-user.interface';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiBody } from '@nestjs/swagger';

@ApiTags('Organisation User')
@ApiBearerAuth('JWT-auth')
@Controller({ path: 'organisation/:organisationId/user', version: '1' })
@UseGuards(JwtAuthGuard)
export class UserOrganisationController {
  constructor(
    private readonly UserOrganisationService: UserOrganisationService,
  ) {}

  @Post()
  @UseGuards(RbacGuard)
  @Roles(Role.OWNER, Role.ADMIN)
  @ApiOperation({
    summary: 'Add a user to an organisation',
    description: 'Create a user-organisation relationship with a specific role (OWNER, ADMIN, or MEMBER). Only OWNER and ADMIN roles can add users to an organisation.',
  })
  @ApiParam({
    name: 'organisationId',
    description: 'Organisation ID (ULID format)',
    example: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
  })
  @ApiBody({
    type: CreateUserOrganisationDto,
    description: 'User-organisation relationship data',
    examples: {
      'Add Admin': {
        value: {
          userId: '01HZXYZ1234567890ABCDEFGHJK',
          organisationId: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
          role: 'ADMIN',
        },
      },
      'Add Member': {
        value: {
          userId: '01HZXYZ1234567890ABCDEFGHJL',
          organisationId: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
          role: 'MEMBER',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'User added to organisation successfully',
    schema: {
      example: {
        data: {
          id: '01HZXYZ1234567890ABCDEFGHJK',
          userId: '01HZXYZ1234567890ABCDEFGHJK',
          organisationId: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
          role: 'ADMIN',
          createdAt: '2024-01-15T10:30:00.000Z',
          updatedAt: '2024-01-15T10:30:00.000Z',
        },
        statusCode: 201,
        timestamp: '2024-01-15T10:30:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid input data or user already in organisation' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Only OWNER and ADMIN can add users' })
  @ApiResponse({ status: 404, description: 'User or organisation not found' })
  create(
    @Param('organisationId') organisationId: string,
    @Body() createUserOrganisationDto: CreateUserOrganisationDto,
    @CurrentUser() user: UserPayload,
  ) {
    // Ensure organisationId from params matches body
    createUserOrganisationDto.organisationId = organisationId;
    return this.UserOrganisationService.create(
      createUserOrganisationDto,
      user.sub,
      user.isSuperAdmin,
    );
  }

  @Get()
  @UseGuards(RbacGuard)
  @Roles(Role.OWNER, Role.ADMIN, Role.MEMBER)
  @ApiOperation({
    summary: 'Get all users in an organisation',
    description: 'Retrieve all user-organisation relationships for a specific organisation. Shows all users and their roles.',
  })
  @ApiParam({
    name: 'organisationId',
    description: 'Organisation ID (ULID format)',
    example: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
  })
  @ApiResponse({
    status: 200,
    description: 'Users retrieved successfully',
    schema: {
      example: {
        data: [
          {
            id: '01HZXYZ1234567890ABCDEFGHJK',
            userId: '01HZXYZ1234567890ABCDEFGHJK',
            organisationId: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
            role: 'OWNER',
            createdAt: '2024-01-15T09:00:00.000Z',
            updatedAt: '2024-01-15T09:00:00.000Z',
          },
          {
            id: '01HZXYZ1234567890ABCDEFGHJL',
            userId: '01HZXYZ1234567890ABCDEFGHJL',
            organisationId: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
            role: 'ADMIN',
            createdAt: '2024-01-15T10:00:00.000Z',
            updatedAt: '2024-01-15T10:00:00.000Z',
          },
        ],
        statusCode: 200,
        timestamp: '2024-01-15T10:30:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  findAll(
    @Param('organisationId') organisationId: string,
    @CurrentUser() user: UserPayload,
  ) {
    return this.UserOrganisationService.findAllByOrganisation(
      organisationId,
      user.sub,
      user.isSuperAdmin,
    );
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get user-organisation relationship by ID',
    description: 'Retrieve a specific user-organisation relationship.',
  })
  @ApiParam({
    name: 'organisationId',
    description: 'Organisation ID (ULID format)',
    example: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
  })
  @ApiParam({
    name: 'id',
    description: 'User-Organisation relationship ID (ULID format)',
    example: '01HZXYZ1234567890ABCDEFGHJK',
  })
  @ApiResponse({
    status: 200,
    description: 'User-organisation relationship retrieved successfully',
    schema: {
      example: {
        data: {
          id: '01HZXYZ1234567890ABCDEFGHJK',
          userId: '01HZXYZ1234567890ABCDEFGHJK',
          organisationId: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
          role: 'ADMIN',
          createdAt: '2024-01-15T10:30:00.000Z',
          updatedAt: '2024-01-15T10:30:00.000Z',
        },
        statusCode: 200,
        timestamp: '2024-01-15T10:30:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'User-organisation relationship not found' })
  findOne(@Param('id') id: string, @CurrentUser() user: UserPayload) {
    return this.UserOrganisationService.findOne(id, user.sub, user.isSuperAdmin);
  }

  @Patch(':id')
  @UseGuards(RbacGuard)
  @Roles(Role.OWNER)
  @ApiOperation({
    summary: 'Update user role in organisation',
    description: 'Update a user\'s role in an organisation. Only OWNER role can update user roles.',
  })
  @ApiParam({
    name: 'organisationId',
    description: 'Organisation ID (ULID format)',
    example: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
  })
  @ApiParam({
    name: 'id',
    description: 'User-Organisation relationship ID (ULID format)',
    example: '01HZXYZ1234567890ABCDEFGHJK',
  })
  @ApiBody({
    type: UpdateUserOrganisationDto,
    description: 'User role update data',
    examples: {
      'Promote to Admin': {
        value: {
          role: 'ADMIN',
        },
      },
      'Demote to Member': {
        value: {
          role: 'MEMBER',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'User role updated successfully',
    schema: {
      example: {
        data: {
          id: '01HZXYZ1234567890ABCDEFGHJK',
          userId: '01HZXYZ1234567890ABCDEFGHJK',
          organisationId: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
          role: 'ADMIN',
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
  @ApiResponse({ status: 403, description: 'Forbidden - Only OWNER can update user roles' })
  @ApiResponse({ status: 404, description: 'User-organisation relationship not found' })
  update(
    @Param('organisationId') organisationId: string,
    @Param('id') id: string,
    @Body() updateUserOrganisationDto: UpdateUserOrganisationDto,
    @CurrentUser() user: UserPayload,
  ) {
    return this.UserOrganisationService.update(
      id,
      updateUserOrganisationDto,
      user.sub,
      user.isSuperAdmin,
    );
  }

  @Delete(':id')
  @UseGuards(RbacGuard)
  @Roles(Role.OWNER, Role.ADMIN)
  @ApiOperation({
    summary: 'Remove user from organisation',
    description: 'Remove a user from an organisation by deleting the user-organisation relationship. Only OWNER and ADMIN roles can remove users.',
  })
  @ApiParam({
    name: 'organisationId',
    description: 'Organisation ID (ULID format)',
    example: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
  })
  @ApiParam({
    name: 'id',
    description: 'User-Organisation relationship ID (ULID format)',
    example: '01HZXYZ1234567890ABCDEFGHJK',
  })
  @ApiResponse({
    status: 200,
    description: 'User removed from organisation successfully',
    schema: {
      example: {
        data: {
          id: '01HZXYZ1234567890ABCDEFGHJK',
          userId: '01HZXYZ1234567890ABCDEFGHJK',
          organisationId: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
          role: 'MEMBER',
          createdAt: '2024-01-15T10:30:00.000Z',
          updatedAt: '2024-01-15T15:00:00.000Z',
        },
        statusCode: 200,
        timestamp: '2024-01-15T15:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Only OWNER and ADMIN can remove users' })
  @ApiResponse({ status: 404, description: 'User-organisation relationship not found' })
  remove(
    @Param('organisationId') organisationId: string,
    @Param('id') id: string,
    @CurrentUser() user: UserPayload,
  ) {
    return this.UserOrganisationService.remove(id, user.sub, user.isSuperAdmin);
  }
}

