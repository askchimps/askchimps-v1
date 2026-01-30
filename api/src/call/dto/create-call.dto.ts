import {
    IsString,
    IsNotEmpty,
    IsOptional,
    IsEnum,
    MaxLength,
    IsNumber,
    IsObject,
    IsArray,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsULID } from '../../common/validators/is-ulid.validator';

export enum CallStatus {
    ACTIVE = 'ACTIVE',
    FAILED = 'FAILED',
    DISCONNECTED = 'DISCONNECTED',
    RESCHEDULED = 'RESCHEDULED',
    MISSED = 'MISSED',
    COMPLETED = 'COMPLETED',
}

export enum Sentiment {
    HOT = 'HOT',
    WARM = 'WARM',
    COLD = 'COLD',
}

export class CreateCallDto {
    @ApiProperty({
        description: 'Organisation ID (ULID format)',
        example: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
    })
    @IsString()
    @IsNotEmpty()
    @IsULID()
    organisationId: string;

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

    @ApiPropertyOptional({
        description: 'External ID from third-party system (unique)',
        example: 'ext_call_12345',
        maxLength: 255,
    })
    @IsString()
    @IsOptional()
    @MaxLength(255)
    externalId?: string;

    @ApiPropertyOptional({
        description: 'Name/title of the call',
        example: 'Follow-up call with John Doe',
        maxLength: 200,
    })
    @IsString()
    @IsOptional()
    @MaxLength(200)
    name?: string;

    @ApiPropertyOptional({
        description: 'Call status',
        enum: CallStatus,
        default: CallStatus.ACTIVE,
    })
    @IsEnum(CallStatus)
    @IsOptional()
    status?: CallStatus;

    @ApiPropertyOptional({
        description: 'Short summary of the call',
        maxLength: 500,
    })
    @IsString()
    @IsOptional()
    @MaxLength(500)
    shortSummary?: string;

    @ApiPropertyOptional({
        description: 'Detailed summary of the call',
    })
    @IsString()
    @IsOptional()
    detailedSummary?: string;

    @ApiPropertyOptional({
        description: 'Reason why the call ended',
        example: 'Customer hung up',
        maxLength: 500,
    })
    @IsString()
    @IsOptional()
    @MaxLength(500)
    endedReason?: string;

    @ApiPropertyOptional({
        description: 'URL of the call recording',
        example: 'https://storage.example.com/recordings/call-123.mp3',
        maxLength: 1000,
    })
    @IsString()
    @IsOptional()
    @MaxLength(1000)
    recordingUrl?: string;

    @ApiPropertyOptional({
        description: 'Duration of the call in seconds',
        example: 120.5,
        default: 0,
    })
    @IsNumber()
    @IsOptional()
    duration?: number;

    @ApiPropertyOptional({
        description: 'Sentiment of the call',
        enum: Sentiment,
        example: Sentiment.WARM,
    })
    @IsEnum(Sentiment)
    @IsOptional()
    sentiment?: Sentiment;

    @ApiPropertyOptional({
        description: 'Analysis data in JSON format',
        example: { keywords: ['pricing', 'features'], sentiment_score: 0.8 },
    })
    @IsObject()
    @IsOptional()
    analysis?: Record<string, any>;

    @ApiPropertyOptional({
        description:
            'Array of tag IDs to associate with this call (ULID format)',
        example: ['01HZXYZ1234567890ABCDEFGHJK', '01HZXYZ1234567890ABCDEFGHJL'],
        type: [String],
    })
    @IsArray()
    @IsOptional()
    @IsString({ each: true })
    tagIds?: string[];
}
