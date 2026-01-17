import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ChatFollowUpScheduleEntity {
  @ApiProperty({
    description: 'Schedule ID (ULID format)',
    example: '01HZXYZ1234567890ABCDEFGHJK',
  })
  id: string;

  @ApiProperty({
    description: 'Chat ID (ULID format)',
    example: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
  })
  chatId: string;

  @ApiProperty({
    description: 'Follow-up message ID (ULID format)',
    example: '01HZXYZ1234567890ABCDEFGHJL',
  })
  followUpMessageId: string;

  @ApiProperty({
    description: 'Scheduled time for the follow-up message',
    example: '2024-01-20T14:30:00.000Z',
  })
  scheduledAt: Date;

  @ApiProperty({
    description: 'Whether the message has been sent',
    example: false,
  })
  isSent: boolean;

  @ApiPropertyOptional({
    description: 'When the message was actually sent',
    example: '2024-01-20T14:30:15.000Z',
  })
  sentAt: Date | null;

  @ApiProperty({
    description: 'Soft delete flag',
    example: false,
  })
  isDeleted: boolean;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2024-01-15T10:30:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2024-01-15T10:30:00.000Z',
  })
  updatedAt: Date;
}
