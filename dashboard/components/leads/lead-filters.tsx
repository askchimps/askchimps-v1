import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Filter } from "lucide-react";

interface LeadFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  status: string;
  onStatusChange: (value: string) => void;
  disposition: string;
  onDispositionChange: (value: string) => void;
}

export function LeadFilters({
  search,
  onSearchChange,
  status,
  onStatusChange,
  disposition,
  onDispositionChange,
}: LeadFiltersProps) {
  return (
    <div className="p-4 border-b space-y-3">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name or phone..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Status Filter */}
      <Select value={status} onValueChange={onStatusChange}>
        <SelectTrigger>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            <SelectValue placeholder="Status" />
          </div>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">All Status</SelectItem>
          <SelectItem value="New">New</SelectItem>
          <SelectItem value="Contacted">Contacted</SelectItem>
          <SelectItem value="Qualified">Qualified</SelectItem>
          <SelectItem value="Converted">Converted</SelectItem>
          <SelectItem value="Lost">Lost</SelectItem>
        </SelectContent>
      </Select>

      {/* Disposition Filter */}
      <Select value={disposition} onValueChange={onDispositionChange}>
        <SelectTrigger>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            <SelectValue placeholder="Disposition" />
          </div>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">All Disposition</SelectItem>
          <SelectItem value="Interested">Interested</SelectItem>
          <SelectItem value="Not Interested">Not Interested</SelectItem>
          <SelectItem value="Callback">Callback</SelectItem>
          <SelectItem value="No Answer">No Answer</SelectItem>
          <SelectItem value="Wrong Number">Wrong Number</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

