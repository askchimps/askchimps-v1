import { CALL_STATUS, SENTIMENT } from '@prisma/client';
import { CallMessageEntity } from '../../call-message/entities/call-message.entity';

export class CallEntity {
    id: string;
    organisationId: string;
    agentId: string;
    leadId: string;
    name: string | null;
    phoneNumber: string | null;
    agentName: string | null;
    endedReason: string | null;
    externalId: string | null;
    duration: number;
    status: CALL_STATUS;
    sentiment: SENTIMENT | null;
    recordingUrl: string | null;
    shortSummary: string | null;
    detailedSummary: string | null;
    analysis: any;
    isDeleted: boolean;
    createdAt: Date;
    updatedAt: Date;
    messages?: CallMessageEntity[];

    constructor(partial: Partial<CallEntity>) {
        Object.assign(this, partial);
    }
}
