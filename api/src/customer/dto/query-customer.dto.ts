import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryCustomerDto {
  @ApiPropertyOptional({
    description: 'Search by first name, last name, email, phone, or company',
    example: 'John',
  })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filter by company name',
    example: 'Acme Corporation',
  })
  @IsString()
  @IsOptional()
  company?: string;

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

