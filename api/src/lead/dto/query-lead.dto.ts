import { IsString, IsOptional, IsInt, Min, Max } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class QueryLeadDto {
    @ApiPropertyOptional({
        description: 'Filter by Agent ID (ULID format)',
        example: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
    })
    @IsString()
    @IsOptional()
    agentId?: string;

    @ApiPropertyOptional({
        description: 'Filter by lead status',
        example: 'New',
    })
    @IsString()
    @IsOptional()
    status?: string;

    @ApiPropertyOptional({
        description: 'Filter by lead disposition',
        example: 'Interested',
    })
    @IsString()
    @IsOptional()
    disposition?: string;

    @ApiPropertyOptional({
        description: 'Filter by lead source',
        example: 'Website',
    })
    @IsString()
    @IsOptional()
    source?: string;

    @ApiPropertyOptional({
        description: 'Search by first name, last name, email, or phone number',
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
