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
import {
    ApiTags,
    ApiBearerAuth,
    ApiOperation,
    ApiResponse,
    ApiBody,
    ApiParam,
} from '@nestjs/swagger';
import { LeadService } from './lead.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { QueryLeadDto } from './dto/query-lead.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RbacGuard } from '../common/guards/rbac.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Role } from '../common/enums';
import type { UserPayload } from '../common/interfaces/request-with-user.interface';

@ApiTags('Lead')
@ApiBearerAuth('JWT-auth')
@Controller({ path: 'organisation/:organisationId/lead', version: '1' })
@UseGuards(JwtAuthGuard)
export class LeadController {
    constructor(private readonly LeadService: LeadService) {}

  @Post()
  @UseGuards(RbacGuard)
  @Roles(Role.OWNER, Role.ADMIN, Role.MEMBER)
  @ApiOperation({
    summary: 'Create a new lead',
    description:
      'Create a new lead in the organisation. organisationId and agentId are required.',
  })
  @ApiResponse({
    status: 201,
    description: 'Lead created successfully',
    schema: {
      example: {
        data: {
          id: '01HZXYZ1234567890ABCDEFGHJK',
          organisationId: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
          agentId: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
          zohoId: null,
          ownerId: null,
          firstName: 'Priya',
          lastName: 'Menon',
          email: 'priya.menon@example.com',
          phone: '+919123456789',
          source: 'WhatsApp',
          status: 'New',
          disposition: null,
          country: 'India',
          state: 'Kerala',
          city: 'Kochi',
          reasonForCold: null,
          isTransferred: false,
          transferReason: null,
          isDeleted: false,
          createdAt: '2024-01-15T10:30:00.000Z',
          updatedAt: '2024-01-15T10:30:00.000Z',
        },
        statusCode: 201,
        timestamp: '2024-01-15T10:30:00.000Z',
      },
    },
  })
  @ApiBody({
    type: CreateLeadDto,
    examples: {
      'Basic Lead': {
        value: {
          organisationId: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
          agentId: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
          firstName: 'Priya',
          lastName: 'Menon',
          email: 'priya.menon@example.com',
          phone: '+919123456789',
          source: 'WhatsApp',
          status: 'New',
        },
        summary: 'Create a basic lead with essential information',
      },
      'Complete Lead': {
        value: {
          organisationId: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
          agentId: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
          zohoId: '5725767000000649013',
          ownerId: 'zoho_5725767000000649013',
          firstName: 'Arjun',
          lastName: 'Sharma',
          email: 'arjun.sharma@example.com',
          phone: '+919876543210',
          source: 'Instagram',
          status: 'New',
          disposition: 'Interested',
          country: 'India',
          state: 'Karnataka',
          city: 'Bangalore',
          isTransferred: true,
          transferReason: 'Customer requested Spanish-speaking agent',
        },
        summary: 'Create a lead with all available fields',
      },
    },
  })
  create(
    @Param('organisationId') organisationId: string,
    @Body() createLeadDto: CreateLeadDto,
    @CurrentUser() user: UserPayload,
  ) {
    // Ensure organisationId from params matches body
    createLeadDto.organisationId = organisationId;
    return this.LeadService.create(createLeadDto, user.sub, user.isSuperAdmin);
  }

