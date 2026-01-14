import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { Organisation } from "@/lib/api/organisation";

interface OrganisationState {
  organisations: Organisation[];
  selectedOrganisation: Organisation | null;
  isLoading: boolean;
  error: string | null;
  setOrganisations: (organisations: Organisation[]) => void;
  setSelectedOrganisation: (organisation: Organisation) => void;
  clearOrganisations: () => void;
  hydrated: boolean;
  setHydrated: () => void;
}

export const useOrganisationStore = create<OrganisationState>()(
  persist(
    (set) => ({
      organisations: [],
      selectedOrganisation: null,
      isLoading: false,
      error: null,
      hydrated: false,
      setOrganisations: (organisations) => {
        const currentSelected = useOrganisationStore.getState().selectedOrganisation;
        set({
          organisations,
          // Auto-select first org if none selected or if current selected is not in the list
          selectedOrganisation: currentSelected && organisations.find(o => o.id === currentSelected.id)
            ? currentSelected
            : organisations.length > 0 ? organisations[0] : null
        });
      },
      setSelectedOrganisation: (organisation) =>
        set({ selectedOrganisation: organisation }),
      clearOrganisations: () =>
        set({ organisations: [], selectedOrganisation: null, error: null }),
      setHydrated: () => set({ hydrated: true }),
    }),
    {
      name: "organisation-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        organisations: state.organisations,
        selectedOrganisation: state.selectedOrganisation,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
    }
  )
);

