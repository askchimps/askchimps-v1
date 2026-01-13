import { IsString, IsOptional, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { CALL_STATUS } from '@prisma/client';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

export class QueryCallDto extends PaginationQueryDto {
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
    description: 'Filter by call status',
    enum: CALL_STATUS,
    example: CALL_STATUS.COMPLETED,
  })
  @IsEnum(CALL_STATUS)
  @IsOptional()
  status?: CALL_STATUS;

  @ApiPropertyOptional({
    description: 'Search by lead name (first or last name)',
    example: 'John',
  })
  @IsString()
  @IsOptional()
  search?: string;
}

