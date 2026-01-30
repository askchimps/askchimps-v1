"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Phone, MessageSquare } from "lucide-react";
import { MonthPicker } from "./month-picker";

interface StatCardsProps {
    totalLeads: number;
    totalCalls: number;
    totalChats: number;
    selectedMonth: string;
    onMonthChange: (month: string) => void;
}

export const StatCards = React.memo(function StatCards({
    totalLeads,
    totalCalls,
    totalChats,
    selectedMonth,
    onMonthChange,
}: StatCardsProps) {
    const stats = [
        {
            title: "Total Leads",
            value: totalLeads.toLocaleString(),
            icon: Users,
            color: "text-blue-600",
            bgColor: "bg-blue-50 dark:bg-blue-950",
        },
        {
            title: "Total Calls",
            value: totalCalls.toLocaleString(),
            icon: Phone,
            color: "text-green-600",
            bgColor: "bg-green-50 dark:bg-green-950",
        },
        {
            title: "Total Chats",
            value: totalChats.toLocaleString(),
            icon: MessageSquare,
            color: "text-purple-600",
            bgColor: "bg-purple-50 dark:bg-purple-950",
        },
    ];

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Overview</h2>
                <MonthPicker
                    selectedMonth={selectedMonth}
                    onMonthChange={onMonthChange}
                />
            </div>
            <div className="grid gap-4 md:grid-cols-3">
                {stats.map((stat) => (
                    <Card key={stat.title}>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-muted-foreground text-sm font-medium">
                                {stat.title}
                            </CardTitle>
                            <div className={`rounded-lg p-2 ${stat.bgColor}`}>
                                <stat.icon
                                    className={`h-4 w-4 ${stat.color}`}
                                />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {stat.value}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
});
