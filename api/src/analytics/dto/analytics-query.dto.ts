import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsDateString, IsString, Matches } from 'class-validator';

export class AnalyticsQueryDto {
    @ApiProperty({
        description: 'Start date for analytics (ISO 8601 format)',
        example: '2024-01-01T00:00:00.000Z',
        required: false,
    })
    @IsOptional()
    @IsDateString()
    startDate?: string;

    @ApiProperty({
        description: 'End date for analytics (ISO 8601 format)',
        example: '2024-01-31T23:59:59.999Z',
        required: false,
    })
    @IsOptional()
    @IsDateString()
    endDate?: string;
}

export class CallActivityQueryDto {
    @ApiProperty({
        description: 'Month in YYYY-MM format',
        example: '2024-01',
        required: false,
    })
    @IsOptional()
    @IsString()
    @Matches(/^\d{4}-\d{2}$/, {
        message: 'Month must be in YYYY-MM format',
    })
    month?: string;
}
