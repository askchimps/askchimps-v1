import type { Call, CallMessage } from "@/types/call";
import type { ApiResponse } from "@/types/auth";
import { apiClient } from "./client";

export async function getCalls(organisationId: string): Promise<Call[]> {
  const response = await apiClient.get<ApiResponse<Call[]>>(
    `/organisation/${organisationId}/call`
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
  callId: string
): Promise<CallMessage[]> {
  const response = await apiClient.get<ApiResponse<CallMessage[]>>(
    `/organisation/${organisationId}/call/${callId}/message`
  );
  return response.data.data;
}

