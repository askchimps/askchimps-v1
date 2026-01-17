import { ApiProperty } from '@nestjs/swagger';

export class ChatFollowUpMessageEntity {
  @ApiProperty({
    description: 'Follow-up message ID (ULID format)',
    example: '01HZXYZ1234567890ABCDEFGHJK',
  })
  id: string;

  @ApiProperty({
    description: 'URL-friendly slug',
    example: 'payment-reminder',
  })
  slug: string;

  @ApiProperty({
    description: 'Organisation ID (ULID format)',
    example: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
  })
  organisationId: string;

  @ApiProperty({
    description: 'Follow-up message content',
    example: 'Hi! Just following up on your payment.',
  })
  content: string;

  @ApiProperty({
    description: 'Sequence number for ordering follow-up messages',
    example: 1,
    default: 1,
  })
  sequence: number;

  @ApiProperty({
    description: 'Delay in minutes before sending this follow-up message',
    example: 60,
    default: 0,
  })
  delayInMinutes: number;

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
