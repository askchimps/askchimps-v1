import { IsBoolean, IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { CHAT_SOURCE, CHAT_STATUS } from '@prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsULID } from '../../common/validators/is-ulid.validator';

export class CreateChatDto {
  @ApiProperty({
    description: 'Agent ID (ULID format)',
    example: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
  })
  @IsNotEmpty()
  @IsULID()
  agentId: string;

  @ApiPropertyOptional({
    description: 'Lead ID to associate with this chat (ULID format)',
    example: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
  })
  @IsOptional()
  @IsULID()
  leadId?: string;

  @ApiPropertyOptional({
    description: 'Name/title of the chat',
    example: 'Product Inquiry - John Doe',
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @ApiProperty({
    description: 'Source platform of the chat',
    enum: CHAT_SOURCE,
    example: CHAT_SOURCE.WHATSAPP,
    enumName: 'ChatSource',
  })
  @IsNotEmpty()
  @IsEnum(CHAT_SOURCE)
  source: CHAT_SOURCE;

  @ApiProperty({
    description: 'Unique identifier from the source platform (e.g., WhatsApp phone number, Instagram user ID)',
    example: '+1234567890',
    maxLength: 255,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  sourceId: string;

  @ApiPropertyOptional({
    description: 'Status of the chat',
    enum: CHAT_STATUS,
    example: CHAT_STATUS.NEW,
    default: CHAT_STATUS.NEW,
    enumName: 'ChatStatus',
  })
  @IsOptional()
  @IsEnum(CHAT_STATUS)
  status?: CHAT_STATUS;

  @ApiPropertyOptional({
    description: 'Short summary of the chat (AI-generated or manual)',
    example: 'Customer inquiring about solar panel installation pricing',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  shortSummary?: string;

  @ApiPropertyOptional({
    description: 'Detailed summary of the chat conversation (AI-generated or manual)',
    example: 'Customer John Doe contacted via WhatsApp asking about solar panel installation. Interested in 5kW system for residential property. Requested quote and installation timeline.',
  })
  @IsOptional()
  @IsString()
  detailedSummary?: string;

  @ApiPropertyOptional({
    description: 'Whether the chat has been transferred to another agent/system',
    example: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isTransferred?: boolean;
}