  @Get()
  @UseGuards(RbacGuard)
  @Roles(Role.OWNER, Role.ADMIN, Role.MEMBER)
  @ApiOperation({
    summary: 'Get all leads in organisation',
    description:
      'Retrieve paginated leads for the specified organisation with optional filters.',
  })
  @ApiParam({
    name: 'organisationId',
    description: 'Organisation ID (ULID format)',
    example: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
  })
  @ApiResponse({
    status: 200,
    description: 'Leads retrieved successfully',
    schema: {
      example: {
        data: {
          data: [
            {
              id: '01HZXYZ1234567890ABCDEFGHJK',
              organisationId: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
              agentId: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
              zohoId: '5725767000000649013',
              ownerId: 'zoho_5725767000000649013',
              firstName: 'Priya',
              lastName: 'Menon',
              email: 'priya.menon@example.com',
              phone: '+919123456789',
              source: 'WhatsApp',
              status: 'New',
              disposition: 'Interested',
              country: 'India',
              state: 'Kerala',
              city: 'Kochi',
              reasonForCold: null,
              isTransferred: false,
              transferReason: null,
              isDeleted: false,
              createdAt: '2024-01-15T10:30:00.000Z',
              updatedAt: '2024-01-15T10:30:00.000Z',
              owner: {
                id: 'zoho_5725767000000649013',
                firstName: 'John',
                lastName: 'Doe',
                email: 'john.doe@example.com',
              },
            },
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
    @Query() queryDto: QueryLeadDto,
    @CurrentUser() user: UserPayload,
  ) {
    return this.LeadService.findAll(
      organisationId,
      user.sub,
      user.isSuperAdmin,
      queryDto,
    );
  }

  @Get(':id')
  @UseGuards(RbacGuard)
  @Roles(Role.OWNER, Role.ADMIN, Role.MEMBER)
  @ApiOperation({
    summary: 'Get a specific lead',
    description: 'Retrieve detailed information about a specific lead by ID.',
  })
  @ApiParam({
    name: 'organisationId',
    description: 'Organisation ID (ULID format)',
    example: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
  })
  @ApiParam({
    name: 'id',
    description: 'Lead ID (ULID format)',
    example: '01HZXYZ1234567890ABCDEFGHJK',
  })
  @ApiResponse({
    status: 200,
    description: 'Lead retrieved successfully',
    schema: {
      example: {
        data: {
          id: '01HZXYZ1234567890ABCDEFGHJK',
          organisationId: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
          agentId: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
          zohoId: '5725767000000649013',
          ownerId: 'zoho_5725767000000649013',
          firstName: 'Priya',
          lastName: 'Menon',
          email: 'priya.menon@example.com',
          phone: '+919123456789',
          source: 'WhatsApp',
          status: 'New',
          disposition: 'Interested',
          country: 'India',
          state: 'Kerala',
          city: 'Kochi',
          reasonForCold: null,
          isTransferred: false,
          transferReason: null,
          isDeleted: false,
          createdAt: '2024-01-15T10:30:00.000Z',
          updatedAt: '2024-01-15T10:30:00.000Z',
        },
    })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({
        status: 403,
        description: 'Forbidden - Insufficient permissions',
    })
    findAll(
        @Param('organisationId') organisationId: string,
        @Query() queryDto: QueryLeadDto,
        @CurrentUser() user: UserPayload,
    ) {
        return this.LeadService.findAll(
            organisationId,
            user.sub,
            user.isSuperAdmin,
            queryDto,
        );
    }

  @Patch(':id')
  @UseGuards(RbacGuard)
  @Roles(Role.OWNER, Role.ADMIN)
  @ApiOperation({
    summary: 'Update a lead',
    description:
      'Update lead information. All fields are optional. Only provide the fields you want to update.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lead updated successfully',
    schema: {
      example: {
        data: {
          id: '01HZXYZ1234567890ABCDEFGHJK',
          organisationId: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
          agentId: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
          zohoId: '5725767000000649013',
          ownerId: 'zoho_5725767000000649013',
          firstName: 'Arjun',
          lastName: 'Sharma',
          email: 'arjun.sharma@example.com',
          phone: '+919876543210',
          source: 'Instagram',
          status: 'Contacted',
          disposition: 'Qualified',
          country: 'India',
          state: 'Karnataka',
          city: 'Bangalore',
          reasonForCold: null,
          isTransferred: true,
          transferReason: 'Customer requested technical specialist',
          isDeleted: false,
          createdAt: '2024-01-15T10:30:00.000Z',
          updatedAt: '2024-01-15T14:45:00.000Z',
        },
        statusCode: 200,
        timestamp: '2024-01-15T14:45:00.000Z',
      },
    },
  })
  @ApiBody({
    type: UpdateLeadDto,
    description: 'Lead update data. All fields are optional.',
    examples: {
      'Update Status': {
        value: {
          status: 'Contacted',
          disposition: 'Qualified',
          isTransferred: false,
        },
        summary: 'Update lead status and disposition',
      },
      'Transfer Lead': {
        value: {
          isTransferred: true,
          transferReason: 'Customer requested technical specialist',
        },
        summary: 'Transfer lead to another agent with reason',
      },
      'Update Contact Info': {
        value: {
          firstName: 'Arjun',
          lastName: 'Sharma',
          email: 'arjun.sharma@example.com',
          phone: '+919876543210',
        },
        summary: 'Update contact information',
      },
      'Update Location': {
        value: {
          country: 'India',
          state: 'Karnataka',
          city: 'Bangalore',
        },
        summary: 'Update location details',
      },
      'Complete Update': {
        value: {
          firstName: 'Arjun',
          lastName: 'Sharma',
          email: 'arjun.sharma@example.com',
          phone: '+919876543210',
          source: 'Instagram',
          status: 'Contacted',
          disposition: 'Qualified',
          country: 'India',
          state: 'Karnataka',
          city: 'Bangalore',
          isTransferred: true,
          transferReason: 'Customer requested Spanish-speaking agent',
        },
        summary: 'Update multiple fields at once',
      },
    },
  })
  update(
    @Param('organisationId') organisationId: string,
    @Param('id') id: string,
    @Body() updateLeadDto: UpdateLeadDto,
    @CurrentUser() user: UserPayload,
  ) {
    return this.LeadService.update(
      id,
      organisationId,
      updateLeadDto,
      user.sub,
      user.isSuperAdmin,
    );
  }

    @Patch(':id')
    @UseGuards(RbacGuard)
    @Roles(Role.OWNER, Role.ADMIN)
    @ApiOperation({
        summary: 'Update a lead',
        description:
            'Update lead information. All fields are optional. Only provide the fields you want to update.',
    })
    @ApiResponse({
        status: 200,
        description: 'Lead updated successfully',
        schema: {
            example: {
                data: {
                    id: '01HZXYZ1234567890ABCDEFGHJK',
                    organisationId: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
                    agentId: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
                    zohoId: '5725767000000649013',
                    ownerId: 'zoho_5725767000000649013',
                    firstName: 'Arjun',
                    lastName: 'Sharma',
                    email: 'arjun.sharma@example.com',
                    phone: '+919876543210',
                    source: 'Instagram',
                    status: 'Contacted',
                    disposition: 'Qualified',
                    country: 'India',
                    state: 'Karnataka',
                    city: 'Bangalore',
                    reasonForCold: null,
                    isTransferred: false,
                    isDeleted: false,
                    createdAt: '2024-01-15T10:30:00.000Z',
                    updatedAt: '2024-01-15T14:45:00.000Z',
                },
                statusCode: 200,
                timestamp: '2024-01-15T14:45:00.000Z',
            },
        },
    })
    @ApiBody({
        type: UpdateLeadDto,
        description: 'Lead update data. All fields are optional.',
        examples: {
            'Update Status': {
                value: {
                    status: 'Contacted',
                    disposition: 'Qualified',
                    isTransferred: false,
                },
                summary: 'Update lead status and disposition',
            },
            'Update Contact Info': {
                value: {
                    firstName: 'Arjun',
                    lastName: 'Sharma',
                    email: 'arjun.sharma@example.com',
                    phone: '+919876543210',
                },
                summary: 'Update contact information',
            },
            'Update Location': {
                value: {
                    country: 'India',
                    state: 'Karnataka',
                    city: 'Bangalore',
                },
                summary: 'Update location details',
            },
            'Complete Update': {
                value: {
                    firstName: 'Arjun',
                    lastName: 'Sharma',
                    email: 'arjun.sharma@example.com',
                    phone: '+919876543210',
                    source: 'Instagram',
                    status: 'Contacted',
                    disposition: 'Qualified',
                    country: 'India',
                    state: 'Karnataka',
                    city: 'Bangalore',
                },
                summary: 'Update multiple fields at once',
            },
        },
    })
    update(
        @Param('organisationId') organisationId: string,
        @Param('id') id: string,
        @Body() updateLeadDto: UpdateLeadDto,
        @CurrentUser() user: UserPayload,
    ) {
        return this.LeadService.update(
            id,
            organisationId,
            updateLeadDto,
            user.sub,
            user.isSuperAdmin,
        );
    }

    @Delete(':id')
    @UseGuards(RbacGuard)
    @Roles(Role.OWNER, Role.ADMIN)
    @ApiOperation({
        summary: 'Delete a lead',
        description:
            'Soft delete a lead by marking it as deleted. The lead will not be permanently removed from the database.',
    })
    @ApiParam({
        name: 'organisationId',
        description: 'Organisation ID (ULID format)',
        example: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
    })
    @ApiParam({
        name: 'id',
        description: 'Lead ID (ULID format)',
        example: '01HZXYZ1234567890ABCDEFGHJK',
    })
    @ApiResponse({
        status: 200,
        description: 'Lead deleted successfully',
        schema: {
            example: {
                data: {
                    id: '01HZXYZ1234567890ABCDEFGHJK',
                    organisationId: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
                    agentId: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
                    zohoId: '5725767000000649013',
                    ownerId: 'zoho_5725767000000649013',
                    firstName: 'Priya',
                    lastName: 'Menon',
                    email: 'priya.menon@example.com',
                    phone: '+919123456789',
                    source: 'WhatsApp',
                    status: 'New',
                    disposition: 'Interested',
                    country: 'India',
                    state: 'Kerala',
                    city: 'Kochi',
                    reasonForCold: null,
                    isTransferred: false,
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
        description: 'Forbidden - Insufficient permissions',
    })
    @ApiResponse({ status: 404, description: 'Lead not found' })
    remove(
        @Param('organisationId') organisationId: string,
        @Param('id') id: string,
        @CurrentUser() user: UserPayload,
    ) {
        return this.LeadService.remove(
            id,
            organisationId,
            user.sub,
            user.isSuperAdmin,
        );
    }
}
