import { IsString, IsNotEmpty, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IsULID } from '../../common/validators/is-ulid.validator';

export class CreateAgentLeadCallScheduleDto {
  @ApiProperty({
    description: 'Agent ID (ULID format)',
    example: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
  })
  @IsString()
  @IsNotEmpty()
  @IsULID()
  agentId: string;

  @ApiProperty({
    description: 'Lead ID (ULID format)',
    example: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
  })
  @IsString()
  @IsNotEmpty()
  @IsULID()
  leadId: string;

  @ApiProperty({
    description: 'Scheduled call time (ISO 8601 format)',
    example: '2024-12-31T10:00:00Z',
  })
  @IsDateString()
  @IsNotEmpty()
  callTime: string;
}

