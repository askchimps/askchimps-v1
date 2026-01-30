import { Exclude, Expose } from 'class-transformer';

@Expose()
export class ChatAgentEntity {
  id: string;
  chatId: string;
  agentId: string;
  isActive: boolean;

  @Exclude()
  isDeleted: boolean;

  createdAt: Date;
  updatedAt: Date;

  // Relations (optional, loaded when included)
  agent?: any;
  chat?: any;

  constructor(partial: Partial<ChatAgentEntity>) {
    Object.assign(this, partial);
  }
}
