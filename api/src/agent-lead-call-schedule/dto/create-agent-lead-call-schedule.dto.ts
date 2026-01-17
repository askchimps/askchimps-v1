import {
    IsString,
    IsNotEmpty,
    IsDateString,
    IsEnum,
    IsOptional,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsULID } from '../../common/validators/is-ulid.validator';
import { SCHEDULE_TYPE } from '@prisma/client';

export class CreateAgentLeadCallScheduleDto {
    @ApiPropertyOptional({
        description: 'Type of schedule',
        enum: SCHEDULE_TYPE,
        example: SCHEDULE_TYPE.INITIAL,
        default: SCHEDULE_TYPE.INITIAL,
    })
    @IsEnum(SCHEDULE_TYPE)
    @IsOptional()
    type?: SCHEDULE_TYPE;

    @ApiProperty({
        description: 'Agent ID (ULID format)',
        example: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
    })
    @IsString()
    @IsNotEmpty()
    @IsULID()
    agentId: string;

    @ApiProperty({
        description: 'Lead ID (ULID format)',
        example: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
    })
    @IsString()
    @IsNotEmpty()
    @IsULID()
    leadId: string;

    @ApiProperty({
        description: 'Scheduled call time (ISO 8601 format)',
        example: '2024-12-31T10:00:00Z',
    })
    @IsDateString()
    @IsNotEmpty()
    callTime: string;
}
