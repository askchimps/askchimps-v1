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
  ApiParam,
  ApiResponse,
} from '@nestjs/swagger';
import { CallService } from './call.service';
import { CreateCallDto } from './dto/create-call.dto';
import { UpdateCallDto } from './dto/update-call.dto';
import { QueryCallDto } from './dto/query-call.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RbacGuard } from '../common/guards/rbac.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Role } from '../common/enums';
import type { UserPayload } from '../common/interfaces/request-with-user.interface';

@ApiTags('Call')
@ApiBearerAuth('JWT-auth')
@Controller({ path: 'organisation/:organisationId/call', version: '1' })
@UseGuards(JwtAuthGuard)
export class CallController {
  constructor(private readonly callService: CallService) {}

  @Post()
  @UseGuards(RbacGuard)
  @Roles(Role.OWNER, Role.ADMIN, Role.MEMBER)
  @ApiOperation({
    summary: 'Create a new call',
    description:
      'Create a new call record for tracking phone conversations with leads.',
  })
  @ApiParam({
    name: 'organisationId',
    description: 'Organisation ID (ULID format)',
    example: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
  })
  @ApiResponse({
    status: 201,
    description: 'Call created successfully',
    schema: {
      example: {
        data: {
          id: '01HZXYZ1234567890ABCDEFGHJK',
          organisationId: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
          agentId: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
          leadId: '01HZXYZ1234567890ABCDEFGHJK',
          externalId: 'ext_call_12345',
          name: 'Follow-up call with John Doe',
          status: 'ACTIVE',
          shortSummary: null,
          detailedSummary: null,
          endedReason: null,
          recordingUrl: null,
          duration: 0,
          sentiment: null,
          analysis: null,
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
  create(
    @Param('organisationId') organisationId: string,
    @Body() createCallDto: CreateCallDto,
    @CurrentUser() user: UserPayload,
  ) {
    // Ensure organisation ID from params matches body
    createCallDto.organisationId = organisationId;
    return this.callService.create(createCallDto, user.sub, user.isSuperAdmin);
  }

  @Get()
  @UseGuards(RbacGuard)
  @Roles(Role.OWNER, Role.ADMIN, Role.MEMBER)
  @ApiOperation({
    summary: 'Get all calls for organisation with pagination',
    description:
      'Retrieve paginated calls for the organisation with optional filters for agent, lead, and status.',
  })
  @ApiParam({
    name: 'organisationId',
    description: 'Organisation ID (ULID format)',
    example: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
  })
  @ApiResponse({
    status: 200,
    description: 'Calls retrieved successfully with pagination',
    schema: {
      example: {
        data: {
          data: [
            {
              id: '01HZXYZ1234567890ABCDEFGHJK',
              organisationId: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
              agentId: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
              leadId: '01HZXYZ1234567890ABCDEFGHJK',
              externalId: 'ext_call_12345',
              name: 'Follow-up call with John Doe',
              status: 'COMPLETED',
              shortSummary: 'Discussed pricing and features',
              detailedSummary:
                'Customer was interested in the premium plan. Scheduled a demo for next week.',
              endedReason: 'Customer ended call',
              recordingUrl:
                'https://storage.example.com/recordings/call-123.mp3',
              duration: 120.5,
              sentiment: 'WARM',
              analysis: {
                keywords: ['pricing', 'features'],
                sentiment_score: 0.8,
              },
              isDeleted: false,
              createdAt: '2024-01-15T10:30:00.000Z',
              updatedAt: '2024-01-15T10:35:00.000Z',
            },
          ],
          total: 100,
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
    @Query() queryDto: QueryCallDto,
    @CurrentUser() user: UserPayload,
  ) {
    return this.callService.findAll(
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
    summary: 'Get call by ID or External ID',
    description:
      'Retrieve a call by its ID or External ID. Optionally include all call messages by setting includeMessages=true.',
  })
  @ApiParam({
    name: 'organisationId',
    description: 'Organisation ID (ULID format)',
    example: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
  })
  @ApiParam({
    name: 'id',
    description: 'Call ID (ULID) or External ID',
    example: '01HZXYZ1234567890ABCDEFGHJK',
  })
  @ApiParam({
    name: 'includeMessages',
    required: false,
    description: 'Include all call messages in the response',
    example: 'true',
    schema: { type: 'boolean', default: false },
  })
  @ApiResponse({
    status: 200,
    description: 'Call retrieved successfully',
    schema: {
      example: {
        data: {
          id: '01HZXYZ1234567890ABCDEFGHJK',
          organisationId: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
          agentId: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
          leadId: '01HZXYZ1234567890ABCDEFGHJK',
          externalId: 'ext_call_12345',
          name: 'Follow-up call with John Doe',
          status: 'COMPLETED',
          shortSummary: 'Discussed pricing and features',
          detailedSummary: 'Customer was interested in the premium plan.',
          endedReason: 'Customer ended call',
          recordingUrl: 'https://storage.example.com/recordings/call-123.mp3',
          duration: 120.5,
          sentiment: 'WARM',
          analysis: { keywords: ['pricing', 'features'] },
          isDeleted: false,
          createdAt: '2024-01-15T10:30:00.000Z',
          updatedAt: '2024-01-15T10:35:00.000Z',
          messages: [
            {
              id: '01HZXYZ1234567890ABCDEFGHJP',
              callId: '01HZXYZ1234567890ABCDEFGHJK',
              organisationId: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
              role: 'user',
              content: 'Hello, I would like to know about pricing.',
              isDeleted: false,
              createdAt: '2024-01-15T10:30:05.000Z',
              updatedAt: '2024-01-15T10:30:05.000Z',
            },
            {
              id: '01HZXYZ1234567890ABCDEFGHJQ',
              callId: '01HZXYZ1234567890ABCDEFGHJK',
              organisationId: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
              role: 'assistant',
              content: 'I would be happy to help you with pricing information.',
              isDeleted: false,
              createdAt: '2024-01-15T10:30:10.000Z',
              updatedAt: '2024-01-15T10:30:10.000Z',
            },
          ],
        },
        statusCode: 200,
        timestamp: '2024-01-15T10:30:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Call not found' })
  findOne(
    @Param('organisationId') organisationId: string,
    @Param('id') id: string,
    @Query('includeMessages') includeMessages: string,
    @CurrentUser() user: UserPayload,
  ) {
    const shouldIncludeMessages = includeMessages === 'true';
    return this.callService.findOne(
      id,
      organisationId,
      user.sub,
      user.isSuperAdmin,
      shouldIncludeMessages,
    );
  }

  @Patch(':id')
  @UseGuards(RbacGuard)
  @Roles(Role.OWNER, Role.ADMIN, Role.MEMBER)
  @ApiOperation({ summary: 'Update call by ID or External ID' })
  @ApiParam({ name: 'organisationId', description: 'Organisation ID' })
  @ApiParam({ name: 'id', description: 'Call ID (ULID) or External ID' })
  @ApiResponse({ status: 200, description: 'Call updated successfully' })
  @ApiResponse({ status: 404, description: 'Call not found' })
  update(
    @Param('organisationId') organisationId: string,
    @Param('id') id: string,
    @Body() updateCallDto: UpdateCallDto,
    @CurrentUser() user: UserPayload,
  ) {
    return this.callService.update(
      id,
      organisationId,
      updateCallDto,
      user.sub,
      user.isSuperAdmin,
    );
  }

  @Delete(':id')
  @UseGuards(RbacGuard)
  @Roles(Role.OWNER, Role.ADMIN)
  @ApiOperation({ summary: 'Delete call by ID or External ID (soft delete)' })
  @ApiParam({ name: 'organisationId', description: 'Organisation ID' })
  @ApiParam({ name: 'id', description: 'Call ID (ULID) or External ID' })
  @ApiResponse({ status: 200, description: 'Call deleted successfully' })
  @ApiResponse({ status: 404, description: 'Call not found' })
  remove(
    @Param('organisationId') organisationId: string,
    @Param('id') id: string,
    @CurrentUser() user: UserPayload,
  ) {
    return this.callService.remove(
      id,
      organisationId,
      user.sub,
      user.isSuperAdmin,
    );
  }
}
