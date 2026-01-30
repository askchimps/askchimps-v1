"use client";

import * as React from "react";
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

interface MonthPickerProps {
    selectedMonth: string;
    onMonthChange: (month: string) => void;
}

export function MonthPicker({
    selectedMonth,
    onMonthChange,
}: MonthPickerProps) {
    const [isOpen, setIsOpen] = React.useState(false);

    const formatMonthDisplay = (monthStr: string) => {
        const [year, month] = monthStr.split("-");
        const date = new Date(parseInt(year), parseInt(month) - 1);
        return date.toLocaleDateString("en-US", {
            month: "long",
            year: "numeric",
        });
    };

    const handlePreviousMonth = () => {
        const [year, month] = selectedMonth.split("-").map(Number);
        const date = new Date(year, month - 1);
        date.setMonth(date.getMonth() - 1);
        const newMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
        onMonthChange(newMonth);
    };

    const handleNextMonth = () => {
        const [year, month] = selectedMonth.split("-").map(Number);
        const date = new Date(year, month - 1);
        date.setMonth(date.getMonth() + 1);
        const newMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
        onMonthChange(newMonth);
    };

    const handleCurrentMonth = () => {
        const now = new Date();
        const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
        onMonthChange(currentMonth);
        setIsOpen(false);
    };

    const generateMonthOptions = () => {
        const options = [];
        const now = new Date();
        // Generate last 12 months
        for (let i = 11; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i);
            const monthStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
            options.push({
                value: monthStr,
                label: date.toLocaleDateString("en-US", {
                    month: "long",
                    year: "numeric",
                }),
            });
        }
        return options;
    };

    const monthOptions = generateMonthOptions();

    return (
        <div className="flex items-center gap-2">
            <Button
                variant="outline"
                size="icon"
                onClick={handlePreviousMonth}
                className="h-9 w-9"
            >
                <ChevronLeft className="h-4 w-4" />
            </Button>

            <Popover open={isOpen} onOpenChange={setIsOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        className="min-w-[200px] justify-start text-left font-normal"
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formatMonthDisplay(selectedMonth)}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                    <div className="p-3">
                        <div className="mb-2 flex items-center justify-between">
                            <h4 className="text-sm font-medium">
                                Select Month
                            </h4>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleCurrentMonth}
                                className="h-7 text-xs"
                            >
                                Current Month
                            </Button>
                        </div>
                        <div className="grid gap-1">
                            {monthOptions.map((option) => (
                                <Button
                                    key={option.value}
                                    variant={
                                        selectedMonth === option.value
                                            ? "default"
                                            : "ghost"
                                    }
                                    className="justify-start"
                                    onClick={() => {
                                        onMonthChange(option.value);
                                        setIsOpen(false);
                                    }}
                                >
                                    {option.label}
                                </Button>
                            ))}
                        </div>
                    </div>
                </PopoverContent>
            </Popover>

            <Button
                variant="outline"
                size="icon"
                onClick={handleNextMonth}
                className="h-9 w-9"
            >
                <ChevronRight className="h-4 w-4" />
            </Button>
        </div>
    );
}
