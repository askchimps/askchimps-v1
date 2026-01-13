"use client";

import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CallCard } from "./call-card";
import { ChevronLeft, ChevronRight, Phone } from "lucide-react";
import type { Call } from "@/types/call";

interface CallsListProps {
  calls: Call[];
  selectedCallId: string | null;
  onCallSelect: (callId: string) => void;
  page: number;
  limit: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  isLoading?: boolean;
}

const LIMIT_OPTIONS = [10, 20, 50, 100];

export function CallsList({
  calls,
  selectedCallId,
  onCallSelect,
  page,
  limit,
  onPageChange,
  onLimitChange,
  isLoading,
}: CallsListProps) {
  const { paginatedCalls, totalPages, startIndex, endIndex } = useMemo(() => {
    const total = calls.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = Math.min(startIndex + limit, total);
    const paginatedCalls = calls.slice(startIndex, endIndex);

    return { paginatedCalls, totalPages, startIndex, endIndex };
  }, [calls, page, limit]);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">Loading calls...</p>
      </div>
    );
  }

  if (calls.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2">
        <Phone className="h-12 w-12 text-muted-foreground/50" />
        <p className="text-muted-foreground">No calls found</p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header with limit selector */}
      <div className="flex items-center justify-between border-b px-4 py-3">
        <h2 className="font-semibold">Calls ({calls.length})</h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Show</span>
          <Select
            value={limit.toString()}
            onValueChange={(value) => {
              onLimitChange(parseInt(value));
              onPageChange(1);
            }}
          >
            <SelectTrigger className="w-[70px] h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LIMIT_OPTIONS.map((opt) => (
                <SelectItem key={opt} value={opt.toString()}>
                  {opt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Calls list */}
      <ScrollArea className="flex-1 px-4">
        <div className="space-y-2 py-4">
          {paginatedCalls.map((call) => (
            <CallCard
              key={call.id}
              call={call}
              isSelected={call.id === selectedCallId}
              onClick={() => onCallSelect(call.id)}
            />
          ))}
        </div>
      </ScrollArea>

      {/* Pagination */}
      <div className="flex items-center justify-between border-t px-4 py-3">
        <span className="text-sm text-muted-foreground">
          {startIndex + 1}-{endIndex} of {calls.length}
        </span>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="px-2 text-sm">
            {page} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

