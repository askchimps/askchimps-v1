import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { IsULID } from '../../common/validators/is-ulid.validator';

export class TransferChatDto {
  @ApiProperty({
    description: 'New agent ID to transfer the chat to (ULID format)',
    example: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
  })
  @IsString()
  @IsNotEmpty()
  @IsULID()
  newAgentId: string;

  @ApiPropertyOptional({
    description: 'Reason for transferring the chat',
    example: 'Customer requested to speak with a senior agent',
  })
  @IsString()
  @IsOptional()
  transferReason?: string;
}

