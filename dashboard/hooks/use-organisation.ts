"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { organisationApi } from "@/lib/api/organisation";
import { useOrganisationStore } from "@/stores/organisation-store";

export function useOrganisations() {
  const router = useRouter();
  const pathname = usePathname();
  const { setOrganisations, organisations, getOrganisationById } =
    useOrganisationStore();

  // Extract orgId from path like /dashboard/org/[orgId]/...
  const pathParts = pathname.split("/");
  const orgIndex = pathParts.indexOf("org");
  const orgId = orgIndex !== -1 ? pathParts[orgIndex + 1] : null;

  const query = useQuery({
    queryKey: ["organisations"],
    queryFn: organisationApi.getAll,
  });

  useEffect(() => {
    if (query.data) {
      setOrganisations(query.data);
    }
  }, [query.data, setOrganisations]);

  const selectedOrganisation = orgId ? getOrganisationById(orgId) : null;

  const setSelectedOrganisation = (org: { id: string } | null) => {
    if (!org) return;

    // Replace the orgId in the current path
    const newPathParts = [...pathParts];
    if (orgIndex !== -1) {
      newPathParts[orgIndex + 1] = org.id;
      router.push(newPathParts.join("/"));
    } else {
      router.push(`/dashboard/org/${org.id}`);
    }
  };

  return {
    ...query,
    organisations,
    selectedOrganisation,
    orgId,
    setSelectedOrganisation,
  };
}

