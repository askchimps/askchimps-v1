"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Bot,
  Phone,
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
  { name: "Settings", href: "settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen, toggleSidebar, sidebarCollapsed, toggleSidebarCollapse } = useUIStore();
  const selectedOrganisation = useOrganisationStore((state) => state.selectedOrganisation);

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
          className="fixed inset-0 bg-black/50 z-40 lg:hidden cursor-pointer"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-screen bg-card border-r transition-all duration-300 ease-in-out lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
          sidebarCollapsed ? "w-16" : "w-64"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-4 border-b">
            {!sidebarCollapsed ? (
              <>
                <Link href={getHref("dashboard")} className="flex items-center gap-2 cursor-pointer">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Bot className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-lg font-bold">AskChimps</span>
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
              <div className="w-full flex justify-center">
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Bot className="h-5 w-5 text-primary" />
                </div>
              </div>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const href = getHref(item.href);
              const isActive = pathname === href || pathname.startsWith(href + "/");
              return (
                <Link
                  key={item.name}
                  href={href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg text-sm font-medium transition-colors cursor-pointer",
                    sidebarCollapsed ? "justify-center p-3" : "px-3 py-2.5",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                  title={sidebarCollapsed ? item.name : undefined}
                >
                  <item.icon className="h-5 w-5 shrink-0" />
                  {!sidebarCollapsed && <span>{item.name}</span>}
                </Link>
              );
            })}
          </nav>

          {/* Collapse Toggle - Desktop only */}
          <div className="hidden lg:block p-3 border-t">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleSidebarCollapse}
              className={cn("w-full", sidebarCollapsed && "justify-center px-0")}
            >
              {sidebarCollapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <>
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  <span>Collapse</span>
                </>
              )}
            </Button>
          </div>

          {/* Footer */}
          {!sidebarCollapsed && (
            <div className="p-4 border-t">
              <div className="text-xs text-muted-foreground text-center">
                © 2024 AskChimps
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}

