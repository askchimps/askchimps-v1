import {
  IsString,
  IsNotEmpty,
  MaxLength,
  IsInt,
  Min,
  IsOptional,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsULID } from '../../common/validators/is-ulid.validator';
import { Type } from 'class-transformer';

export class CreateChatFollowUpMessageDto {
  @ApiProperty({
    description: 'URL-friendly slug for the follow-up message',
    example: 'payment-reminder',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  slug: string;

  @ApiProperty({
    description: 'Organisation ID (ULID format)',
    example: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
  })
  @IsString()
  @IsNotEmpty()
  @IsULID()
  organisationId: string;

  @ApiProperty({
    description: 'Follow-up message content',
    example:
      'Hi! Just following up on your payment. Please let us know if you need any assistance.',
  })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiPropertyOptional({
    description: 'Sequence number for ordering follow-up messages',
    example: 1,
    default: 1,
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  sequence?: number;

  @ApiPropertyOptional({
    description: 'Delay in minutes before sending this follow-up message',
    example: 60,
    default: 0,
    minimum: 0,
  })
  @IsInt()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  delayInMinutes?: number;
}
