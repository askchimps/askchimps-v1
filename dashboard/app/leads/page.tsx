"use client";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Users } from "lucide-react";

export default function LeadsPage() {
    return (
        <DashboardLayout>
            <div className="p-6 lg:p-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold tracking-tight">Leads</h1>
                    <p className="text-muted-foreground mt-2">
                        Track and manage your leads
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <div className="bg-primary/10 rounded-lg p-2">
                                <Users className="text-primary h-5 w-5" />
                            </div>
                            <div>
                                <CardTitle>Coming Soon</CardTitle>
                                <CardDescription>
                                    Lead management features will be available
                                    here
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground text-sm">
                            This feature is under development and will be
                            available soon.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}
