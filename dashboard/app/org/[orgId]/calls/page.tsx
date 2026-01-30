"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { useOrganisationStore } from "@/stores/organisation-store";
import { callApi, CallStatus } from "@/lib/api/call";
import { CallFilters } from "@/components/calls/call-filters";
import { CallListItem } from "@/components/calls/call-list-item";
import { CallPagination } from "@/components/calls/call-pagination";
import { CallDetail } from "@/components/calls/call-detail";
import { CallEmptyState } from "@/components/calls/call-empty-state";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { Phone } from "lucide-react";

export default function CallsPage() {
    const router = useRouter();
    const { selectedOrganisation } = useOrganisationStore();
    const [selectedCallId, setSelectedCallId] = useState<string | null>(null);
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState<CallStatus | "ALL">("ALL");
    const [limit, setLimit] = useState(20);
    const [offset, setOffset] = useState(0);

    // Fetch calls list
    const {
        data: callsData,
        isLoading: isLoadingCalls,
        error: callsError,
    } = useQuery({
        queryKey: [
            "calls",
            selectedOrganisation?.id,
            search,
            status,
            limit,
            offset,
        ],
        queryFn: () =>
            callApi.getAll(selectedOrganisation!.id, {
                search: search || undefined,
                status: status !== "ALL" ? status : undefined,
                sortOrder: "desc",
                limit,
                offset,
            }),
        enabled: !!selectedOrganisation,
        staleTime: 30000, // 30 seconds
    });

    // Fetch selected call details with messages
    const { data: callDetailData, isLoading: isLoadingDetail } = useQuery({
        queryKey: ["call", selectedOrganisation?.id, selectedCallId],
        queryFn: () =>
            callApi.getById(selectedOrganisation!.id, selectedCallId!, true),
        enabled: !!selectedOrganisation && !!selectedCallId,
        staleTime: 60000, // 1 minute
    });

    const calls = callsData?.data.data || [];
    const total = callsData?.data.total || 0;
    const selectedCall = callDetailData?.data;

    // Update URL when call is selected (preserve pagination state)
    const handleCallSelect = (callId: string) => {
        setSelectedCallId(callId);
        const orgId = selectedOrganisation?.id;
        if (orgId) {
            const params = new URLSearchParams();
            if (offset > 0) params.set("offset", offset.toString());
            if (limit !== 20) params.set("limit", limit.toString());
            if (search) params.set("search", search);
            if (status !== "ALL") params.set("status", status);

            const queryString = params.toString();
            router.replace(
                `/org/${orgId}/calls/${callId}${queryString ? `?${queryString}` : ""}`,
                { scroll: false },
            );
        }
    };

    return (
        <DashboardLayout>
            <div className="flex h-[calc(100vh-4rem)]">
                {/* Left Panel - Call List */}
                <div className="bg-card flex w-96 flex-col border-r">
                    {/* Header */}
                    <div className="border-b p-4">
                        <div className="mb-1 flex items-center gap-2">
                            <Phone className="text-primary h-5 w-5" />
                            <h1 className="text-xl font-bold">Calls</h1>
                        </div>
                        <p className="text-muted-foreground text-sm">
                            {total} total call{total !== 1 ? "s" : ""}
                        </p>
                    </div>

                    {/* Filters */}
                    <CallFilters
                        search={search}
                        onSearchChange={(value) => {
                            setSearch(value);
                            setOffset(0);
                        }}
                        status={status}
                        onStatusChange={(value) => {
                            setStatus(value as CallStatus | "ALL");
                            setOffset(0);
                        }}
                    />

                    {/* Call List */}
                    <ScrollArea className="flex-1">
                        {isLoadingCalls ? (
                            <div className="space-y-4 p-4">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <div key={i} className="space-y-2">
                                        <Skeleton className="h-4 w-3/4" />
                                        <Skeleton className="h-3 w-full" />
                                        <Skeleton className="h-3 w-1/2" />
                                    </div>
                                ))}
                            </div>
                        ) : callsError ? (
                            <div className="p-4">
                                <Card className="bg-destructive/10 border-destructive/20 p-4">
                                    <p className="text-destructive text-sm">
                                        Failed to load calls. Please try again.
                                    </p>
                                </Card>
                            </div>
                        ) : calls.length === 0 ? (
                            <CallEmptyState
                                message="No calls found"
                                description={
                                    search || status !== "ALL"
                                        ? "Try adjusting your filters"
                                        : "Calls will appear here once they are created"
                                }
                            />
                        ) : (
                            <div>
                                {calls.map((call) => (
                                    <CallListItem
                                        key={call.id}
                                        call={call}
                                        isSelected={selectedCallId === call.id}
                                        onClick={() =>
                                            handleCallSelect(call.id)
                                        }
                                        orgId={selectedOrganisation?.id}
                                    />
                                ))}
                            </div>
                        )}
                    </ScrollArea>

                    {/* Pagination */}
                    {!isLoadingCalls && calls.length > 0 && (
                        <CallPagination
                            total={total}
                            limit={limit}
                            offset={offset}
                            onLimitChange={setLimit}
                            onOffsetChange={setOffset}
                        />
                    )}
                </div>

                {/* Right Panel - Call Detail */}
                <div className="bg-muted/30 flex-1">
                    {!selectedCallId ? (
                        <CallEmptyState
                            message="Select a call to view details"
                            description="Choose a call from the list on the left"
                        />
                    ) : isLoadingDetail ? (
                        <div className="h-full space-y-6 p-6">
                            <div className="space-y-2">
                                <Skeleton className="h-8 w-1/2" />
                                <Skeleton className="h-4 w-1/4" />
                            </div>
                            <Skeleton className="h-32 w-full" />
                            <Skeleton className="h-48 w-full" />
                        </div>
                    ) : selectedCall ? (
                        <CallDetail
                            call={selectedCall}
                            orgId={selectedOrganisation?.id}
                        />
                    ) : (
                        <CallEmptyState
                            message="Call not found"
                            description="The selected call could not be loaded"
                        />
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
