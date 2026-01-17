import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { ChatStatus, ChatSource } from "@/lib/api/chat";
import { Search, Filter } from "lucide-react";

interface ChatFiltersProps {
    search: string;
    onSearchChange: (value: string) => void;
    status: ChatStatus | "ALL";
    onStatusChange: (value: ChatStatus | "ALL") => void;
    source: ChatSource | "ALL";
    onSourceChange: (value: ChatSource | "ALL") => void;
}

export function ChatFilters({
    search,
    onSearchChange,
    status,
    onStatusChange,
    source,
    onSourceChange,
}: ChatFiltersProps) {
    return (
        <div className="space-y-3 border-b p-4">
            {/* Search */}
            <div className="relative">
                <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                <Input
                    placeholder="Search by lead name or phone..."
                    value={search}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="pl-9"
                />
            </div>

            {/* Filters */}
            <div className="grid grid-cols-2 gap-2">
                <Select value={status} onValueChange={onStatusChange}>
                    <SelectTrigger>
                        <div className="flex items-center gap-2">
                            <Filter className="h-4 w-4" />
                            <SelectValue placeholder="Status" />
                        </div>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ALL">All Status</SelectItem>
                        <SelectItem value={ChatStatus.NEW}>New</SelectItem>
                        <SelectItem value={ChatStatus.OPEN}>Open</SelectItem>
                        <SelectItem value={ChatStatus.PENDING}>
                            Pending
                        </SelectItem>
                        <SelectItem value={ChatStatus.CLOSED}>
                            Closed
                        </SelectItem>
                    </SelectContent>
                </Select>

                <Select value={source} onValueChange={onSourceChange}>
                    <SelectTrigger>
                        <div className="flex items-center gap-2">
                            <Filter className="h-4 w-4" />
                            <SelectValue placeholder="Source" />
                        </div>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ALL">All Sources</SelectItem>
                        <SelectItem value={ChatSource.WHATSAPP}>
                            WhatsApp
                        </SelectItem>
                        <SelectItem value={ChatSource.INSTAGRAM}>
                            Instagram
                        </SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
    );
}
