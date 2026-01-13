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
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiBody, ApiParam } from '@nestjs/swagger';
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
  constructor(private readonly LeadService: LeadService) { }

  @Post()
  @UseGuards(RbacGuard)
  @Roles(Role.OWNER, Role.ADMIN, Role.MEMBER)
  @ApiOperation({
    summary: 'Create a new lead',
    description: 'Create a new lead in the organisation. organisationId and agentId are required.'
  })
  @ApiResponse({
    status: 201,
    description: 'Lead created successfully',
    schema: {
      example: {
        success: true,
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
          isDeleted: false,
          createdAt: '2024-01-15T10:30:00.000Z',
          updatedAt: '2024-01-15T10:30:00.000Z'
        }
      }
    }
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
          status: 'New'
        },
        summary: 'Create a basic lead with essential information'
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
          city: 'Bangalore'
        },
        summary: 'Create a lead with all available fields'
      }
    }
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
  @ApiOperation({ summary: 'Get all leads for organisation with pagination' })
  @ApiParam({ name: 'organisationId', description: 'Organisation ID' })
  @ApiResponse({ status: 200, description: 'Leads retrieved successfully' })
  findAll(
    @Param('organisationId') organisationId: string,
    @Query() queryDto: QueryLeadDto,
    @CurrentUser() user: UserPayload,
  ) {
    return this.LeadService.findAll(organisationId, user.sub, user.isSuperAdmin, queryDto);
  }

  @Get(':id')
  @UseGuards(RbacGuard)
  @Roles(Role.OWNER, Role.ADMIN, Role.MEMBER)
  findOne(
    @Param('organisationId') organisationId: string,
    @Param('id') id: string,
    @CurrentUser() user: UserPayload,
  ) {
    return this.LeadService.findOne(id, organisationId, user.sub, user.isSuperAdmin);
  }

  @Patch(':id')
  @UseGuards(RbacGuard)
  @Roles(Role.OWNER, Role.ADMIN)
  @ApiOperation({
    summary: 'Update a lead',
    description: 'Update lead information. All fields are optional. Only provide the fields you want to update.'
  })
  @ApiResponse({
    status: 200,
    description: 'Lead updated successfully',
    schema: {
      example: {
        success: true,
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
          updatedAt: '2024-01-15T14:45:00.000Z'
        }
      }
    }
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
        summary: 'Update lead status and disposition'
      },
      'Update Contact Info': {
        value: {
          firstName: 'Arjun',
          lastName: 'Sharma',
          email: 'arjun.sharma@example.com',
          phone: '+919876543210'
        },
        summary: 'Update contact information'
      },
      'Update Location': {
        value: {
          country: 'India',
          state: 'Karnataka',
          city: 'Bangalore'
        },
        summary: 'Update location details'
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
          city: 'Bangalore'
        },
        summary: 'Update multiple fields at once'
      }
    }
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
  remove(
    @Param('organisationId') organisationId: string,
    @Param('id') id: string,
    @CurrentUser() user: UserPayload,
  ) {
    return this.LeadService.remove(id, organisationId, user.sub, user.isSuperAdmin);
  }
}

