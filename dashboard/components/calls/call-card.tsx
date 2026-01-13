"use client";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Phone, Clock, User } from "lucide-react";
import type { Call, CallStatus, Sentiment } from "@/types/call";

interface CallCardProps {
  call: Call;
  isSelected: boolean;
  onClick: () => void;
}

function getStatusColor(status: CallStatus): string {
  switch (status) {
    case "COMPLETED":
      return "bg-green-500/10 text-green-500 border-green-500/20";
    case "ACTIVE":
      return "bg-blue-500/10 text-blue-500 border-blue-500/20";
    case "MISSED":
      return "bg-red-500/10 text-red-500 border-red-500/20";
    case "RESCHEDULED":
      return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
    case "DISCONNECTED":
      return "bg-gray-500/10 text-gray-500 border-gray-500/20";
    default:
      return "bg-gray-500/10 text-gray-500 border-gray-500/20";
  }
}

function getSentimentColor(sentiment: Sentiment | null): string {
  switch (sentiment) {
    case "HOT":
      return "bg-red-500/10 text-red-500 border-red-500/20";
    case "WARM":
      return "bg-orange-500/10 text-orange-500 border-orange-500/20";
    case "COLD":
      return "bg-blue-500/10 text-blue-500 border-blue-500/20";
    case "NEUTRAL":
      return "bg-gray-500/10 text-gray-500 border-gray-500/20";
    default:
      return "";
  }
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function CallCard({ call, isSelected, onClick }: CallCardProps) {
  return (
    <Card
      className={cn(
        "cursor-pointer p-4 transition-all hover:border-primary/50",
        isSelected && "border-primary bg-primary/5"
      )}
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium truncate">
              {call.name || "Unnamed Call"}
            </span>
          </div>
          {call.shortSummary && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
              {call.shortSummary}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatDuration(call.duration)}
            </span>
            <span className="flex items-center gap-1">
              <User className="h-3 w-3" />
              {formatDate(call.createdAt)}
            </span>
          </div>
        </div>
        <div className="flex flex-col gap-1 items-end">
          <Badge variant="outline" className={cn("text-xs", getStatusColor(call.status))}>
            {call.status}
          </Badge>
          {call.sentiment && (
            <Badge variant="outline" className={cn("text-xs", getSentimentColor(call.sentiment))}>
              {call.sentiment}
            </Badge>
          )}
        </div>
      </div>
    </Card>
  );
}

