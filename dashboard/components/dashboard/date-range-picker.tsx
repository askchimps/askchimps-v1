"use client";

import { Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface DateRangePickerProps {
    dateRange: { startDate: string; endDate: string };
    onDateRangeChange: (range: { startDate: string; endDate: string }) => void;
}

export function DateRangePicker({
    dateRange,
    onDateRangeChange,
}: DateRangePickerProps) {
    const presets = [
        {
            label: "Last 7 days",
            getValue: () => {
                const end = new Date();
                const start = new Date();
                start.setDate(start.getDate() - 7);
                return {
                    startDate: start.toISOString(),
                    endDate: end.toISOString(),
                };
            },
        },
        {
            label: "Last 30 days",
            getValue: () => {
                const end = new Date();
                const start = new Date();
                start.setDate(start.getDate() - 30);
                return {
                    startDate: start.toISOString(),
                    endDate: end.toISOString(),
                };
            },
        },
        {
            label: "Last 90 days",
            getValue: () => {
                const end = new Date();
                const start = new Date();
                start.setDate(start.getDate() - 90);
                return {
                    startDate: start.toISOString(),
                    endDate: end.toISOString(),
                };
            },
        },
        {
            label: "This month",
            getValue: () => {
                const now = new Date();
                const start = new Date(now.getFullYear(), now.getMonth(), 1);
                const end = new Date();
                return {
                    startDate: start.toISOString(),
                    endDate: end.toISOString(),
                };
            },
        },
        {
            label: "Last month",
            getValue: () => {
                const now = new Date();
                const start = new Date(
                    now.getFullYear(),
                    now.getMonth() - 1,
                    1,
                );
                const end = new Date(now.getFullYear(), now.getMonth(), 0);
                return {
                    startDate: start.toISOString(),
                    endDate: end.toISOString(),
                };
            },
        },
    ];

    const formatDateRange = () => {
        const start = new Date(dateRange.startDate);
        const end = new Date(dateRange.endDate);
        return `${start.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${end.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;
    };

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    className={cn(
                        "justify-start text-left font-normal",
                        !dateRange && "text-muted-foreground",
                    )}
                >
                    <Calendar className="mr-2 h-4 w-4" />
                    {dateRange ? formatDateRange() : "Select date range"}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
                <div className="flex flex-col gap-2 p-3">
                    {presets.map((preset) => (
                        <Button
                            key={preset.label}
                            variant="ghost"
                            className="justify-start"
                            onClick={() => onDateRangeChange(preset.getValue())}
                        >
                            {preset.label}
                        </Button>
                    ))}
                </div>
            </PopoverContent>
        </Popover>
    );
}
