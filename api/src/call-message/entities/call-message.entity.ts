export class CallMessageEntity {
  id: string;
  callId: string;
  organisationId: string;
  role: string;
  content: string;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<CallMessageEntity>) {
    Object.assign(this, partial);
  }
}
