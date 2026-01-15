import { IsString, IsOptional, IsEnum, IsInt, Min, Max } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { CALL_STATUS } from '@prisma/client';
import { Type } from 'class-transformer';

export class QueryCallDto {
  @ApiPropertyOptional({
    description: 'Filter by Agent ID (ULID format)',
    example: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
  })
  @IsString()
  @IsOptional()
  agentId?: string;

  @ApiPropertyOptional({
    description: 'Filter by Lead ID (ULID format)',
    example: '01HZXYZ1234567890ABCDEFGHJK',
  })
  @IsString()
  @IsOptional()
  leadId?: string;

  @ApiPropertyOptional({
    description: 'Filter by call status',
    enum: CALL_STATUS,
    example: CALL_STATUS.COMPLETED,
  })
  @IsEnum(CALL_STATUS)
  @IsOptional()
  status?: CALL_STATUS;

  @ApiPropertyOptional({
    description: 'Search by name or phone number',
    example: 'John Doe',
  })
  @IsString()
  @IsOptional()
  search?: string;

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
