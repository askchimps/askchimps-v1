import { SCHEDULE_TYPE } from '@prisma/client';

export class AgentLeadCallScheduleEntity {
  id: string;
  type: SCHEDULE_TYPE;
  agentId: string;
  leadId: string;
  callTime: Date;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<AgentLeadCallScheduleEntity>) {
    Object.assign(this, partial);
  }
}

