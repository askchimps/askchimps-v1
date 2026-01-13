import { IsString, IsOptional, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { EXECUTION_TYPE } from '@prisma/client';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

export class QueryExecutionDto extends PaginationQueryDto {
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
    description: 'Filter by execution type',
    enum: EXECUTION_TYPE,
    example: EXECUTION_TYPE.CALL_TRIGGER,
  })
  @IsEnum(EXECUTION_TYPE)
  @IsOptional()
  type?: EXECUTION_TYPE;
}

