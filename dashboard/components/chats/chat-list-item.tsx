import { Chat, ChatStatus, ChatSource } from "@/lib/api/chat";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface ChatListItemProps {
    chat: Chat;
    isSelected: boolean;
    onClick: () => void;
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

function formatDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function ChatListItem({
    chat,
    isSelected,
    onClick,
    orgId,
}: ChatListItemProps) {
    const statusInfo = statusConfig[chat.status];
    const sourceInfo = sourceConfig[chat.source];

    const leadName = chat.lead
        ? `${chat.lead.firstName || ""} ${chat.lead.lastName || ""}`.trim() ||
          chat.lead.phone
        : "Unknown";

    return (
        <div
            data-chat-id={chat.id}
            onClick={onClick}
            className={cn(
                "cursor-pointer border-b p-4 transition-colors",
                isSelected && "bg-accent border-l-primary border-l-4",
            )}
        >
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-center gap-2">
                        <MessageSquare className="text-muted-foreground h-4 w-4 shrink-0" />
                        <h3 className="truncate text-sm font-medium">
                            {chat.name || leadName}
                        </h3>
                        {orgId && chat.leadId && (
                            <Link
                                href={`/org/${orgId}/leads/${chat.leadId}`}
                                className="text-muted-foreground hover:text-primary shrink-0 transition-colors"
                                title="View lead details"
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <ExternalLink className="h-3.5 w-3.5" />
                            </Link>
                        )}
                    </div>

                    {chat.shortSummary && (
                        <p className="text-muted-foreground mb-2 line-clamp-2 text-xs">
                            {chat.shortSummary}
                        </p>
                    )}

                    <div className="flex flex-wrap items-center gap-2">
                        <Badge
                            className={cn(
                                "pointer-events-none border-0 text-xs",
                                statusInfo.className,
                            )}
                        >
                            {statusInfo.label}
                        </Badge>

                        <Badge
                            className={cn(
                                "pointer-events-none border-0 text-xs",
                                sourceInfo.className,
                            )}
                        >
                            {sourceInfo.label}
                        </Badge>
                    </div>
                </div>

                <div className="text-muted-foreground shrink-0 text-xs">
                    {formatDate(chat.createdAt)}
                </div>
            </div>
        </div>
    );
}
