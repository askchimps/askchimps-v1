import { apiClient } from "./client";

export interface LeadOwner {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string | null;
}

export interface Lead {
    id: string;
    organisationId: string;
    agentId: string;
    zohoId: string | null;
    ownerId: string | null;
    firstName: string | null;
    lastName: string | null;
    email: string | null;
    phone: string | null;
    source: string | null;
    status: string | null;
    disposition: string | null;
    country: string | null;
    state: string | null;
    city: string | null;
    reasonForCold: string | null;
    isTransferred: boolean;
    isDeleted: boolean;
    createdAt: string;
    updatedAt: string;
    owner?: LeadOwner;
}

export interface PaginatedLeadsResponse {
    data: {
        data: Lead[];
        total: number;
        limit: number;
        offset: number;
        statuses: string[];
        dispositions: string[];
    };
    statusCode: number;
    timestamp: string;
}

export interface LeadResponse {
    data: Lead;
    statusCode: number;
    timestamp: string;
}

export interface LeadQueryParams {
    agentId?: string;
    status?: string;
    disposition?: string;
    source?: string;
    limit?: number;
    offset?: number;
    sortOrder?: "asc" | "desc";
    search?: string;
}

export const leadApi = {
    getAll: async (
        organisationId: string,
        params?: LeadQueryParams,
    ): Promise<PaginatedLeadsResponse> => {
        const queryParams = new URLSearchParams();

        if (params?.agentId) queryParams.append("agentId", params.agentId);
        if (params?.status) queryParams.append("status", params.status);
        if (params?.disposition)
            queryParams.append("disposition", params.disposition);
        if (params?.source) queryParams.append("source", params.source);
        if (params?.limit) queryParams.append("limit", params.limit.toString());
        if (params?.offset)
            queryParams.append("offset", params.offset.toString());
        if (params?.sortOrder)
            queryParams.append("sortOrder", params.sortOrder);
        if (params?.search) queryParams.append("search", params.search);

        const queryString = queryParams.toString();
        const endpoint = `/v1/organisation/${organisationId}/lead${
            queryString ? `?${queryString}` : ""
        }`;

        return apiClient.get<PaginatedLeadsResponse>(endpoint);
    },

    getById: async (
        organisationId: string,
        leadId: string,
    ): Promise<LeadResponse> => {
        const endpoint = `/v1/organisation/${organisationId}/lead/${leadId}`;
        return apiClient.get<LeadResponse>(endpoint);
    },
};
