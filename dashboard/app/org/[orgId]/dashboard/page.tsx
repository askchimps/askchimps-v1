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
import { useState, useCallback } from "react";
import { Loader2 } from "lucide-react";

// Helper function to get current month in YYYY-MM format
const getCurrentMonth = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
};

export default function DashboardPage() {
    const { user } = useAuthStore();
    const params = useParams();
    const orgId = params.orgId as string;

    // Individual month states for each metric
    const [overviewMonth, setOverviewMonth] = useState(getCurrentMonth());
    const [callActivityMonth, setCallActivityMonth] =
        useState(getCurrentMonth());
    const [chatActivityMonth, setChatActivityMonth] =
        useState(getCurrentMonth());
    const [pickupRateMonth, setPickupRateMonth] = useState(getCurrentMonth());
    const [avgDurationMonth, setAvgDurationMonth] = useState(getCurrentMonth());

    // Memoized callbacks to prevent unnecessary re-renders
    const handleOverviewMonthChange = useCallback((month: string) => {
        setOverviewMonth(month);
    }, []);

    const handleCallActivityMonthChange = useCallback((month: string) => {
        setCallActivityMonth(month);
    }, []);

    const handleChatActivityMonthChange = useCallback((month: string) => {
        setChatActivityMonth(month);
    }, []);

    const handlePickupRateMonthChange = useCallback((month: string) => {
        setPickupRateMonth(month);
    }, []);

    const handleAvgDurationMonthChange = useCallback((month: string) => {
        setAvgDurationMonth(month);
    }, []);

    // Separate queries for each metric
    const { data: totalLeads, isLoading: isLoadingLeads } = useQuery({
        queryKey: ["totalLeads", orgId, overviewMonth],
        queryFn: () =>
            analyticsApi.getTotalLeads(orgId, { month: overviewMonth }),
        enabled: !!orgId,
    });

    const { data: totalCalls, isLoading: isLoadingCalls } = useQuery({
        queryKey: ["totalCalls", orgId, overviewMonth],
        queryFn: () =>
            analyticsApi.getTotalCalls(orgId, { month: overviewMonth }),
        enabled: !!orgId,
    });

    const { data: totalChats, isLoading: isLoadingChats } = useQuery({
        queryKey: ["totalChats", orgId, overviewMonth],
        queryFn: () =>
            analyticsApi.getTotalChats(orgId, { month: overviewMonth }),
        enabled: !!orgId,
    });

    const { data: callActivity, isLoading: isLoadingCallActivity } = useQuery({
        queryKey: ["callActivity", orgId, callActivityMonth],
        queryFn: () =>
            analyticsApi.getCallActivity(orgId, { month: callActivityMonth }),
        enabled: !!orgId,
    });

    const { data: chatActivity, isLoading: isLoadingChatActivity } = useQuery({
        queryKey: ["chatActivity", orgId, chatActivityMonth],
        queryFn: () =>
            analyticsApi.getChatActivity(orgId, { month: chatActivityMonth }),
        enabled: !!orgId,
    });

    const { data: pickupRate, isLoading: isLoadingPickupRate } = useQuery({
        queryKey: ["pickupRate", orgId, pickupRateMonth],
        queryFn: () =>
            analyticsApi.getCallPickupRate(orgId, { month: pickupRateMonth }),
        enabled: !!orgId,
    });

    const { data: avgDuration, isLoading: isLoadingAvgDuration } = useQuery({
        queryKey: ["avgDuration", orgId, avgDurationMonth],
        queryFn: () =>
            analyticsApi.getAvgCallDuration(orgId, {
                month: avgDurationMonth,
            }),
        enabled: !!orgId,
    });

    const isLoading =
        isLoadingLeads ||
        isLoadingCalls ||
        isLoadingChats ||
        isLoadingCallActivity ||
        isLoadingChatActivity ||
        isLoadingPickupRate ||
        isLoadingAvgDuration;

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
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        Dashboard
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        Analytics and insights for your organization
                    </p>
                </div>

                {/* Stats Cards */}
                {totalLeads?.data && totalCalls?.data && totalChats?.data && (
                    <StatCards
                        totalLeads={totalLeads.data.totalLeads}
                        totalCalls={totalCalls.data.totalCalls}
                        totalChats={totalChats.data.totalChats}
                        selectedMonth={overviewMonth}
                        onMonthChange={handleOverviewMonthChange}
                    />
                )}

                {/* Charts Grid */}
                {callActivity?.data &&
                    chatActivity?.data &&
                    pickupRate?.data &&
                    avgDuration?.data && (
                        <div className="grid gap-6 lg:grid-cols-2">
                            <CallActivityChart
                                data={callActivity.data}
                                selectedMonth={callActivityMonth}
                                onMonthChange={handleCallActivityMonthChange}
                            />
                            <ChatActivityChart
                                data={chatActivity.data}
                                selectedMonth={chatActivityMonth}
                                onMonthChange={handleChatActivityMonthChange}
                            />
                            <PickupRateChart
                                data={pickupRate.data}
                                selectedMonth={pickupRateMonth}
                                onMonthChange={handlePickupRateMonthChange}
                            />
                            <AvgDurationChart
                                data={avgDuration.data}
                                selectedMonth={avgDurationMonth}
                                onMonthChange={handleAvgDurationMonthChange}
                            />
                        </div>
                    )}
            </div>
        </DashboardLayout>
    );
}
