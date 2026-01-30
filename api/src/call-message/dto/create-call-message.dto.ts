import {
    IsString,
    IsNotEmpty,
    MaxLength,
    IsArray,
    ValidateNested,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IsULID } from '../../common/validators/is-ulid.validator';
import { Type } from 'class-transformer';

/**
 * DTO for a single message item (without IDs)
 * Used for bulk message creation
 */
export class CallMessageItemDto {
    @ApiProperty({
        description:
            'Role of the message sender (e.g., user, assistant, system)',
        example: 'user',
        maxLength: 50,
    })
    @IsString()
    @IsNotEmpty()
    @MaxLength(50)
    role: string;

    @ApiProperty({
        description: 'Content of the message',
        example: 'Hello, I would like to inquire about your services.',
    })
    @IsString()
    @IsNotEmpty()
    content: string;
}

/**
 * DTO for creating a single call message
 */
export class CreateCallMessageDto {
    @ApiProperty({
        description: 'Call ID (ULID format)',
        example: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
    })
    @IsString()
    @IsNotEmpty()
    @IsULID()
    callId: string;

    @ApiProperty({
        description: 'Organisation ID (ULID format)',
        example: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
    })
    @IsString()
    @IsNotEmpty()
    @IsULID()
    organisationId: string;

    @ApiProperty({
        description:
            'Role of the message sender (e.g., user, assistant, system)',
        example: 'user',
        maxLength: 50,
    })
    @IsString()
    @IsNotEmpty()
    @MaxLength(50)
    role: string;

    @ApiProperty({
        description: 'Content of the message',
        example: 'Hello, I would like to inquire about your services.',
    })
    @IsString()
    @IsNotEmpty()
    content: string;
}

/**
 * DTO for creating multiple call messages in bulk
 */
export class CreateBulkCallMessageDto {
    @ApiProperty({
        description: 'Array of messages to create',
        type: [CallMessageItemDto],
        example: [
            {
                role: 'user',
                content: 'Hello, I would like to inquire about your services.',
            },
            {
                role: 'assistant',
                content:
                    'Hello! I would be happy to help you. What would you like to know?',
            },
        ],
    })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CallMessageItemDto)
    messages: CallMessageItemDto[];
}
