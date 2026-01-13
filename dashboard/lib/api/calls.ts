import type { Call, CallMessage } from "@/types/call";
import type { ApiResponse, PaginatedData, PaginationParams } from "@/types/auth";
import { apiClient } from "./client";

export interface CallsQueryParams extends PaginationParams {
  status?: string;
  agentId?: string;
  leadId?: string;
  search?: string;
}

export async function getCalls(
  organisationId: string,
  params?: CallsQueryParams
): Promise<PaginatedData<Call>> {
  const response = await apiClient.get<ApiResponse<PaginatedData<Call>>>(
    `/organisation/${organisationId}/call`,
    { params }
  );
  return response.data.data;
}

export async function getCall(
  organisationId: string,
  callId: string
): Promise<Call> {
  const response = await apiClient.get<ApiResponse<Call>>(
    `/organisation/${organisationId}/call/${callId}`
  );
  return response.data.data;
}

export async function getCallMessages(
  organisationId: string,
  callId: string,
  params?: PaginationParams
): Promise<PaginatedData<CallMessage>> {
  const response = await apiClient.get<ApiResponse<PaginatedData<CallMessage>>>(
    `/organisation/${organisationId}/call/${callId}/message`,
    { params: { ...params, limit: params?.limit ?? 1000 } }
  );
  return response.data.data;
}

