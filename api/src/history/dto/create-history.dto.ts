import { IsString, IsNotEmpty, IsEnum, IsOptional, IsBoolean, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { HISTORY_ACTION, HISTORY_TRIGGER } from '@prisma/client';

export class CreateHistoryDto {
  @ApiProperty({
    description: 'Name of the table that was changed',
    example: 'organisations',
  })
  @IsString()
  @IsNotEmpty()
  tableName: string;

  @ApiProperty({
    description: 'ID of the record that was changed',
    example: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
  })
  @IsString()
  @IsNotEmpty()
  recordId: string;

  @ApiProperty({
    description: 'Type of action performed',
    enum: HISTORY_ACTION,
    example: HISTORY_ACTION.UPDATE,
  })
  @IsEnum(HISTORY_ACTION)
  @IsNotEmpty()
  action: HISTORY_ACTION;

  @ApiProperty({
    description: 'What triggered this change',
    enum: HISTORY_TRIGGER,
    example: HISTORY_TRIGGER.USER_ACTION,
  })
  @IsEnum(HISTORY_TRIGGER)
  @IsNotEmpty()
  trigger: HISTORY_TRIGGER;

  @ApiPropertyOptional({
    description: 'User ID who made the change',
    example: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
  })
  @IsString()
  @IsOptional()
  userId?: string;

  @ApiPropertyOptional({
    description: 'User email who made the change',
    example: 'user@example.com',
  })
  @IsString()
  @IsOptional()
  userEmail?: string;

  @ApiPropertyOptional({
    description: 'User name who made the change',
    example: 'John Doe',
  })
  @IsString()
  @IsOptional()
  userName?: string;

  @ApiPropertyOptional({
    description: 'Organisation ID context',
    example: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
  })
  @IsString()
  @IsOptional()
  organisationId?: string;

  @ApiPropertyOptional({
    description: 'Agent ID context',
    example: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
  })
  @IsString()
  @IsOptional()
  agentId?: string;

  @ApiPropertyOptional({
    description: 'Lead ID context',
    example: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
  })
  @IsString()
  @IsOptional()
  leadId?: string;

  @ApiPropertyOptional({
    description: 'Call ID context',
    example: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
  })
  @IsString()
  @IsOptional()
  callId?: string;

  @ApiPropertyOptional({
    description: 'Chat ID context',
    example: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
  })
  @IsString()
  @IsOptional()
  chatId?: string;

  @ApiPropertyOptional({
    description: 'Field name that changed (null for CREATE/DELETE)',
    example: 'name',
  })
  @IsString()
  @IsOptional()
  fieldName?: string;

  @ApiPropertyOptional({
    description: 'Old value of the field',
    example: 'Old Name',
  })
  @IsOptional()
  oldValue?: any;

  @ApiPropertyOptional({
    description: 'New value of the field',
    example: 'New Name',
  })
  @IsOptional()
  newValue?: any;

  @ApiPropertyOptional({
    description: 'Human-readable reason for the change',
    example: 'Updated organisation name as requested by customer',
  })
  @IsString()
  @IsOptional()
  reason?: string;

  @ApiPropertyOptional({
    description: 'Detailed description of what happened',
    example: 'Organisation name was updated from "Old Corp" to "New Corp"',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: 'Additional metadata',
    example: { ipAddress: '192.168.1.1', userAgent: 'Mozilla/5.0...' },
  })
  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Unique request ID for tracing',
    example: 'req_123456789',
  })
  @IsString()
  @IsOptional()
  requestId?: string;

  @ApiPropertyOptional({
    description: 'User session ID',
    example: 'sess_123456789',
  })
  @IsString()
  @IsOptional()
  sessionId?: string;

  @ApiPropertyOptional({
    description: 'IP address of the requester',
    example: '192.168.1.1',
  })
  @IsString()
  @IsOptional()
  ipAddress?: string;

  @ApiPropertyOptional({
    description: 'User agent string',
    example: 'Mozilla/5.0...',
  })
  @IsString()
  @IsOptional()
  userAgent?: string;

  @ApiPropertyOptional({
    description: 'API endpoint that was called',
    example: '/v1/organisation/123/update',
  })
  @IsString()
  @IsOptional()
  apiEndpoint?: string;

  @ApiPropertyOptional({
    description: 'HTTP method used',
    example: 'PATCH',
  })
  @IsString()
  @IsOptional()
  httpMethod?: string;

  @ApiPropertyOptional({
    description: 'Whether this was an error',
    example: false,
  })
  @IsBoolean()
  @IsOptional()
  isError?: boolean;

  @ApiPropertyOptional({
    description: 'Error message if applicable',
    example: 'Failed to update record',
  })
  @IsString()
  @IsOptional()
  errorMessage?: string;

  @ApiPropertyOptional({
    description: 'Error stack trace if applicable',
  })
  @IsString()
  @IsOptional()
  errorStack?: string;
}


