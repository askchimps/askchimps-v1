import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsBoolean, IsOptional } from 'class-validator';
import { IsULID } from '../../common/validators/is-ulid.validator';

export class CreateChatAgentDto {
  @ApiProperty({
    description: 'Chat ID (ULID format)',
    example: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
  })
  @IsString()
  @IsNotEmpty()
  @IsULID()
  chatId: string;

  @ApiProperty({
    description: 'Agent ID (ULID format)',
    example: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
  })
  @IsString()
  @IsNotEmpty()
  @IsULID()
  agentId: string;

  @ApiPropertyOptional({
    description: 'Whether the agent is currently active for this chat',
    example: true,
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

