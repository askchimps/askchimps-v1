import { AGENT_TYPE, AGENT_ROLE } from '@prisma/client';

export class AgentEntity {
  id: string;
  name: string;
  type: AGENT_TYPE;
  role: AGENT_ROLE;
  workflowId: string | null;
  organisationId: string;
  slug: string;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<AgentEntity>) {
    Object.assign(this, partial);
  }
}
