import { IsString, IsOptional, IsEnum, IsInt, Min, Max } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { CHAT_STATUS, CHAT_SOURCE } from '@prisma/client';
import { Type } from 'class-transformer';

export class QueryChatDto {
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
        description: 'Filter by chat status',
        enum: CHAT_STATUS,
        example: CHAT_STATUS.NEW,
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

    @ApiPropertyOptional({
        description: 'Search by chat name, lead name, or phone number',
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
