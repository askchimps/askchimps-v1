import { EXECUTION_TYPE } from '@prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ExecutionEntity {
  @ApiProperty({
    description: 'Execution ID',
    example: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
  })
  id: string;

  @ApiProperty({
    description: 'Type of execution',
    enum: EXECUTION_TYPE,
    example: EXECUTION_TYPE.CALL_END,
  })
  type: EXECUTION_TYPE;

  @ApiProperty({
    description: 'Organisation ID',
    example: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
  })
  organisationId: string;

  @ApiPropertyOptional({
    description: 'Agent ID',
    example: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
  })
  agentId: string | null;

  @ApiPropertyOptional({
    description: 'Lead ID',
    example: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
  })
  leadId: string | null;

  @ApiPropertyOptional({
    description: 'Call ID',
    example: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
  })
  callId: string | null;

  @ApiPropertyOptional({
    description: 'Chat ID',
    example: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
  })
  chatId: string | null;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2026-01-10T10:30:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2026-01-10T10:30:00.000Z',
  })
  updatedAt: Date;

  constructor(partial: Partial<ExecutionEntity>) {
    Object.assign(this, partial);
  }
}

