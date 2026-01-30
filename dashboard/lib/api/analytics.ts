import { apiClient } from "./client";

export interface HourlyCount {
    hour: number;
    count: number;
}

export interface DailyPickupRate {
    date: string;
    rate: number;
}

export interface DailyAvgDuration {
    date: string;
    avgDuration: number;
}

export interface MonthQueryParams {
    month?: string;
}

export interface TotalLeadsResponse {
    data: { totalLeads: number };
    statusCode: number;
    timestamp: string;
}

export interface TotalCallsResponse {
    data: { totalCalls: number };
    statusCode: number;
    timestamp: string;
}

export interface TotalChatsResponse {
    data: { totalChats: number };
    statusCode: number;
    timestamp: string;
}

export interface CallActivityResponse {
    data: HourlyCount[];
    statusCode: number;
    timestamp: string;
}

export interface ChatActivityResponse {
    data: HourlyCount[];
    statusCode: number;
    timestamp: string;
}

export interface CallPickupRateResponse {
    data: DailyPickupRate[];
    statusCode: number;
    timestamp: string;
}

export interface AvgCallDurationResponse {
    data: DailyAvgDuration[];
    statusCode: number;
    timestamp: string;
}

export const analyticsApi = {
    getTotalLeads: async (
        organisationId: string,
        params?: MonthQueryParams,
    ): Promise<TotalLeadsResponse> => {
        const queryParams = new URLSearchParams();
        if (params?.month) queryParams.append("month", params.month);

        const queryString = queryParams.toString();
        const endpoint = `/v1/organisation/${organisationId}/analytics/total-leads${
            queryString ? `?${queryString}` : ""
        }`;

        return apiClient.get<TotalLeadsResponse>(endpoint);
    },

    getTotalCalls: async (
        organisationId: string,
        params?: MonthQueryParams,
    ): Promise<TotalCallsResponse> => {
        const queryParams = new URLSearchParams();
        if (params?.month) queryParams.append("month", params.month);

        const queryString = queryParams.toString();
        const endpoint = `/v1/organisation/${organisationId}/analytics/total-calls${
            queryString ? `?${queryString}` : ""
        }`;

        return apiClient.get<TotalCallsResponse>(endpoint);
    },

    getTotalChats: async (
        organisationId: string,
        params?: MonthQueryParams,
    ): Promise<TotalChatsResponse> => {
        const queryParams = new URLSearchParams();
        if (params?.month) queryParams.append("month", params.month);

        const queryString = queryParams.toString();
        const endpoint = `/v1/organisation/${organisationId}/analytics/total-chats${
            queryString ? `?${queryString}` : ""
        }`;

        return apiClient.get<TotalChatsResponse>(endpoint);
    },

    getCallActivity: async (
        organisationId: string,
        params?: MonthQueryParams,
    ): Promise<CallActivityResponse> => {
        const queryParams = new URLSearchParams();
        if (params?.month) queryParams.append("month", params.month);

        const queryString = queryParams.toString();
        const endpoint = `/v1/organisation/${organisationId}/analytics/call-activity${
            queryString ? `?${queryString}` : ""
        }`;

        return apiClient.get<CallActivityResponse>(endpoint);
    },

    getChatActivity: async (
        organisationId: string,
        params?: MonthQueryParams,
    ): Promise<ChatActivityResponse> => {
        const queryParams = new URLSearchParams();
        if (params?.month) queryParams.append("month", params.month);

        const queryString = queryParams.toString();
        const endpoint = `/v1/organisation/${organisationId}/analytics/chat-activity${
            queryString ? `?${queryString}` : ""
        }`;

        return apiClient.get<ChatActivityResponse>(endpoint);
    },

    getCallPickupRate: async (
        organisationId: string,
        params?: MonthQueryParams,
    ): Promise<CallPickupRateResponse> => {
        const queryParams = new URLSearchParams();
        if (params?.month) queryParams.append("month", params.month);

        const queryString = queryParams.toString();
        const endpoint = `/v1/organisation/${organisationId}/analytics/call-pickup-rate${
            queryString ? `?${queryString}` : ""
        }`;

        return apiClient.get<CallPickupRateResponse>(endpoint);
    },

    getAvgCallDuration: async (
        organisationId: string,
        params?: MonthQueryParams,
    ): Promise<AvgCallDurationResponse> => {
        const queryParams = new URLSearchParams();
        if (params?.month) queryParams.append("month", params.month);

        const queryString = queryParams.toString();
        const endpoint = `/v1/organisation/${organisationId}/analytics/avg-call-duration${
            queryString ? `?${queryString}` : ""
        }`;

        return apiClient.get<AvgCallDurationResponse>(endpoint);
    },
};
