import { IsString, IsOptional, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { CHAT_STATUS, CHAT_SOURCE } from '@prisma/client';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

export class QueryChatDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Filter by Lead ID',
    example: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
  })
  @IsString()
  @IsOptional()
  leadId?: string;

  @ApiPropertyOptional({
    description: 'Filter by Agent ID',
    example: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
  })
  @IsString()
  @IsOptional()
  agentId?: string;

  @ApiPropertyOptional({
    description: 'Filter by chat status',
    enum: CHAT_STATUS,
    example: CHAT_STATUS.OPEN,
  })
  @IsEnum(CHAT_STATUS)
  @IsOptional()
  status?: CHAT_STATUS;

  @ApiPropertyOptional({
    description: 'Filter by chat source',
    enum: CHAT_SOURCE,
    example: CHAT_SOURCE.WHATSAPP,
  })
  @IsEnum(CHAT_SOURCE)
  @IsOptional()
  source?: CHAT_SOURCE;
}

