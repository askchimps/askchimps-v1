import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsULID } from '../../common/validators/is-ulid.validator';
import { EXECUTION_TYPE } from '@prisma/client';

export class CreateExecutionDto {
  @ApiProperty({
    description: 'Execution ID - must be provided by client',
    example: '12321321',
  })
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty({
    description: 'Type of execution',
    enum: EXECUTION_TYPE,
    example: EXECUTION_TYPE,
  })
  @IsEnum(EXECUTION_TYPE)
  @IsNotEmpty()
  type: EXECUTION_TYPE;

  @ApiProperty({
    description: 'Organisation ID (ULID format)',
    example: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
  })
  @IsString()
  @IsNotEmpty()
  @IsULID()
  organisationId: string;

  @ApiPropertyOptional({
    description: 'Agent ID (ULID format)',
    example: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
  })
  @IsString()
  @IsOptional()
  @IsULID()
  agentId?: string;

  @ApiPropertyOptional({
    description: 'Lead ID (ULID format)',
    example: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
  })
  @IsString()
  @IsOptional()
  @IsULID()
  leadId?: string;

  @ApiPropertyOptional({
    description: 'Call ID (ULID format)',
    example: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
  })
  @IsString()
  @IsOptional()
  @IsULID()
  callId?: string;

  @ApiPropertyOptional({
    description: 'Chat ID (ULID format)',
    example: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
  })
  @IsString()
  @IsOptional()
  @IsULID()
  chatId?: string;
}

