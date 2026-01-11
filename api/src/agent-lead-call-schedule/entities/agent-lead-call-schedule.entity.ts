export class AgentLeadCallScheduleEntity {
  id: string;
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

