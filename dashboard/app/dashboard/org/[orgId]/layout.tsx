"use client";

import { use, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useOrganisationStore } from "@/stores/organisation-store";

export default function OrgLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ orgId: string }>;
}) {
  const { orgId } = use(params);
  const router = useRouter();
  const { organisations, getOrganisationById } = useOrganisationStore();

  const organisation = getOrganisationById(orgId);

  useEffect(() => {
    // If organisations are loaded but orgId is invalid, redirect to first org
    if (organisations.length > 0 && !organisation) {
      router.replace(`/dashboard/org/${organisations[0].id}`);
    }
  }, [organisations, organisation, orgId, router]);

  return <>{children}</>;
}

