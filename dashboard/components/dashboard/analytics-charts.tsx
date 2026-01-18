"use client";

import React from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from "recharts";
import type {
    HourlyCount,
    DailyPickupRate,
    DailyAvgDuration,
} from "@/lib/api/analytics";
import { MonthPicker } from "./month-picker";

interface CallActivityChartProps {
    data: HourlyCount[];
    selectedMonth: string;
    onMonthChange: (month: string) => void;
}

interface ChatActivityChartProps {
    data: HourlyCount[];
    selectedMonth: string;
    onMonthChange: (month: string) => void;
}

interface PickupRateChartProps {
    data: DailyPickupRate[];
    selectedMonth: string;
    onMonthChange: (month: string) => void;
}

interface AvgDurationChartProps {
    data: DailyAvgDuration[];
    selectedMonth: string;
    onMonthChange: (month: string) => void;
}

export const CallActivityChart = React.memo(function CallActivityChart({
    data,
    selectedMonth,
    onMonthChange,
}: CallActivityChartProps) {
    const chartData = data.map((item) => ({
        hour: `${item.hour}:00`,
        calls: item.count,
    }));

    return (
        <Card>
            <CardHeader>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <CardTitle>Call Activity by Hour</CardTitle>
                        <CardDescription>
                            Distribution of completed calls throughout the day
                        </CardDescription>
                    </div>
                    <MonthPicker
                        selectedMonth={selectedMonth}
                        onMonthChange={onMonthChange}
                    />
                </div>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                        <XAxis
                            dataKey="hour"
                            tick={{ fontSize: 12 }}
                            tickLine={false}
                        />
                        <YAxis tick={{ fontSize: 12 }} tickLine={false} />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: "hsl(var(--card))",
                                border: "1px solid hsl(var(--border))",
                                borderRadius: "8px",
                            }}
                            formatter={(value: number) => [
                                `${value} calls`,
                                "Calls",
                            ]}
                            labelStyle={{ color: "hsl(var(--foreground))" }}
                            itemStyle={{ color: "hsl(var(--foreground))" }}
                        />
                        <Bar
                            dataKey="calls"
                            fill="hsl(var(--primary))"
                            radius={[4, 4, 0, 0]}
                            background={false}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
});

export const ChatActivityChart = React.memo(function ChatActivityChart({
    data,
    selectedMonth,
    onMonthChange,
}: ChatActivityChartProps) {
    const chartData = data.map((item) => ({
        hour: `${item.hour}:00`,
        chats: item.count,
    }));

    return (
        <Card>
            <CardHeader>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <CardTitle>Chat Activity by Hour</CardTitle>
                        <CardDescription>
                            Distribution of chats throughout the day
                        </CardDescription>
                    </div>
                    <MonthPicker
                        selectedMonth={selectedMonth}
                        onMonthChange={onMonthChange}
                    />
                </div>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                        <XAxis
                            dataKey="hour"
                            tick={{ fontSize: 12 }}
                            tickLine={false}
                        />
                        <YAxis tick={{ fontSize: 12 }} tickLine={false} />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: "hsl(var(--card))",
                                border: "1px solid hsl(var(--border))",
                                borderRadius: "8px",
                            }}
                            formatter={(value: number) => [
                                `${value} chats`,
                                "Chats",
                            ]}
                            labelStyle={{ color: "hsl(var(--foreground))" }}
                            itemStyle={{ color: "hsl(var(--foreground))" }}
                        />
                        <Bar
                            dataKey="chats"
                            fill="hsl(142 76% 36%)"
                            radius={[4, 4, 0, 0]}
                            background={false}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
});

export const PickupRateChart = React.memo(function PickupRateChart({
    data,
    selectedMonth,
    onMonthChange,
}: PickupRateChartProps) {
    const chartData = data.map((item) => ({
        date: new Date(item.date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
        }),
        rate: item.rate,
    }));

    return (
        <Card>
            <CardHeader>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <CardTitle>Call Pickup Rate</CardTitle>
                        <CardDescription>
                            Daily percentage of successfully connected calls
                        </CardDescription>
                    </div>
                    <MonthPicker
                        selectedMonth={selectedMonth}
                        onMonthChange={onMonthChange}
                    />
                </div>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                        <XAxis
                            dataKey="date"
                            tick={{ fontSize: 12 }}
                            tickLine={false}
                        />
                        <YAxis
                            tick={{ fontSize: 12 }}
                            tickLine={false}
                            domain={[0, 100]}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: "hsl(var(--card))",
                                border: "1px solid hsl(var(--border))",
                                borderRadius: "8px",
                            }}
                            formatter={(value: number) => [
                                `${value.toFixed(2)}%`,
                                "Pickup Rate",
                            ]}
                            labelStyle={{ color: "hsl(var(--foreground))" }}
                            itemStyle={{ color: "hsl(var(--foreground))" }}
                        />
                        <Line
                            type="monotone"
                            dataKey="rate"
                            stroke="hsl(var(--primary))"
                            strokeWidth={2}
                            dot={{ r: 4 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
});

export const AvgDurationChart = React.memo(function AvgDurationChart({
    data,
    selectedMonth,
    onMonthChange,
}: AvgDurationChartProps) {
    const chartData = data.map((item) => ({
        date: new Date(item.date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
        }),
        duration: Math.round(item.avgDuration / 60), // Convert to minutes
    }));

    return (
        <Card>
            <CardHeader>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <CardTitle>Average Call Duration</CardTitle>
                        <CardDescription>
                            Daily average duration of completed calls (minutes)
                        </CardDescription>
                    </div>
                    <MonthPicker
                        selectedMonth={selectedMonth}
                        onMonthChange={onMonthChange}
                    />
                </div>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                        <XAxis
                            dataKey="date"
                            tick={{ fontSize: 12 }}
                            tickLine={false}
                        />
                        <YAxis tick={{ fontSize: 12 }} tickLine={false} />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: "hsl(var(--card))",
                                border: "1px solid hsl(var(--border))",
                                borderRadius: "8px",
                            }}
                            formatter={(value: number) => [
                                `${value} min`,
                                "Avg Duration",
                            ]}
                            labelStyle={{ color: "hsl(var(--foreground))" }}
                            itemStyle={{ color: "hsl(var(--foreground))" }}
                        />
                        <Line
                            type="monotone"
                            dataKey="duration"
                            stroke="hsl(142 76% 36%)"
                            strokeWidth={2}
                            dot={{ r: 4 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
});
