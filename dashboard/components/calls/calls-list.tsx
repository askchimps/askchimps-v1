"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CallCard } from "./call-card";
import { ChevronLeft, ChevronRight, Phone, Search, X } from "lucide-react";
import type { Call, CallStatus } from "@/types/call";

interface CallsListProps {
  calls: Call[];
  total: number;
  selectedCallId: string | null;
  onCallSelect: (callId: string) => void;
  offset: number;
  limit: number;
  onOffsetChange: (offset: number) => void;
  onLimitChange: (limit: number) => void;
  hasMore: boolean;
  isLoading?: boolean;
  status: string;
  onStatusChange: (status: string) => void;
  search: string;
  onSearchChange: (search: string) => void;
}

const LIMIT_OPTIONS = [10, 20, 50, 100];

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: "all", label: "All Statuses" },
  { value: "ACTIVE", label: "Active" },
  { value: "COMPLETED", label: "Completed" },
  { value: "DISCONNECTED", label: "Disconnected" },
  { value: "RESCHEDULED", label: "Rescheduled" },
  { value: "MISSED", label: "Missed" },
];

export function CallsList({
  calls,
  total,
  selectedCallId,
  onCallSelect,
  offset,
  limit,
  onOffsetChange,
  onLimitChange,
  hasMore,
  isLoading,
  status,
  onStatusChange,
  search,
  onSearchChange,
}: CallsListProps) {
  const currentPage = Math.floor(offset / limit) + 1;
  const totalPages = Math.ceil(total / limit);
  const startIndex = offset;
  const endIndex = Math.min(offset + calls.length, total);

  const handlePrevPage = () => {
    const newOffset = Math.max(0, offset - limit);
    onOffsetChange(newOffset);
  };

  const handleNextPage = () => {
    if (hasMore) {
      onOffsetChange(offset + limit);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">Loading calls...</p>
      </div>
    );
  }

  const hasFilters = status !== "all" || search.length > 0;

  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* Header */}
      <div className="shrink-0 flex items-center justify-between border-b px-4 py-3">
        <h2 className="font-semibold">Calls ({total})</h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Show</span>
          <Select
            value={limit.toString()}
            onValueChange={(value) => {
              onLimitChange(parseInt(value));
              onOffsetChange(0);
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

      {/* Search and Filters */}
      <div className="shrink-0 border-b px-4 py-3 space-y-3">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by lead name..."
            value={search}
            onChange={(e) => {
              onSearchChange(e.target.value);
              onOffsetChange(0);
            }}
            className="pl-9 pr-9 h-9"
          />
          {search && (
            <button
              onClick={() => {
                onSearchChange("");
                onOffsetChange(0);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Status Filter */}
        <Select
          value={status}
          onValueChange={(value) => {
            onStatusChange(value);
            onOffsetChange(0);
          }}
        >
          <SelectTrigger className="w-full h-9">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Calls list */}
      {calls.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-2 p-4">
          <Phone className="h-12 w-12 text-muted-foreground/50" />
          <p className="text-muted-foreground text-center">
            {hasFilters ? "No calls match your filters" : "No calls found"}
          </p>
          {hasFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                onStatusChange("all");
                onSearchChange("");
                onOffsetChange(0);
              }}
            >
              Clear filters
            </Button>
          )}
        </div>
      ) : (
        <>
          <ScrollArea className="flex-1 min-h-0 px-4">
            <div className="space-y-2 py-4">
              {calls.map((call) => (
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
          <div className="shrink-0 flex items-center justify-between border-t px-4 py-3">
            <span className="text-sm text-muted-foreground">
              {total > 0 ? `${startIndex + 1}-${endIndex} of ${total}` : "0 items"}
            </span>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrevPage}
                disabled={offset === 0}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="px-2 text-sm">
                {currentPage} / {totalPages || 1}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNextPage}
                disabled={!hasMore}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

