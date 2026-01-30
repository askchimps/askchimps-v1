import { Call, CallStatus } from "@/lib/api/call";
import { Badge } from "@/components/ui/badge";
import { Phone, Clock, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface CallListItemProps {
    call: Call;
    isSelected: boolean;
    onClick: () => void;
    orgId?: string;
}

const statusConfig: Record<CallStatus, { label: string; className: string }> = {
    [CallStatus.ACTIVE]: {
        label: "Active",
        className:
            "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
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
        className:
            "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
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

export function CallListItem({
    call,
    isSelected,
    onClick,
    orgId,
}: CallListItemProps) {
    const statusInfo = statusConfig[call.status];

    return (
        <div
            data-call-id={call.id}
            onClick={onClick}
            className={cn(
                "cursor-pointer border-b p-4 transition-colors",
                isSelected && "bg-accent border-l-primary border-l-4",
            )}
        >
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-center gap-2">
                        <Phone className="text-muted-foreground h-4 w-4 shrink-0" />
                        <h3 className="truncate text-sm font-medium">
                            {call.name || "Unknown"}
                        </h3>
                        {orgId && call.leadId && (
                            <Link
                                href={`/org/${orgId}/leads/${call.leadId}`}
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

                    {call.phoneNumber && (
                        <p className="text-muted-foreground mb-2 text-xs">
                            {call.phoneNumber}
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

                        {call.duration > 0 && (
                            <div className="text-muted-foreground flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                <span className="text-xs">
                                    {formatDuration(call.duration)}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="text-muted-foreground shrink-0 text-xs">
                    {formatDate(call.createdAt)}
                </div>
            </div>
        </div>
    );
}
