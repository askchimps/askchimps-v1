import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateChatAgentDto {
  @ApiPropertyOptional({
    description: 'Whether the agent is currently active for this chat',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

