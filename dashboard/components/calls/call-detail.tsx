import { Call, CallStatus } from "@/lib/api/call";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import {
  Phone,
  Clock,
  Calendar,
  User,
  FileText,
  Bot,
  Copy,
  Check,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import Link from "next/link";

interface CallDetailProps {
  call: Call;
  orgId?: string;
}

const statusConfig: Record<CallStatus, { label: string; className: string }> = {
  [CallStatus.ACTIVE]: {
    label: "Active",
    className: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  },
  [CallStatus.COMPLETED]: {
    label: "Completed",
    className:
      "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300",
  },
  [CallStatus.FAILED]: {
    label: "Failed",
    className: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
  },
  [CallStatus.DISCONNECTED]: {
    label: "Disconnected",
    className: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  },
  [CallStatus.RESCHEDULED]: {
    label: "Rescheduled",
    className:
      "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  },
  [CallStatus.MISSED]: {
    label: "Missed",
    className:
      "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300",
  },
};

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function CallDetail({ call, orgId }: CallDetailProps) {
  const statusInfo = statusConfig[call.status];
  const [copied, setCopied] = useState(false);

  const handleCopyUrl = async () => {
    const url = orgId
      ? `https://app.askchimps.com/org/${orgId}/calls/${call.id}`
      : `https://app.askchimps.com/calls/${call.id}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h2 className="text-2xl font-bold">
                {call.name || "Unknown"}
              </h2>
              {orgId && call.leadId && (
                <Link
                  href={`/org/${orgId}/leads/${call.leadId}`}
                  className="text-muted-foreground hover:text-primary transition-colors"
                  title="View lead details"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="h-5 w-5" />
                </Link>
              )}
            </div>
            {call.phoneNumber && (
              <p className="text-sm text-muted-foreground mb-2">
                {call.phoneNumber}
              </p>
            )}
            <div className="flex items-center gap-2">
              <Badge className={cn("border-0 pointer-events-none", statusInfo.className)}>
                {statusInfo.label}
              </Badge>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyUrl}
            className="shrink-0"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 mr-2" />
                Copied
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 mr-2" />
                Copy URL
              </>
            )}
          </Button>
        </div>

        {/* Metadata */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>Duration: {formatDuration(call.duration)}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>{formatDateTime(call.createdAt)}</span>
          </div>
          {call.agentName && (
            <div className="flex items-center gap-2 text-muted-foreground col-span-2">
              <Phone className="h-4 w-4" />
              <span>Agent: {call.agentName}</span>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="p-6 space-y-6">
          {/* Recording */}
          {call.recordingUrl && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Call Recording
                </CardTitle>
              </CardHeader>
              <CardContent>
                <audio controls className="w-full">
                  <source src={call.recordingUrl} type="audio/mpeg" />
                  Your browser does not support the audio element.
                </audio>
              </CardContent>
            </Card>
          )}

          {/* Detailed Summary */}
          {call.detailedSummary && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {call.detailedSummary}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Messages */}
          {call.messages && call.messages.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Conversation ({call.messages.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {call.messages.map((message) => (
                    <div
                      key={message.id}
                      className={cn(
                        "flex gap-3",
                        message.role === "user" && "flex-row-reverse"
                      )}
                    >
                      <div
                        className={cn(
                          "shrink-0 h-8 w-8 rounded-full flex items-center justify-center",
                          message.role === "user"
                            ? "bg-muted"
                            : "bg-card border"
                        )}
                      >
                        {message.role === "user" ? (
                          <User className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Bot className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                      <div
                        className={cn(
                          "flex-1 rounded-lg p-3 text-sm",
                          message.role === "user"
                            ? "bg-muted"
                            : "bg-card border"
                        )}
                      >
                        <p className="whitespace-pre-wrap text-foreground">
                          {message.content}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(message.createdAt).toLocaleTimeString(
                            "en-US",
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
