import { Exclude, Expose } from 'class-transformer';
import { CHAT_SOURCE, CHAT_STATUS } from '@prisma/client';

@Expose()
export class ChatEntity {
  id: string;
  organisationId: string;
  leadId: string | null;
  name: string | null;
  source: CHAT_SOURCE;
  sourceId: string;
  status: CHAT_STATUS;
  shortSummary: string | null;
  detailedSummary: string | null;
  isTransferred: boolean;

  @Exclude()
  isDeleted: boolean;

  createdAt: Date;
  updatedAt: Date;

  // Relations (optional, loaded when included)
  lead?: any;
  messages?: any[];

  constructor(partial: Partial<ChatEntity>) {
    Object.assign(this, partial);
  }
}
