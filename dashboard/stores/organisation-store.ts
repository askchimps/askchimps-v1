import { create } from "zustand";
import type { Organisation } from "@/types/organisation";

interface OrganisationState {
  organisations: Organisation[];
  setOrganisations: (organisations: Organisation[]) => void;
  getOrganisationById: (id: string) => Organisation | undefined;
  clear: () => void;
}

export const useOrganisationStore = create<OrganisationState>()((set, get) => ({
  organisations: [],

  setOrganisations: (organisations) => set({ organisations }),

  getOrganisationById: (id) => {
    return get().organisations.find((org) => org.id === id);
  },

  clear: () =>
    set({
      organisations: [],
    }),
}));

