import { Lead } from "@/lib/api/lead";
import { Badge } from "@/components/ui/badge";
import { User, Mail, Phone } from "lucide-react";
import { cn } from "@/lib/utils";

interface LeadListItemProps {
    lead: Lead;
    isSelected: boolean;
    onClick: () => void;
}

const statusColors: Record<string, string> = {
    New: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
    Contacted:
        "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300",
    Qualified:
        "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300",
    Converted:
        "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
    Lost: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
};

const dispositionColors: Record<string, string> = {
    Interested:
        "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300",
    "Not Interested":
        "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
    Callback:
        "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
    "No Answer":
        "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300",
    "Wrong Number": "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
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

export function LeadListItem({ lead, isSelected, onClick }: LeadListItemProps) {
    const fullName =
        [lead.firstName, lead.lastName].filter(Boolean).join(" ") || "Unknown";
    const statusColor =
        statusColors[lead.status || ""] ||
        "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
    const dispositionColor =
        dispositionColors[lead.disposition || ""] ||
        "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";

    return (
        <div
            data-lead-id={lead.id}
            onClick={onClick}
            className={cn(
                "hover:bg-accent/50 cursor-pointer border-b p-4 transition-colors",
                isSelected && "bg-accent border-l-primary border-l-4",
            )}
        >
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-center gap-2">
                        <User className="text-muted-foreground h-4 w-4 shrink-0" />
                        <h3 className="truncate text-sm font-medium">
                            {fullName}
                        </h3>
                    </div>

                    {lead.phone && (
                        <div className="text-muted-foreground mb-1 flex items-center gap-1.5 text-xs">
                            <Phone className="h-3 w-3" />
                            <span>{lead.phone}</span>
                        </div>
                    )}

                    {lead.email && (
                        <div className="text-muted-foreground mb-2 flex items-center gap-1.5 text-xs">
                            <Mail className="h-3 w-3" />
                            <span className="truncate">{lead.email}</span>
                        </div>
                    )}

                    <div className="flex flex-wrap items-center gap-2">
                        {lead.status && (
                            <Badge
                                className={cn(
                                    "pointer-events-none border-0 text-xs",
                                    statusColor,
                                )}
                            >
                                {lead.status}
                            </Badge>
                        )}

                        {lead.disposition && (
                            <Badge
                                variant="outline"
                                className={cn(
                                    "pointer-events-none text-xs",
                                    dispositionColor,
                                )}
                            >
                                {lead.disposition}
                            </Badge>
                        )}
                    </div>
                </div>

                <div className="text-muted-foreground shrink-0 text-xs">
                    {formatDate(lead.createdAt)}
                </div>
            </div>
        </div>
    );
}
