"use client";

import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Bot, User, Clock, Phone, FileText } from "lucide-react";
import { useCall, useCallMessages } from "@/hooks/use-calls";
import type { CallMessage } from "@/types/call";

interface CallMessagesProps {
  organisationId: string;
  callId: string;
}

function formatTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}m ${secs}s`;
}

function MessageBubble({ message }: { message: CallMessage }) {
  const isAgent = message.role.toLowerCase() === "agent" || message.role.toLowerCase() === "assistant";

  return (
    <div className={cn("flex gap-2 mb-3", isAgent ? "flex-row" : "flex-row-reverse")}>
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
          isAgent
            ? "bg-primary/10 text-primary"
            : "bg-muted text-muted-foreground"
        )}
      >
        {isAgent ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
      </div>
      <div className={cn("flex flex-col max-w-[75%]", isAgent ? "items-start" : "items-end")}>
        <div
          className={cn(
            "rounded-lg px-3 py-2 text-sm",
            isAgent
              ? "bg-primary/10 text-foreground"
              : "bg-muted text-foreground"
          )}
        >
          {message.content}
        </div>
        <span className="text-xs text-muted-foreground mt-1">
          {formatTime(message.createdAt)}
        </span>
      </div>
    </div>
  );
}

export function CallMessages({ organisationId, callId }: CallMessagesProps) {
  const { call, isLoading: isLoadingCall } = useCall(organisationId, callId);
  const { messages, isLoading: isLoadingMessages } = useCallMessages(organisationId, callId);

  if (isLoadingCall || isLoadingMessages) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">Loading call...</p>
      </div>
    );
  }

  if (!call) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">Call not found</p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* Call Header */}
      <Card className="mb-4">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Phone className="h-5 w-5" />
              {call.name || "Unnamed Call"}
            </CardTitle>
            <Badge variant="outline">{call.status}</Badge>
          </div>
        </CardHeader>
        <CardContent className="pb-4">
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              Duration: {formatDuration(call.duration)}
            </span>
            {call.sentiment && (
              <Badge variant="secondary">{call.sentiment}</Badge>
            )}
          </div>
          {call.shortSummary && (
            <div className="mt-3 p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground mb-1">
                <FileText className="h-3 w-3" />
                Summary
              </div>
              <p className="text-sm">{call.shortSummary}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Messages */}
      <Card className="flex-1 flex flex-col min-h-0">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Conversation</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 pb-4 min-h-0">
          <ScrollArea className="h-full pr-4">
            {messages.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No messages in this call
              </p>
            ) : (
              <div className="space-y-1">
                {messages.map((message) => (
                  <MessageBubble key={message.id} message={message} />
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}

