import { HISTORY_ACTION, HISTORY_TRIGGER } from '@prisma/client';

export class HistoryEntity {
    id: string;
    tableName: string;
    recordId: string;
    fieldName?: string | null;
    action: HISTORY_ACTION;
    trigger: HISTORY_TRIGGER;
    userId?: string | null;
    userEmail?: string | null;
    userName?: string | null;
    organisationId?: string | null;
    agentId?: string | null;
    leadId?: string | null;
    callId?: string | null;
    chatId?: string | null;
    oldValue?: any;
    newValue?: any;
    reason?: string | null;
    description?: string | null;
    metadata?: any;
    requestId?: string | null;
    sessionId?: string | null;
    ipAddress?: string | null;
    userAgent?: string | null;
    apiEndpoint?: string | null;
    httpMethod?: string | null;
    isError: boolean;
    errorMessage?: string | null;
    errorStack?: string | null;
    createdAt: Date;

    constructor(partial: Partial<HistoryEntity>) {
        Object.assign(this, partial);
    }
}
