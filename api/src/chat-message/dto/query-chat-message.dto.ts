import { IsString, IsOptional, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { CHAT_MESSAGE_TYPE } from '@prisma/client';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

export class QueryChatMessageDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Filter by message type',
    enum: CHAT_MESSAGE_TYPE,
    example: CHAT_MESSAGE_TYPE.TEXT,
  })
  @IsEnum(CHAT_MESSAGE_TYPE)
  @IsOptional()
  type?: CHAT_MESSAGE_TYPE;

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

