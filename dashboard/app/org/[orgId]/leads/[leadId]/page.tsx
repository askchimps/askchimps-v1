"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { useOrganisationStore } from "@/stores/organisation-store";
import { leadApi } from "@/lib/api/lead";
import { LeadFilters } from "@/components/leads/lead-filters";
import { LeadListItem } from "@/components/leads/lead-list-item";
import { LeadPagination } from "@/components/leads/lead-pagination";
import { LeadDetail } from "@/components/leads/lead-detail";
import { LeadEmptyState } from "@/components/leads/lead-empty-state";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { Users } from "lucide-react";

export default function LeadDetailPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const { selectedOrganisation } = useOrganisationStore();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("ALL");
  const [disposition, setDisposition] = useState<string>("ALL");
  const [limit, setLimit] = useState(20);
  const [offset, setOffset] = useState(0);
  const initialLeadId = params.leadId as string;
  const [selectedLeadId, setSelectedLeadId] = useState(initialLeadId);

  // Initialize state from URL parameters
  useEffect(() => {
    const offsetParam = searchParams.get("offset");
    const limitParam = searchParams.get("limit");
    const searchParam = searchParams.get("search");
    const statusParam = searchParams.get("status");
    const dispositionParam = searchParams.get("disposition");

    if (offsetParam) setOffset(parseInt(offsetParam, 10));
    if (limitParam) setLimit(parseInt(limitParam, 10));
    if (searchParam) setSearch(searchParam);
    if (statusParam) setStatus(statusParam);
    if (dispositionParam) setDisposition(dispositionParam);
  }, [searchParams]);

  // Fetch leads list
  const {
    data: leadsData,
    isLoading: isLoadingLeads,
    error: leadsError,
  } = useQuery({
    queryKey: [
      "leads",
      selectedOrganisation?.id,
      search,
      status,
      disposition,
      limit,
      offset,
    ],
    queryFn: () =>
      leadApi.getAll(selectedOrganisation!.id, {
        search: search || undefined,
        status: status !== "ALL" ? status : undefined,
        disposition: disposition !== "ALL" ? disposition : undefined,
        sortOrder: "desc",
        limit,
        offset,
      }),
    enabled: !!selectedOrganisation,
    staleTime: 30000, // 30 seconds
  });

  // Fetch selected lead details
  const {
    data: leadDetailData,
    isLoading: isLoadingDetail,
  } = useQuery({
    queryKey: ["lead", selectedOrganisation?.id, selectedLeadId],
    queryFn: () =>
      leadApi.getById(selectedOrganisation!.id, selectedLeadId),
    enabled: !!selectedOrganisation && !!selectedLeadId,
    staleTime: 60000, // 1 minute
  });

  const leads = leadsData?.data.data || [];
  const total = leadsData?.data.total || 0;
  const selectedLead = leadDetailData?.data;

  // Scroll to the selected lead on page load (if it's in the list)
  useEffect(() => {
    if (selectedLeadId && !isLoadingLeads) {
      // Small delay to ensure the DOM is updated
      setTimeout(() => {
        const leadElement = document.querySelector(`[data-lead-id="${selectedLeadId}"]`);
        if (leadElement) {
          leadElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }, 100);
    }
  // Only run on initial load, not on every selection change
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoadingLeads]);

  // Helper to build URL with current state
  const buildUrl = (newLeadId?: string, newOffset?: number, newLimit?: number) => {
    const orgId = selectedOrganisation?.id;
    if (!orgId) return "";

    const params = new URLSearchParams();
    const currentOffset = newOffset !== undefined ? newOffset : offset;
    const currentLimit = newLimit !== undefined ? newLimit : limit;

    if (currentOffset > 0) params.set("offset", currentOffset.toString());
    if (currentLimit !== 20) params.set("limit", currentLimit.toString());
    if (search) params.set("search", search);
    if (status !== "ALL") params.set("status", status);
    if (disposition !== "ALL") params.set("disposition", disposition);

    const queryString = params.toString();
    const targetLeadId = newLeadId || selectedLeadId;
    return `/org/${orgId}/leads/${targetLeadId}${queryString ? `?${queryString}` : ""}`;
  };

  // Update URL when lead is selected (without full navigation)
  const handleLeadSelect = (newLeadId: string) => {
    // Update local state immediately (no re-render jump)
    setSelectedLeadId(newLeadId);
    
    // Update URL without triggering navigation
    const url = buildUrl(newLeadId);
    if (url) {
      window.history.replaceState(null, '', url);
    }
  };

  // Update URL when pagination changes
  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    const url = buildUrl(undefined, 0, newLimit);
    if (url) router.replace(url);
  };

  const handleOffsetChange = (newOffset: number) => {
    setOffset(newOffset);
    const url = buildUrl(undefined, newOffset);
    if (url) router.replace(url);
  };

  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-4rem)] flex">
        {/* Left Panel - Lead List */}
        <div className="w-96 border-r flex flex-col bg-card">
          {/* Header */}
          <div className="p-4 border-b">
            <div className="flex items-center gap-2 mb-1">
              <Users className="h-5 w-5 text-primary" />
              <h1 className="text-xl font-bold">Leads</h1>
            </div>
            <p className="text-sm text-muted-foreground">
              {total} total lead{total !== 1 ? "s" : ""}
            </p>
          </div>

          {/* Filters */}
          <LeadFilters
            search={search}
            onSearchChange={(value) => {
              setSearch(value);
              setOffset(0);
            }}
            status={status}
            onStatusChange={(value) => {
              setStatus(value);
              setOffset(0);
            }}
            disposition={disposition}
            onDispositionChange={(value) => {
              setDisposition(value);
              setOffset(0);
            }}
          />

          {/* Lead List */}
          <ScrollArea className="flex-1">
            {isLoadingLeads ? (
              <div className="p-4 space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                ))}
              </div>
            ) : leadsError ? (
              <div className="p-4">
                <Card className="p-4 bg-destructive/10 border-destructive/20">
                  <p className="text-sm text-destructive">
                    Failed to load leads. Please try again.
                  </p>
                </Card>
              </div>
            ) : leads.length === 0 ? (
              <LeadEmptyState
                message="No leads found"
                description="Try adjusting your filters or search query"
              />
            ) : (
              <div>
                {leads.map((lead) => (
                  <LeadListItem
                    key={lead.id}
                    lead={lead}
                    isSelected={selectedLeadId === lead.id}
                    onClick={() => handleLeadSelect(lead.id)}
                  />
                ))}
              </div>
            )}
          </ScrollArea>

          {/* Pagination */}
          {!isLoadingLeads && leads.length > 0 && (
            <LeadPagination
              total={total}
              limit={limit}
              offset={offset}
              onLimitChange={handleLimitChange}
              onOffsetChange={handleOffsetChange}
            />
          )}
        </div>

        {/* Right Panel - Lead Detail */}
        <div className="flex-1 bg-muted/30">
          {!selectedLeadId ? (
            <LeadEmptyState
              message="Select a lead to view details"
              description="Choose a lead from the list on the left"
            />
          ) : isLoadingDetail ? (
            <div className="h-full p-6 space-y-6">
              <div className="space-y-2">
                <Skeleton className="h-8 w-1/2" />
                <Skeleton className="h-4 w-1/4" />
              </div>
              <div className="space-y-4">
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-32 w-full" />
              </div>
            </div>
          ) : selectedLead ? (
            <LeadDetail lead={selectedLead} />
          ) : (
            <LeadEmptyState
              message="Lead not found"
              description="The selected lead could not be loaded"
            />
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

