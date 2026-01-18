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

export interface AnalyticsData {
    totalLeads: number;
    totalCalls: number;
    totalChats: number;
    mostActiveHoursForCalls: HourlyCount[];
    callPickupRatePerDay: DailyPickupRate[];
    avgCallDurationPerDay: DailyAvgDuration[];
    chatCountByHoursPerDay: HourlyCount[];
}

export interface AnalyticsResponse {
    data: AnalyticsData;
    statusCode: number;
    timestamp: string;
}

export interface AnalyticsQueryParams {
    startDate?: string;
    endDate?: string;
}

export const analyticsApi = {
    getAnalytics: async (
        organisationId: string,
        params?: AnalyticsQueryParams,
    ): Promise<AnalyticsResponse> => {
        const queryParams = new URLSearchParams();

        if (params?.startDate)
            queryParams.append("startDate", params.startDate);
        if (params?.endDate) queryParams.append("endDate", params.endDate);

        const queryString = queryParams.toString();
        const endpoint = `/v1/organisation/${organisationId}/analytics${
            queryString ? `?${queryString}` : ""
        }`;

        return apiClient.get<AnalyticsResponse>(endpoint);
    },
};
