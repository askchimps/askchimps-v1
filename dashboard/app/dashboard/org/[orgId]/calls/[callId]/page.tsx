"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useCalls } from "@/hooks/use-calls";
import { CallsList } from "@/components/calls/calls-list";
import { CallMessages } from "@/components/calls/call-messages";
import { useDebouncedValue } from "@/hooks/use-debounced-value";

export default function CallDetailPage() {
  const params = useParams();
  const router = useRouter();

  const orgId = params.orgId as string;
  const callId = params.callId as string;

  const [offset, setOffset] = useState(0);
  const [limit, setLimit] = useState(20);
  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");

  const debouncedSearch = useDebouncedValue(search, 300);

  const { data: calls, total, hasMore, isLoading } = useCalls(orgId, {
    limit,
    offset,
    sortOrder: "desc",
    status: status !== "all" ? status : undefined,
    search: debouncedSearch || undefined,
  });

  // Reset offset when org changes
  useEffect(() => {
    setOffset(0);
  }, [orgId]);

  const handleCallSelect = (newCallId: string) => {
    router.push(`/dashboard/org/${orgId}/calls/${newCallId}`);
  };

  return (
    <div className="flex h-full min-h-0 gap-4">
      {/* Left pane: Calls list */}
      <div className="w-100 shrink-0 flex flex-col border rounded-lg bg-card overflow-hidden">
        <CallsList
          calls={calls}
          total={total}
          selectedCallId={callId}
          onCallSelect={handleCallSelect}
          offset={offset}
          limit={limit}
          onOffsetChange={setOffset}
          onLimitChange={setLimit}
          hasMore={hasMore}
          isLoading={isLoading}
          status={status}
          onStatusChange={setStatus}
          search={search}
          onSearchChange={setSearch}
        />
      </div>

      {/* Right pane: Call messages */}
      <div className="flex-1 min-w-0">
        <CallMessages organisationId={orgId} callId={callId} />
      </div>
    </div>
  );
}

