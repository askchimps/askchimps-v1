"use client";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { useAuthStore } from "@/stores/auth-store";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { analyticsApi } from "@/lib/api/analytics";
import { StatCards } from "@/components/dashboard/stat-cards";
import {
    CallActivityChart,
    ChatActivityChart,
    PickupRateChart,
    AvgDurationChart,
} from "@/components/dashboard/analytics-charts";
import { DateRangePicker } from "@/components/dashboard/date-range-picker";
import { useState } from "react";
import { Loader2 } from "lucide-react";

export default function DashboardPage() {
    const { user } = useAuthStore();
    const params = useParams();
    const orgId = params.orgId as string;

    // Default to last 30 days
    const [dateRange, setDateRange] = useState(() => {
        const end = new Date();
        const start = new Date();
        start.setDate(start.getDate() - 30);
        return {
            startDate: start.toISOString(),
            endDate: end.toISOString(),
        };
    });

    const { data: analytics, isLoading } = useQuery({
        queryKey: ["analytics", orgId, dateRange],
        queryFn: () =>
            analyticsApi.getAnalytics(orgId, {
                startDate: dateRange.startDate,
                endDate: dateRange.endDate,
            }),
        enabled: !!orgId,
    });

    if (isLoading) {
        return (
            <DashboardLayout>
                <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
                    <Loader2 className="text-primary h-8 w-8 animate-spin" />
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="space-y-6 p-6 lg:p-8">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            Dashboard
                        </h1>
                        <p className="text-muted-foreground mt-2">
                            Analytics and insights for your organization
                        </p>
                    </div>
                    <DateRangePicker
                        dateRange={dateRange}
                        onDateRangeChange={setDateRange}
                    />
                </div>

                {/* Stats Cards */}
                {analytics?.data && (
                    <StatCards
                        totalLeads={analytics.data.totalLeads}
                        totalCalls={analytics.data.totalCalls}
                        totalChats={analytics.data.totalChats}
                    />
                )}

                {/* Charts Grid */}
                {analytics?.data && (
                    <div className="grid gap-6 lg:grid-cols-2">
                        <CallActivityChart
                            data={analytics.data.mostActiveHoursForCalls}
                        />
                        <ChatActivityChart
                            data={analytics.data.chatCountByHoursPerDay}
                        />
                        <PickupRateChart
                            data={analytics.data.callPickupRatePerDay}
                        />
                        <AvgDurationChart
                            data={analytics.data.avgCallDurationPerDay}
                        />
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
