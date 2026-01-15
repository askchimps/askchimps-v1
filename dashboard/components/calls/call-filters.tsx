import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CallStatus } from "@/lib/api/call";
import { Search, Filter } from "lucide-react";

interface CallFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  status: CallStatus | "ALL";
  onStatusChange: (value: CallStatus | "ALL") => void;
}

export function CallFilters({
  search,
  onSearchChange,
  status,
  onStatusChange,
}: CallFiltersProps) {
  return (
    <div className="p-4 border-b space-y-3">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by lead name..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Filters */}
      <Select value={status} onValueChange={onStatusChange}>
        <SelectTrigger>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            <SelectValue placeholder="Status" />
          </div>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">All Status</SelectItem>
          <SelectItem value={CallStatus.ACTIVE}>Active</SelectItem>
          <SelectItem value={CallStatus.COMPLETED}>Completed</SelectItem>
          <SelectItem value={CallStatus.FAILED}>Failed</SelectItem>
          <SelectItem value={CallStatus.DISCONNECTED}>Disconnected</SelectItem>
          <SelectItem value={CallStatus.RESCHEDULED}>Rescheduled</SelectItem>
          <SelectItem value={CallStatus.MISSED}>Missed</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

