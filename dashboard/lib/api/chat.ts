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

export interface Agent {
    id: string;
    name: string;
    type: string;
    role: string;
    workflowId: string | null;
}

export interface ChatAgent {
    id: string;
    chatId: string;
    agentId: string;
    isActive: boolean;
    agent: Agent;
}

export interface Chat {
    id: string;
    organisationId: string;
    leadId: string | null;
    name: string | null;
    source: ChatSource;
    sourceId: string;
    status: ChatStatus;
    shortSummary: string | null;
    detailedSummary: string | null;
    isTransferred: boolean;
    transferReason: string | null;
    createdAt: string;
    updatedAt: string;
    lead?: Lead;
    messages?: ChatMessage[];
    agents?: ChatAgent[];
}

export interface ChatsResponse {
    data: Chat[];
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
    ): Promise<ChatsResponse> => {
        const queryParams = new URLSearchParams();

        if (params?.leadId) queryParams.append("leadId", params.leadId);
        if (params?.source) queryParams.append("source", params.source);

        const queryString = queryParams.toString();
        const endpoint = `/v1/organisation/${organisationId}/chat${
            queryString ? `?${queryString}` : ""
        }`;

        return apiClient.get<ChatsResponse>(endpoint);
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
