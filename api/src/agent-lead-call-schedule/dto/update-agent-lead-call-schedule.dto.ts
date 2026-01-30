import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateAgentLeadCallScheduleDto } from './create-agent-lead-call-schedule.dto';

export class UpdateAgentLeadCallScheduleDto extends PartialType(
    OmitType(CreateAgentLeadCallScheduleDto, ['agentId', 'leadId'] as const),
) {}
