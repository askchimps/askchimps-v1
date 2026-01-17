import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { CHAT_MESSAGE_TYPE } from '@prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateAttachmentDto {
  @ApiProperty({
    description: 'URL of the attachment (publicly accessible)',
    example: 'https://cdn.example.com/files/document.pdf',
  })
  @IsNotEmpty()
  @IsString()
  url: string;

  @ApiProperty({
    description: 'Original filename of the attachment',
    example: 'solar-panel-brochure.pdf',
    maxLength: 255,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  filename: string;

  @ApiProperty({
    description: 'File size in bytes',
    example: 2048576,
  })
  @IsNotEmpty()
  filesize: number;

  @ApiProperty({
    description: 'MIME type of the file',
    example: 'application/pdf',
    maxLength: 100,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  filetype: string;
}

export class CreateChatMessageDto {
  @ApiProperty({
    description: 'Role of the message sender',
    example: 'user',
    maxLength: 50,
    enum: ['user', 'assistant', 'system'],
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  role: string;

  @ApiPropertyOptional({
    description: 'Content of the message (optional for media-only messages)',
    example:
      'Hello! I would like to know more about your solar panel installation services.',
  })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiPropertyOptional({
    description: 'Type of message',
    enum: CHAT_MESSAGE_TYPE,
    example: CHAT_MESSAGE_TYPE.TEXT,
    default: CHAT_MESSAGE_TYPE.TEXT,
    enumName: 'ChatMessageType',
  })
  @IsOptional()
  @IsEnum(CHAT_MESSAGE_TYPE)
  type?: CHAT_MESSAGE_TYPE;

  @ApiPropertyOptional({
    description: 'Attachments for this message (images, documents, etc.)',
    type: [CreateAttachmentDto],
    example: [
      {
        url: 'https://cdn.example.com/images/house-photo.jpg',
        filename: 'house-photo.jpg',
        filesize: 1024000,
        filetype: 'image/jpeg',
      },
    ],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateAttachmentDto)
  attachments?: CreateAttachmentDto[];
}
