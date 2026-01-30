import { apiClient } from "./client";

export enum CallStatus {
    ACTIVE = "ACTIVE",
    FAILED = "FAILED",
    DISCONNECTED = "DISCONNECTED",
    RESCHEDULED = "RESCHEDULED",
    MISSED = "MISSED",
    COMPLETED = "COMPLETED",
}

export enum Sentiment {
    HOT = "HOT",
    WARM = "WARM",
    COLD = "COLD",
}

export interface CallMessage {
    id: string;
    callId: string;
    organisationId: string;
    role: string;
    content: string;
    isDeleted: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface Call {
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
    status: CallStatus;
    sentiment: Sentiment | null;
    recordingUrl: string | null;
    shortSummary: string | null;
    detailedSummary: string | null;
    analysis: Record<string, unknown> | null;
    isDeleted: boolean;
    createdAt: string;
    updatedAt: string;
    messages?: CallMessage[];
}

export interface PaginatedCallsResponse {
    data: {
        data: Call[];
        total: number;
        limit: number;
        offset: number;
    };
    statusCode: number;
    timestamp: string;
}

export interface CallResponse {
    data: Call;
    statusCode: number;
    timestamp: string;
}

export interface CallQueryParams {
    agentId?: string;
    leadId?: string;
    status?: CallStatus;
    limit?: number;
    offset?: number;
    sortOrder?: "asc" | "desc";
    search?: string;
}

export const callApi = {
    getAll: async (
        organisationId: string,
        params?: CallQueryParams,
    ): Promise<PaginatedCallsResponse> => {
        const queryParams = new URLSearchParams();

        if (params?.agentId) queryParams.append("agentId", params.agentId);
        if (params?.leadId) queryParams.append("leadId", params.leadId);
        if (params?.status) queryParams.append("status", params.status);
        if (params?.limit) queryParams.append("limit", params.limit.toString());
        if (params?.offset)
            queryParams.append("offset", params.offset.toString());
        if (params?.sortOrder)
            queryParams.append("sortOrder", params.sortOrder);
        if (params?.search) queryParams.append("search", params.search);

        const queryString = queryParams.toString();
        const endpoint = `/v1/organisation/${organisationId}/call${
            queryString ? `?${queryString}` : ""
        }`;

        return apiClient.get<PaginatedCallsResponse>(endpoint);
    },

    getById: async (
        organisationId: string,
        callId: string,
        includeMessages: boolean = false,
    ): Promise<CallResponse> => {
        const queryParams = new URLSearchParams();
        if (includeMessages) queryParams.append("includeMessages", "true");

        const queryString = queryParams.toString();
        const endpoint = `/v1/organisation/${organisationId}/call/${callId}${
            queryString ? `?${queryString}` : ""
        }`;

        return apiClient.get<CallResponse>(endpoint);
    },
};
