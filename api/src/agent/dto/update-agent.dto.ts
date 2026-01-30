import { PartialType } from '@nestjs/swagger';
import { CreateAgentDto } from './create-agent.dto';
import { OmitType } from '@nestjs/swagger';

export class UpdateAgentDto extends PartialType(
    OmitType(CreateAgentDto, ['organisationId'] as const),
) {}
