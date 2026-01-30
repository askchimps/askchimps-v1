"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/auth-store";
import { useUIStore } from "@/stores/ui-store";
import { useOrganisationStore } from "@/stores/organisation-store";
import { organisationApi } from "@/lib/api/organisation";
import {
    Menu,
    LogOut,
    User,
    Bell,
    Building2,
    ChevronDown,
    Check,
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Header() {
    const router = useRouter();
    const pathname = usePathname();
    const { user, clearAuth } = useAuthStore();
    const { toggleSidebar, sidebarCollapsed } = useUIStore();
    const {
        organisations,
        selectedOrganisation,
        setOrganisations,
        setSelectedOrganisation,
    } = useOrganisationStore();

    // Fetch organisations on mount
    useEffect(() => {
        const fetchOrganisations = async () => {
            try {
                const response = await organisationApi.getAll();
                setOrganisations(response.data);
            } catch (error) {
                console.error("Failed to fetch organisations:", error);
            }
        };

        fetchOrganisations();
    }, [setOrganisations]);

    const handleLogout = () => {
        clearAuth();
        router.push("/auth");
    };

    const handleOrganisationChange = (orgId: string) => {
        const org = organisations.find((o) => o.id === orgId);
        if (org) {
            setSelectedOrganisation(org);
            // Extract current page from URL (e.g., /org/123/dashboard -> dashboard)
            const pathParts = pathname.split("/");
            const currentPage = pathParts[3] || "dashboard"; // Get page after /org/:orgId/
            router.push(`/org/${orgId}/${currentPage}`);
        }
    };

    return (
        <header className="bg-background/95 supports-backdrop-filter:bg-background/60 sticky top-0 z-30 h-16 border-b backdrop-blur">
            <div className="flex h-full items-center justify-between px-6">
                {/* Left side */}
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="lg:hidden"
                        onClick={toggleSidebar}
                    >
                        <Menu className="h-5 w-5" />
                    </Button>
                </div>

                {/* Right side */}
                <div className="flex items-center gap-3">
                    {/* Organisation Switcher */}
                    {organisations.length > 0 && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="gap-2">
                                    <Building2 className="h-4 w-4" />
                                    <span className="hidden sm:inline">
                                        {selectedOrganisation?.name ||
                                            "Select Organisation"}
                                    </span>
                                    <ChevronDown className="h-4 w-4 opacity-50" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                                <DropdownMenuLabel>
                                    Switch Organisation
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                {organisations.map((org) => (
                                    <DropdownMenuItem
                                        key={org.id}
                                        onClick={() =>
                                            handleOrganisationChange(org.id)
                                        }
                                        className="cursor-pointer"
                                    >
                                        <div className="flex w-full items-center justify-between">
                                            <span>{org.name}</span>
                                            {selectedOrganisation?.id ===
                                                org.id && (
                                                <Check className="h-4 w-4" />
                                            )}
                                        </div>
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}

                    {/* Notifications */}
                    <Button variant="ghost" size="icon" className="relative">
                        <Bell className="h-5 w-5" />
                        <span className="bg-destructive absolute top-1.5 right-1.5 h-2 w-2 rounded-full" />
                    </Button>

                    {/* User menu */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                className="gap-2 border-l pl-3"
                            >
                                <div className="hidden text-right sm:block">
                                    <p className="text-sm font-medium">
                                        {user?.firstName ||
                                            user?.email.split("@")[0]}
                                    </p>
                                    <p className="text-muted-foreground text-xs">
                                        {user?.isSuperAdmin
                                            ? "Super Admin"
                                            : "User"}
                                    </p>
                                </div>
                                <div className="bg-primary/10 flex h-9 w-9 items-center justify-center rounded-full">
                                    <User className="text-primary h-5 w-5" />
                                </div>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuLabel>My Account</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={handleLogout}
                                className="text-destructive cursor-pointer"
                            >
                                <LogOut className="mr-2 h-4 w-4" />
                                <span>Logout</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    );
}
