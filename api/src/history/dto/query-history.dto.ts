import { IsString, IsOptional, IsEnum, IsDateString, IsInt, Min, Max } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { HISTORY_ACTION, HISTORY_TRIGGER } from '@prisma/client';
import { Type } from 'class-transformer';

export class QueryHistoryDto {
  @ApiPropertyOptional({
    description: 'Filter by table name',
    example: 'organisations',
  })
  @IsString()
  @IsOptional()
  tableName?: string;

  @ApiPropertyOptional({
    description: 'Filter by record ID',
    example: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
  })
  @IsString()
  @IsOptional()
  recordId?: string;

  @ApiPropertyOptional({
    description: 'Filter by field name',
    example: 'name',
  })
  @IsString()
  @IsOptional()
  fieldName?: string;

  @ApiPropertyOptional({
    description: 'Filter by action type',
    enum: HISTORY_ACTION,
    example: HISTORY_ACTION.UPDATE,
  })
  @IsEnum(HISTORY_ACTION)
  @IsOptional()
  action?: HISTORY_ACTION;

  @ApiPropertyOptional({
    description: 'Filter by trigger type',
    enum: HISTORY_TRIGGER,
    example: HISTORY_TRIGGER.USER_ACTION,
  })
  @IsEnum(HISTORY_TRIGGER)
  @IsOptional()
  trigger?: HISTORY_TRIGGER;

  @ApiPropertyOptional({
    description: 'Filter by user ID',
    example: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
  })
  @IsString()
  @IsOptional()
  userId?: string;

  @ApiPropertyOptional({
    description: 'Filter by organisation ID',
    example: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
  })
  @IsString()
  @IsOptional()
  organisationId?: string;

  @ApiPropertyOptional({
    description: 'Filter by agent ID',
    example: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
  })
  @IsString()
  @IsOptional()
  agentId?: string;

  @ApiPropertyOptional({
    description: 'Filter by lead ID',
    example: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
  })
  @IsString()
  @IsOptional()
  leadId?: string;

  @ApiPropertyOptional({
    description: 'Filter by request ID',
    example: 'req_123456789',
  })
  @IsString()
  @IsOptional()
  requestId?: string;

  @ApiPropertyOptional({
    description: 'Filter records created after this date (ISO 8601)',
    example: '2024-01-01T00:00:00Z',
  })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'Filter records created before this date (ISO 8601)',
    example: '2024-12-31T23:59:59Z',
  })
  @IsDateString()
  @IsOptional()
  endDate?: string;

  @ApiPropertyOptional({
    description: 'Number of records to return',
    example: 50,
    minimum: 1,
    maximum: 1000,
    default: 50,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(1000)
  @IsOptional()
  limit?: number;

  @ApiPropertyOptional({
    description: 'Number of records to skip',
    example: 0,
    minimum: 0,
    default: 0,
  })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @IsOptional()
  offset?: number;

  @ApiPropertyOptional({
    description: 'Sort order (asc or desc)',
    example: 'desc',
    enum: ['asc', 'desc'],
    default: 'desc',
  })
  @IsString()
  @IsOptional()
  sortOrder?: 'asc' | 'desc';
}

