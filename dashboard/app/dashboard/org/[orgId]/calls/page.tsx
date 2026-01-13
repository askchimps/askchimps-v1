"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useCalls } from "@/hooks/use-calls";
import { CallsList } from "@/components/calls/calls-list";
import { CallMessages } from "@/components/calls/call-messages";
import { Phone } from "lucide-react";

export default function CallsPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const orgId = params.orgId as string;
  const selectedCallId = searchParams.get("callId");

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);

  const { calls, isLoading } = useCalls(orgId);

  // Reset page when limit changes or calls change significantly
  useEffect(() => {
    setPage(1);
  }, [orgId]);

  const handleCallSelect = (callId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("callId", callId);
    router.push(`/dashboard/org/${orgId}/calls?${params.toString()}`);
  };

  return (
    <div className="flex h-full gap-4">
      {/* Left pane: Calls list */}
      <div className="w-100 shrink-0 flex flex-col border rounded-lg bg-card">
        <CallsList
          calls={calls}
          selectedCallId={selectedCallId}
          onCallSelect={handleCallSelect}
          page={page}
          limit={limit}
          onPageChange={setPage}
          onLimitChange={setLimit}
          isLoading={isLoading}
        />
      </div>

      {/* Right pane: Call messages */}
      <div className="flex-1 min-w-0">
        {selectedCallId ? (
          <CallMessages organisationId={orgId} callId={selectedCallId} />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-4 rounded-lg border bg-card p-8">
            <Phone className="h-16 w-16 text-muted-foreground/30" />
            <div className="text-center">
              <h3 className="font-semibold text-lg">Select a call</h3>
              <p className="text-muted-foreground">
                Choose a call from the list to view its conversation
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

