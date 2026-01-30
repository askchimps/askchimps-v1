import { IsString, IsNotEmpty, MaxLength, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsULID } from '../../common/validators/is-ulid.validator';
import { AGENT_TYPE, AGENT_ROLE } from '@prisma/client';

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
        description: 'Role of the agent',
        enum: AGENT_ROLE,
        example: AGENT_ROLE.INBOUND_CHAT,
    })
    @IsEnum(AGENT_ROLE)
    @IsNotEmpty()
    role: AGENT_ROLE;

    @ApiPropertyOptional({
        description: 'Workflow ID associated with the agent (ULID format)',
        example: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
    })
    @IsString()
    @IsOptional()
    @IsULID()
    workflowId?: string;

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
