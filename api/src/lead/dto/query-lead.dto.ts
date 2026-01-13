import { IsString, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

export class QueryLeadDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Filter by Agent ID',
    example: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
  })
  @IsString()
  @IsOptional()
  agentId?: string;

  @ApiPropertyOptional({
    description: 'Filter by status',
    example: 'New',
  })
  @IsString()
  @IsOptional()
  status?: string;

  @ApiPropertyOptional({
    description: 'Filter by disposition',
    example: 'Interested',
  })
  @IsString()
  @IsOptional()
  disposition?: string;

  @ApiPropertyOptional({
    description: 'Filter by source',
    example: 'WhatsApp',
  })
  @IsString()
  @IsOptional()
  source?: string;

  @ApiPropertyOptional({
    description: 'Search by name, email, or phone',
    example: 'john',
  })
  @IsString()
  @IsOptional()
  search?: string;
}

