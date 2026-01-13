import { IsString, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

export class QueryCallMessageDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Filter by message role (e.g., agent, user)',
    example: 'agent',
  })
  @IsString()
  @IsOptional()
  role?: string;

  @ApiPropertyOptional({
    description: 'Search in message content',
    example: 'hello',
  })
  @IsString()
  @IsOptional()
  search?: string;
}

