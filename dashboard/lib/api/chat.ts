import { apiClient } from "./client";

export enum ChatStatus {
    NEW = "NEW",
    OPEN = "OPEN",
    PENDING = "PENDING",
    CLOSED = "CLOSED",
}

export enum ChatSource {
    WHATSAPP = "WHATSAPP",
    INSTAGRAM = "INSTAGRAM",
}

export interface ChatMessage {
    id: string;
    chatId: string;
    type: string;
    role: string;
    content: string;
    metadata: Record<string, unknown> | null;
    isDeleted: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface Lead {
    id: string;
    firstName: string | null;
    lastName: string | null;
    phone: string;
}

export interface Chat {
    id: string;
    organisationId: string;
    agentId: string;
    leadId: string;
    name: string | null;
    source: ChatSource;
    sourceId: string;
    status: ChatStatus;
    shortSummary: string | null;
    detailedSummary: string | null;
    isTransferred: boolean;
    isDeleted: boolean;
    createdAt: string;
    updatedAt: string;
    lead?: Lead;
    messages?: ChatMessage[];
}

export interface PaginatedChatsResponse {
    data: {
        data: Chat[];
        total: number;
        limit: number;
        offset: number;
    };
    statusCode: number;
    timestamp: string;
}

export interface ChatResponse {
    data: Chat;
    statusCode: number;
    timestamp: string;
}

export interface ChatQueryParams {
    agentId?: string;
    leadId?: string;
    status?: ChatStatus;
    source?: ChatSource;
    limit?: number;
    offset?: number;
    sortOrder?: "asc" | "desc";
    search?: string;
}

export const chatApi = {
    getAll: async (
        organisationId: string,
        params?: ChatQueryParams,
    ): Promise<PaginatedChatsResponse> => {
        const queryParams = new URLSearchParams();

        if (params?.agentId) queryParams.append("agentId", params.agentId);
        if (params?.leadId) queryParams.append("leadId", params.leadId);
        if (params?.status) queryParams.append("status", params.status);
        if (params?.source) queryParams.append("source", params.source);
        if (params?.limit) queryParams.append("limit", params.limit.toString());
        if (params?.offset)
            queryParams.append("offset", params.offset.toString());
        if (params?.sortOrder)
            queryParams.append("sortOrder", params.sortOrder);
        if (params?.search) queryParams.append("search", params.search);

        const queryString = queryParams.toString();
        const endpoint = `/v1/organisation/${organisationId}/chat${
            queryString ? `?${queryString}` : ""
        }`;

        return apiClient.get<PaginatedChatsResponse>(endpoint);
    },

    getById: async (
        organisationId: string,
        chatId: string,
        includeMessages: boolean = false,
    ): Promise<ChatResponse> => {
        const queryParams = new URLSearchParams();
        if (includeMessages) queryParams.append("includeMessages", "true");

        const queryString = queryParams.toString();
        const endpoint = `/v1/organisation/${organisationId}/chat/${chatId}${
            queryString ? `?${queryString}` : ""
        }`;

        return apiClient.get<ChatResponse>(endpoint);
    },
};
