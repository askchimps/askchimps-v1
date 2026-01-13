"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Phone,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useOrganisations } from "@/hooks/use-organisation";

const navItems = [
  {
    title: "Overview",
    path: "",
    icon: LayoutDashboard,
  },
  {
    title: "Leads",
    path: "/leads",
    icon: Users,
  },
  {
    title: "Calls",
    path: "/calls",
    icon: Phone,
  },
  {
    title: "Chats",
    path: "/chats",
    icon: MessageSquare,
  },
];

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  const { orgId } = useOrganisations();

  const baseUrl = orgId ? `/dashboard/org/${orgId}` : "/dashboard";

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          "relative flex h-full flex-col border-r bg-background transition-all duration-300",
          isCollapsed ? "w-16" : "w-64"
        )}
      >
        <nav className="flex flex-1 flex-col gap-1 p-2">
          {navItems.map((item) => {
            const href = `${baseUrl}${item.path}`;
            const isActive =
              item.path === ""
                ? pathname === href
                : pathname.startsWith(href);

            return (
              <Tooltip key={item.path}>
                <TooltipTrigger asChild>
                  <Link href={href}>
                    <Button
                      variant={isActive ? "secondary" : "ghost"}
                      className={cn(
                        "w-full justify-start",
                        isCollapsed && "justify-center px-2"
                      )}
                    >
                      <item.icon className="h-5 w-5" />
                      {!isCollapsed && (
                        <span className="ml-2">{item.title}</span>
                      )}
                    </Button>
                  </Link>
                </TooltipTrigger>
                {isCollapsed && (
                  <TooltipContent side="right">{item.title}</TooltipContent>
                )}
              </Tooltip>
            );
          })}
        </nav>

        <div className="border-t p-2">
          <Button
            variant="ghost"
            size="icon"
            className="w-full"
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>
      </aside>
    </TooltipProvider>
  );
}

