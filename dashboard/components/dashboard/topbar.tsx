"use client";

import { ChevronDown, LogOut, User } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { useOrganisations } from "@/hooks/use-organisation";
import { useLogout } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Topbar() {
  const user = useAuthStore((state) => state.user);
  const { organisations, selectedOrganisation, setSelectedOrganisation } =
    useOrganisations();
  const logout = useLogout();

  const userInitials = user
    ? `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase() ||
      user.email[0].toUpperCase()
    : "?";

  return (
    <header className="flex h-14 items-center justify-between border-b bg-background px-4">
      {/* Logo */}
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-bold">AskChimps</h1>
      </div>

      <div className="flex items-center gap-4">
        {/* Organisation Selector */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2">
              {selectedOrganisation?.name || "Select Organisation"}
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Organisations</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {organisations.map((org) => (
              <DropdownMenuItem
                key={org.id}
                onClick={() => setSelectedOrganisation(org)}
                className={
                  selectedOrganisation?.id === org.id ? "bg-accent" : ""
                }
              >
                {org.name}
              </DropdownMenuItem>
            ))}
            {organisations.length === 0 && (
              <DropdownMenuItem disabled>No organisations</DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-9 w-9 rounded-full">
              <Avatar className="h-9 w-9">
                <AvatarFallback>{userInitials}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem disabled>
              <User className="mr-2 h-4 w-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => logout.mutate()}
              disabled={logout.isPending}
              className="text-destructive focus:text-destructive"
            >
              <LogOut className="mr-2 h-4 w-4" />
              {logout.isPending ? "Logging out..." : "Logout"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

