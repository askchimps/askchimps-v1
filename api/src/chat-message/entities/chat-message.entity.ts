import { Exclude, Expose } from 'class-transformer';
import { CHAT_MESSAGE_TYPE } from '@prisma/client';

@Expose()
export class ChatMessageEntity {
  id: string;
  chatId: string;
  organisationId: string;
  role: string;
  content: string | null;
  type: CHAT_MESSAGE_TYPE;

  @Exclude()
  isDeleted: boolean;

  createdAt: Date;
  updatedAt: Date;

  // Relations (optional, loaded when included)
  attachments?: any[];

  constructor(partial: Partial<ChatMessageEntity>) {
    Object.assign(this, partial);
  }
}
