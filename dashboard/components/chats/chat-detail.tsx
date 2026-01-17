import { Chat, ChatStatus, ChatSource } from "@/lib/api/chat";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import {
    MessageSquare,
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

interface ChatDetailProps {
    chat: Chat;
    orgId?: string;
}

const statusConfig: Record<ChatStatus, { label: string; className: string }> = {
    [ChatStatus.NEW]: {
        label: "New",
        className:
            "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
    },
    [ChatStatus.OPEN]: {
        label: "Open",
        className:
            "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300",
    },
    [ChatStatus.PENDING]: {
        label: "Pending",
        className:
            "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
    },
    [ChatStatus.CLOSED]: {
        label: "Closed",
        className:
            "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
    },
};

const sourceConfig: Record<ChatSource, { label: string; className: string }> = {
    [ChatSource.WHATSAPP]: {
        label: "WhatsApp",
        className:
            "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
    },
    [ChatSource.INSTAGRAM]: {
        label: "Instagram",
        className:
            "bg-pink-100 text-pink-700 dark:bg-pink-950 dark:text-pink-300",
    },
};

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

export function ChatDetail({ chat, orgId }: ChatDetailProps) {
    const statusInfo = statusConfig[chat.status];
    const sourceInfo = sourceConfig[chat.source];
    const [copied, setCopied] = useState(false);

    const leadName = chat.lead
        ? `${chat.lead.firstName || ""} ${chat.lead.lastName || ""}`.trim() ||
          chat.lead.phone
        : "Unknown";

    const handleCopyUrl = async () => {
        const url = orgId
            ? `https://app.askchimps.com/org/${orgId}/chats/${chat.id}`
            : `https://app.askchimps.com/chats/${chat.id}`;
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="flex h-full flex-col">
            {/* Header */}
            <div className="border-b p-6">
                <div className="mb-4 flex items-start justify-between gap-4">
                    <div className="flex-1">
                        <div className="mb-2 flex items-center gap-2">
                            <h2 className="text-2xl font-bold">
                                {chat.name || leadName}
                            </h2>
                            {orgId && chat.leadId && (
                                <Link
                                    href={`/org/${orgId}/leads/${chat.leadId}`}
                                    className="text-muted-foreground hover:text-primary transition-colors"
                                    title="View lead details"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <ExternalLink className="h-5 w-5" />
                                </Link>
                            )}
                        </div>
                        {chat.lead?.phone && (
                            <p className="text-muted-foreground mb-2 text-sm">
                                {chat.lead.phone}
                            </p>
                        )}
                        <div className="flex items-center gap-2">
                            <Badge
                                className={cn(
                                    "pointer-events-none border-0",
                                    statusInfo.className,
                                )}
                            >
                                {statusInfo.label}
                            </Badge>
                            <Badge
                                className={cn(
                                    "pointer-events-none border-0",
                                    sourceInfo.className,
                                )}
                            >
                                {sourceInfo.label}
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
                                <Check className="mr-2 h-4 w-4" />
                                Copied
                            </>
                        ) : (
                            <>
                                <Copy className="mr-2 h-4 w-4" />
                                Copy URL
                            </>
                        )}
                    </Button>
                </div>

                {/* Metadata */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="text-muted-foreground flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDateTime(chat.createdAt)}</span>
                    </div>
                    <div className="text-muted-foreground flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span>Source ID: {chat.sourceId}</span>
                    </div>
                </div>
            </div>

            {/* Content */}
            <ScrollArea className="flex-1">
                <div className="space-y-4 p-6">
                    {/* Short Summary */}
                    {chat.shortSummary && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <FileText className="h-4 w-4" />
                                    Summary
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground text-sm">
                                    {chat.shortSummary}
                                </p>
                            </CardContent>
                        </Card>
                    )}

                    {/* Detailed Summary */}
                    {chat.detailedSummary && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <Bot className="h-4 w-4" />
                                    Detailed Summary
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground text-sm whitespace-pre-wrap">
                                    {chat.detailedSummary}
                                </p>
                            </CardContent>
                        </Card>
                    )}

                    {/* Messages */}
                    {chat.messages && chat.messages.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <MessageSquare className="h-4 w-4" />
                                    Messages ({chat.messages.length})
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {chat.messages.map((message) => (
                                        <div
                                            key={message.id}
                                            className={cn(
                                                "rounded-lg border p-3",
                                                message.role === "USER"
                                                    ? "bg-blue-50 dark:bg-blue-950/20"
                                                    : "bg-gray-50 dark:bg-gray-900/20",
                                            )}
                                        >
                                            <div className="mb-1 flex items-center justify-between">
                                                <span className="text-xs font-medium">
                                                    {message.role}
                                                </span>
                                                <span className="text-muted-foreground text-xs">
                                                    {formatDateTime(
                                                        message.createdAt,
                                                    )}
                                                </span>
                                            </div>
                                            <p className="text-sm">
                                                {message.content}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* No Messages */}
                    {(!chat.messages || chat.messages.length === 0) && (
                        <Card>
                            <CardContent className="flex flex-col items-center justify-center py-8">
                                <MessageSquare className="text-muted-foreground mb-2 h-8 w-8" />
                                <p className="text-muted-foreground text-sm">
                                    No messages available
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </ScrollArea>
        </div>
    );
}
