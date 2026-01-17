import {
    IsString,
    IsNotEmpty,
    IsDateString,
    IsBoolean,
    IsOptional,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsULID } from '../../common/validators/is-ulid.validator';

export class CreateChatFollowUpScheduleDto {
    @ApiProperty({
        description: 'Chat ID (ULID format)',
        example: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
    })
    @IsString()
    @IsNotEmpty()
    @IsULID()
    chatId: string;

    @ApiProperty({
        description: 'Follow-up message ID (ULID format)',
        example: '01HZXYZ1234567890ABCDEFGHJK',
    })
    @IsString()
    @IsNotEmpty()
    @IsULID()
    followUpMessageId: string;

    @ApiProperty({
        description:
            'Scheduled time for the follow-up message (ISO 8601 format)',
        example: '2024-01-20T14:30:00.000Z',
    })
    @IsDateString()
    @IsNotEmpty()
    scheduledAt: string;

    @ApiPropertyOptional({
        description: 'Whether the message has been sent',
        example: false,
        default: false,
    })
    @IsBoolean()
    @IsOptional()
    isSent?: boolean;

    @ApiPropertyOptional({
        description: 'When the message was actually sent (ISO 8601 format)',
        example: '2024-01-20T14:30:15.000Z',
    })
    @IsDateString()
    @IsOptional()
    sentAt?: string;
}
