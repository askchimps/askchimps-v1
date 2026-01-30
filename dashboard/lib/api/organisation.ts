import { apiClient } from "./client";

export interface Organisation {
    id: string;
    name: string;
    description?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface OrganisationResponse {
    data: Organisation[];
    statusCode: number;
    timestamp: string;
}

export const organisationApi = {
    getAll: async (): Promise<OrganisationResponse> => {
        return apiClient.get<OrganisationResponse>("/v1/organisation");
    },

    getById: async (id: string): Promise<{ data: Organisation }> => {
        return apiClient.get<{ data: Organisation }>(`/v1/organisation/${id}`);
    },
};
