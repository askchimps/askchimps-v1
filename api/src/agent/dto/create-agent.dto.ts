import { IsString, IsNotEmpty, MaxLength, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IsULID } from '../../common/validators/is-ulid.validator';
import { AGENT_TYPE } from '@prisma/client';

export class CreateAgentDto {
  @ApiProperty({
    description: 'Name of the agent',
    example: 'Alex - Marketing Agent',
    maxLength: 200,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name: string;

  @ApiProperty({
    description: 'Type of the agent',
    enum: AGENT_TYPE,
    example: AGENT_TYPE.MARKETING,
  })
  @IsEnum(AGENT_TYPE)
  @IsNotEmpty()
  type: AGENT_TYPE;

  @ApiProperty({
    description: 'Organisation ID (ULID format)',
    example: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
  })
  @IsString()
  @IsNotEmpty()
  @IsULID()
  organisationId: string;

  @ApiProperty({
    description: 'Unique slug for the agent',
    example: 'alex-marketing-agent',
    maxLength: 200,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  slug: string;
}

