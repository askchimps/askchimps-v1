"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/auth-store";
import { useUIStore } from "@/stores/ui-store";
import {
  Menu,
  LogOut,
  User,
  Bell,
} from "lucide-react";
import {
  Card,
} from "@/components/ui/card";

export function Header() {
  const router = useRouter();
  const { user, clearAuth } = useAuthStore();
  const { toggleSidebar } = useUIStore();

  const handleLogout = () => {
    clearAuth();
    router.push("/auth");
  };

  return (
    <header className="sticky top-0 z-30 h-16 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
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
          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-destructive" />
          </Button>

          {/* User menu */}
          <div className="flex items-center gap-3 pl-3 border-l">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium">
                {user?.firstName || user?.email.split("@")[0]}
              </p>
              <p className="text-xs text-muted-foreground">
                {user?.isSuperAdmin ? "Super Admin" : "User"}
              </p>
            </div>
            <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-5 w-5 text-primary" />
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              title="Logout"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}

