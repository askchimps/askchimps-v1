"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { useOrganisationStore } from "@/stores/organisation-store";
import { organisationApi } from "@/lib/api/organisation";

export default function Home() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const hydrated = useAuthStore((state) => state.hydrated);
  const { selectedOrganisation, setOrganisations, setSelectedOrganisation } = useOrganisationStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const redirect = async () => {
      if (mounted && hydrated) {
        if (isAuthenticated) {
          // If we have a selected org, redirect to it
          if (selectedOrganisation) {
            router.push(`/org/${selectedOrganisation.id}/dashboard`);
          } else {
            // Fetch organisations and redirect to first one
            try {
              const orgsResponse = await organisationApi.getAll();
              if (orgsResponse.data.length > 0) {
                setOrganisations(orgsResponse.data);
                setSelectedOrganisation(orgsResponse.data[0]);
                router.push(`/org/${orgsResponse.data[0].id}/dashboard`);
              } else {
                // No organisations available
                router.push("/dashboard");
              }
            } catch (error) {
              console.error("Failed to fetch organisations:", error);
              router.push("/dashboard");
            }
          }
        } else {
          router.push("/auth");
        }
      }
    };

    redirect();
  }, [mounted, hydrated, isAuthenticated, selectedOrganisation, router, setOrganisations, setSelectedOrganisation]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="animate-pulse text-muted-foreground">Loading...</div>
    </div>
  );
}
