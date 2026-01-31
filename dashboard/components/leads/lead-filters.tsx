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
    availableStatuses?: string[];
    availableDispositions?: string[];
}

export function LeadFilters({
    search,
    onSearchChange,
    status,
    onStatusChange,
    disposition,
    onDispositionChange,
    availableStatuses = [],
    availableDispositions = [],
}: LeadFiltersProps) {
    return (
        <div className="space-y-3 border-b p-4">
            {/* Search */}
            <div className="relative">
                <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
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
                    {availableStatuses
                        .filter((statusValue) => statusValue && statusValue.trim() !== "")
                        .map((statusValue) => (
                            <SelectItem key={statusValue} value={statusValue}>
                                {statusValue}
                            </SelectItem>
                        ))}
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
                    {availableDispositions
                        .filter((dispositionValue) => dispositionValue && dispositionValue.trim() !== "")
                        .map((dispositionValue) => (
                            <SelectItem
                                key={dispositionValue}
                                value={dispositionValue}
                            >
                                {dispositionValue}
                            </SelectItem>
                        ))}
                </SelectContent>
            </Select>
        </div>
    );
}
