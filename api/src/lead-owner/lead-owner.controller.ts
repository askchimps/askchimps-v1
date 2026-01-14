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
import { ApiTags, ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiBody } from '@nestjs/swagger';
import { LeadOwnerService } from './lead-owner.service';
import { CreateLeadOwnerDto } from './dto/create-lead-owner.dto';
import { UpdateLeadOwnerDto } from './dto/update-lead-owner.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Lead Owner')
@ApiBearerAuth('JWT-auth')
@Controller({ path: 'lead-owner', version: '1' })
@UseGuards(JwtAuthGuard)
export class LeadOwnerController {
  constructor(private readonly LeadOwnerService: LeadOwnerService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a lead owner',
    description: 'Create a new lead owner record. Lead owners are typically imported from CRM systems like Zoho, Salesforce, or HubSpot. The ID is manually provided and should match the external system ID.',
  })
  @ApiBody({
    type: CreateLeadOwnerDto,
    description: 'Lead owner data',
    examples: {
      'Zoho Lead Owner': {
        value: {
          id: 'zoho_5725767000000649013',
          firstName: 'Sarah',
          lastName: 'Johnson',
          email: 'sarah.johnson@company.com',
          phone: '+1234567890',
        },
      },
      'Salesforce Lead Owner': {
        value: {
          id: 'sf_00Q5e00000DkqYzEAJ',
          firstName: 'Michael',
          lastName: 'Chen',
          email: 'michael.chen@company.com',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Lead owner created successfully',
    schema: {
      example: {
        data: {
          id: 'zoho_5725767000000649013',
          firstName: 'Sarah',
          lastName: 'Johnson',
          email: 'sarah.johnson@company.com',
          phone: '+1234567890',
          createdAt: '2024-01-15T10:30:00.000Z',
          updatedAt: '2024-01-15T10:30:00.000Z',
        },
        statusCode: 201,
        timestamp: '2024-01-15T10:30:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid input data or lead owner ID already exists' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  create(@Body() createLeadOwnerDto: CreateLeadOwnerDto) {
    return this.LeadOwnerService.create(createLeadOwnerDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all lead owners',
    description: 'Retrieve all lead owner records. Useful for populating dropdowns or displaying lead owner information.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lead owners retrieved successfully',
    schema: {
      example: {
        data: [
          {
            id: 'zoho_5725767000000649013',
            firstName: 'Sarah',
            lastName: 'Johnson',
            email: 'sarah.johnson@company.com',
            phone: '+1234567890',
            createdAt: '2024-01-15T10:30:00.000Z',
            updatedAt: '2024-01-15T10:30:00.000Z',
          },
          {
            id: 'sf_00Q5e00000DkqYzEAJ',
            firstName: 'Michael',
            lastName: 'Chen',
            email: 'michael.chen@company.com',
            phone: null,
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
  findAll() {
    return this.LeadOwnerService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get lead owner by ID',
    description: 'Retrieve a specific lead owner by their ID (typically from external CRM system).',
  })
  @ApiParam({
    name: 'id',
    description: 'Lead owner ID (from external CRM system)',
    example: 'zoho_5725767000000649013',
  })
  @ApiResponse({
    status: 200,
    description: 'Lead owner retrieved successfully',
    schema: {
      example: {
        data: {
          id: 'zoho_5725767000000649013',
          firstName: 'Sarah',
          lastName: 'Johnson',
          email: 'sarah.johnson@company.com',
          phone: '+1234567890',
          createdAt: '2024-01-15T10:30:00.000Z',
          updatedAt: '2024-01-15T10:30:00.000Z',
        },
        statusCode: 200,
        timestamp: '2024-01-15T10:30:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Lead owner not found' })
  findOne(@Param('id') id: string) {
    return this.LeadOwnerService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update lead owner',
    description: 'Update lead owner information. Typically used when syncing updates from external CRM systems.',
  })
  @ApiParam({
    name: 'id',
    description: 'Lead owner ID (from external CRM system)',
    example: 'zoho_5725767000000649013',
  })
  @ApiBody({
    type: UpdateLeadOwnerDto,
    description: 'Lead owner update data. All fields are optional.',
    examples: {
      'Update Email': {
        value: {
          email: 'sarah.j@newcompany.com',
        },
      },
      'Update Full Info': {
        value: {
          firstName: 'Sarah',
          lastName: 'Johnson-Smith',
          email: 'sarah.johnson-smith@company.com',
          phone: '+1987654321',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Lead owner updated successfully',
    schema: {
      example: {
        data: {
          id: 'zoho_5725767000000649013',
          firstName: 'Sarah',
          lastName: 'Johnson-Smith',
          email: 'sarah.johnson-smith@company.com',
          phone: '+1987654321',
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
  @ApiResponse({ status: 404, description: 'Lead owner not found' })
  update(@Param('id') id: string, @Body() updateLeadOwnerDto: UpdateLeadOwnerDto) {
    return this.LeadOwnerService.update(id, updateLeadOwnerDto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete lead owner',
    description: 'Delete a lead owner record. Note: This will fail if there are leads associated with this owner.',
  })
  @ApiParam({
    name: 'id',
    description: 'Lead owner ID (from external CRM system)',
    example: 'zoho_5725767000000649013',
  })
  @ApiResponse({
    status: 200,
    description: 'Lead owner deleted successfully',
    schema: {
      example: {
        data: {
          id: 'zoho_5725767000000649013',
          firstName: 'Sarah',
          lastName: 'Johnson',
          email: 'sarah.johnson@company.com',
          phone: '+1234567890',
          createdAt: '2024-01-15T10:30:00.000Z',
          updatedAt: '2024-01-15T15:00:00.000Z',
        },
        statusCode: 200,
        timestamp: '2024-01-15T15:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Lead owner not found' })
  @ApiResponse({ status: 409, description: 'Cannot delete lead owner with associated leads' })
  remove(@Param('id') id: string) {
    return this.LeadOwnerService.remove(id);
  }
}

