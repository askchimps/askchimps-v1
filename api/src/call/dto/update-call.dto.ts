import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateCallDto } from './create-call.dto';

export class UpdateCallDto extends PartialType(
    OmitType(CreateCallDto, ['organisationId', 'agentId', 'leadId'] as const),
) {}
