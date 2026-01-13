"use client";

import { useQuery } from "@tanstack/react-query";
import { getCalls, getCall, getCallMessages } from "@/lib/api/calls";
import type { CallsQueryParams } from "@/lib/api/calls";

export function useCalls(organisationId: string, params?: CallsQueryParams) {
  const query = useQuery({
    queryKey: ["calls", organisationId, params],
    queryFn: () => getCalls(organisationId, params),
    enabled: !!organisationId,
  });

  const data = query.data;
  const offset = data?.offset ?? 0;
  const limit = data?.limit ?? params?.limit ?? 20;
  const total = data?.total ?? 0;
  const hasMore = offset + limit < total;

  return {
    data: data?.data ?? [],
    total,
    hasMore,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}

export function useCall(organisationId: string, callId: string | null) {
  const query = useQuery({
    queryKey: ["call", organisationId, callId],
    queryFn: () => getCall(organisationId, callId!),
    enabled: !!organisationId && !!callId,
  });

  return {
    call: query.data ?? null,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
  };
}

export function useCallMessages(organisationId: string, callId: string | null) {
  const query = useQuery({
    queryKey: ["call-messages", organisationId, callId],
    queryFn: () => getCallMessages(organisationId, callId!),
    enabled: !!organisationId && !!callId,
  });

  return {
    messages: query.data?.data ?? [],
    total: query.data?.total ?? 0,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
  };
}

