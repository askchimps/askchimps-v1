"use client";

import { useQuery } from "@tanstack/react-query";
import { getCalls, getCall, getCallMessages } from "@/lib/api/calls";

export function useCalls(organisationId: string) {
  const query = useQuery({
    queryKey: ["calls", organisationId],
    queryFn: () => getCalls(organisationId),
    enabled: !!organisationId,
  });

  return {
    calls: query.data ?? [],
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
    messages: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
  };
}

