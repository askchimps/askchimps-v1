"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    Users,
    Bot,
    Phone,
    MessageSquare,
    Building2,
    Settings,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUIStore } from "@/stores/ui-store";
import { useOrganisationStore } from "@/stores/organisation-store";

const navigation = [
    { name: "Dashboard", href: "dashboard", icon: LayoutDashboard },
    { name: "Agents", href: "agents", icon: Bot },
    { name: "Leads", href: "leads", icon: Users },
    { name: "Calls", href: "calls", icon: Phone },
    { name: "Chats", href: "chats", icon: MessageSquare },
    { name: "Settings", href: "settings", icon: Settings },
];

export function Sidebar() {
    const pathname = usePathname();
    const {
        sidebarOpen,
        toggleSidebar,
        sidebarCollapsed,
        toggleSidebarCollapse,
    } = useUIStore();
    const selectedOrganisation = useOrganisationStore(
        (state) => state.selectedOrganisation,
    );

    // Build href with org context - org/:orgId/page pattern
    const getHref = (page: string) => {
        if (selectedOrganisation) {
            return `/org/${selectedOrganisation.id}/${page}`;
        }
        // Fallback if no org selected yet
        return `/${page}`;
    };

    return (
        <>
            {/* Overlay for mobile */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 cursor-pointer bg-black/50 lg:hidden"
                    onClick={toggleSidebar}
                />
            )}

            {/* Sidebar */}
            <aside
                className={cn(
                    "bg-card fixed top-0 left-0 z-50 h-screen border-r transition-all duration-300 ease-in-out lg:translate-x-0",
                    sidebarOpen ? "translate-x-0" : "-translate-x-full",
                    sidebarCollapsed ? "w-16" : "w-64",
                )}
            >
                <div className="flex h-full flex-col">
                    {/* Logo */}
                    <div className="flex h-16 items-center justify-between border-b px-4">
                        {!sidebarCollapsed ? (
                            <>
                                <Link
                                    href={getHref("dashboard")}
                                    className="flex cursor-pointer items-center gap-2"
                                >
                                    <div className="bg-primary/10 flex h-8 w-8 items-center justify-center rounded-lg">
                                        <Bot className="text-primary h-5 w-5" />
                                    </div>
                                    <span className="text-lg font-bold">
                                        AskChimps
                                    </span>
                                </Link>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="lg:hidden"
                                    onClick={toggleSidebar}
                                >
                                    <ChevronLeft className="h-5 w-5" />
                                </Button>
                            </>
                        ) : (
                            <div className="flex w-full justify-center">
                                <div className="bg-primary/10 flex h-8 w-8 items-center justify-center rounded-lg">
                                    <Bot className="text-primary h-5 w-5" />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-6">
                        {navigation.map((item) => {
                            const href = getHref(item.href);
                            const isActive =
                                pathname === href ||
                                pathname.startsWith(href + "/");
                            return (
                                <Link
                                    key={item.name}
                                    href={href}
                                    className={cn(
                                        "flex cursor-pointer items-center gap-3 rounded-lg text-sm font-medium transition-colors",
                                        sidebarCollapsed
                                            ? "justify-center p-3"
                                            : "px-3 py-2.5",
                                        isActive
                                            ? "bg-primary text-primary-foreground"
                                            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                                    )}
                                    title={
                                        sidebarCollapsed ? item.name : undefined
                                    }
                                >
                                    <item.icon className="h-5 w-5 shrink-0" />
                                    {!sidebarCollapsed && (
                                        <span>{item.name}</span>
                                    )}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Collapse Toggle - Desktop only */}
                    <div className="hidden border-t p-3 lg:block">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={toggleSidebarCollapse}
                            className={cn(
                                "w-full",
                                sidebarCollapsed && "justify-center px-0",
                            )}
                        >
                            {sidebarCollapsed ? (
                                <ChevronRight className="h-4 w-4" />
                            ) : (
                                <>
                                    <ChevronLeft className="mr-2 h-4 w-4" />
                                    <span>Collapse</span>
                                </>
                            )}
                        </Button>
                    </div>

                    {/* Footer */}
                    {!sidebarCollapsed && (
                        <div className="border-t p-4">
                            <div className="text-muted-foreground text-center text-xs">
                                © 2024 AskChimps
                            </div>
                        </div>
                    )}
                </div>
            </aside>
        </>
    );
}
