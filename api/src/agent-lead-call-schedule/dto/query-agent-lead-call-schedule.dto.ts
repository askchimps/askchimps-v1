import { IsString, IsOptional, IsEnum, IsDateString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { SCHEDULE_TYPE } from '@prisma/client';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

export class QueryAgentLeadCallScheduleDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Filter by schedule type',
    enum: SCHEDULE_TYPE,
    example: SCHEDULE_TYPE.INITIAL,
  })
  @IsEnum(SCHEDULE_TYPE)
  @IsOptional()
  type?: SCHEDULE_TYPE;

  @ApiPropertyOptional({
    description: 'Filter by Agent ID',
    example: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
  })
  @IsString()
  @IsOptional()
  agentId?: string;

  @ApiPropertyOptional({
    description: 'Filter by Lead ID',
    example: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
  })
  @IsString()
  @IsOptional()
  leadId?: string;

  @ApiPropertyOptional({
    description: 'Filter by start date time (ISO 8601 format)',
    example: '2024-01-15T10:00:00.000Z',
  })
  @IsDateString()
  @IsOptional()
  startDateTime?: string;

  @ApiPropertyOptional({
    description: 'Filter by end date time (ISO 8601 format)',
    example: '2024-01-15T18:00:00.000Z',
  })
  @IsDateString()
  @IsOptional()
  endDateTime?: string;
}

