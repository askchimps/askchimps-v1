"use client";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { useAuthStore } from "@/stores/auth-store";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Users,
    Bot,
    Phone,
    TrendingUp,
    ArrowUpRight,
    ArrowDownRight,
    Activity,
} from "lucide-react";

export default function DashboardPage() {
    const { user } = useAuthStore();

    const stats = [
        {
            title: "Total Leads",
            value: "2,543",
            change: "+12.5%",
            trend: "up",
            icon: Users,
            color: "text-blue-600",
            bgColor: "bg-blue-50 dark:bg-blue-950",
        },
        {
            title: "Active Agents",
            value: "12",
            change: "+2",
            trend: "up",
            icon: Bot,
            color: "text-purple-600",
            bgColor: "bg-purple-50 dark:bg-purple-950",
        },
        {
            title: "Total Calls",
            value: "8,234",
            change: "+18.2%",
            trend: "up",
            icon: Phone,
            color: "text-green-600",
            bgColor: "bg-green-50 dark:bg-green-950",
        },
        {
            title: "Conversion Rate",
            value: "24.8%",
            change: "-2.4%",
            trend: "down",
            icon: TrendingUp,
            color: "text-orange-600",
            bgColor: "bg-orange-50 dark:bg-orange-950",
        },
    ];

    const recentActivity = [
        {
            action: "New lead created",
            details: "John Doe from WhatsApp",
            time: "2 minutes ago",
            icon: Users,
        },
        {
            action: "Call completed",
            details: "Marketing Agent - 15 min duration",
            time: "15 minutes ago",
            icon: Phone,
        },
        {
            action: "Agent activated",
            details: "Sales Agent v2.0",
            time: "1 hour ago",
            icon: Bot,
        },
        {
            action: "Lead converted",
            details: "Jane Smith - Premium Plan",
            time: "2 hours ago",
            icon: TrendingUp,
        },
    ];

    return (
        <DashboardLayout>
            <div className="space-y-8 p-6 lg:p-8">
                {/* Welcome Section */}
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        Welcome back,{" "}
                        {user?.firstName || user?.email.split("@")[0]}!
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        Here's what's happening with your AI agents today.
                    </p>
                </div>

                {/* Stats Grid */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {stats.map((stat) => (
                        <Card key={stat.title} className="overflow-hidden">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-muted-foreground text-sm font-medium">
                                    {stat.title}
                                </CardTitle>
                                <div
                                    className={`rounded-lg p-2 ${stat.bgColor}`}
                                >
                                    <stat.icon
                                        className={`h-4 w-4 ${stat.color}`}
                                    />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {stat.value}
                                </div>
                                <div className="mt-1 flex items-center gap-1">
                                    {stat.trend === "up" ? (
                                        <ArrowUpRight className="h-4 w-4 text-green-600" />
                                    ) : (
                                        <ArrowDownRight className="h-4 w-4 text-red-600" />
                                    )}
                                    <span
                                        className={`text-xs font-medium ${
                                            stat.trend === "up"
                                                ? "text-green-600"
                                                : "text-red-600"
                                        }`}
                                    >
                                        {stat.change}
                                    </span>
                                    <span className="text-muted-foreground ml-1 text-xs">
                                        from last month
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Content Grid */}
                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Recent Activity */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>Recent Activity</CardTitle>
                                    <CardDescription>
                                        Latest updates from your account
                                    </CardDescription>
                                </div>
                                <Activity className="text-muted-foreground h-5 w-5" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {recentActivity.map((activity, index) => (
                                    <div
                                        key={index}
                                        className="flex items-start gap-4 border-b pb-4 last:border-0 last:pb-0"
                                    >
                                        <div className="bg-muted rounded-lg p-2">
                                            <activity.icon className="text-muted-foreground h-4 w-4" />
                                        </div>
                                        <div className="flex-1 space-y-1">
                                            <p className="text-sm font-medium">
                                                {activity.action}
                                            </p>
                                            <p className="text-muted-foreground text-sm">
                                                {activity.details}
                                            </p>
                                            <p className="text-muted-foreground text-xs">
                                                {activity.time}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Quick Actions */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Quick Actions</CardTitle>
                            <CardDescription>
                                Common tasks and shortcuts
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-3">
                                <button className="hover:border-primary hover:bg-accent flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-4 transition-colors">
                                    <Users className="text-muted-foreground mb-2 h-6 w-6" />
                                    <span className="text-sm font-medium">
                                        Add Lead
                                    </span>
                                </button>
                                <button className="hover:border-primary hover:bg-accent flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-4 transition-colors">
                                    <Bot className="text-muted-foreground mb-2 h-6 w-6" />
                                    <span className="text-sm font-medium">
                                        Create Agent
                                    </span>
                                </button>
                                <button className="hover:border-primary hover:bg-accent flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-4 transition-colors">
                                    <Phone className="text-muted-foreground mb-2 h-6 w-6" />
                                    <span className="text-sm font-medium">
                                        Start Call
                                    </span>
                                </button>
                                <button className="hover:border-primary hover:bg-accent flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-4 transition-colors">
                                    <TrendingUp className="text-muted-foreground mb-2 h-6 w-6" />
                                    <span className="text-sm font-medium">
                                        View Reports
                                    </span>
                                </button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    );
}
