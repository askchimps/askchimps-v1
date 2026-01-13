"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useOrganisations } from "@/hooks/use-organisation";

export default function DashboardRedirect() {
  const router = useRouter();
  const { organisations, isLoading } = useOrganisations();

  useEffect(() => {
    if (!isLoading && organisations.length > 0) {
      router.replace(`/dashboard/org/${organisations[0].id}`);
    }
  }, [organisations, isLoading, router]);

  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <p className="text-muted-foreground">Loading...</p>
    </div>
  );
}

