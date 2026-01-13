import { apiClient } from "./client";
import type { ApiResponse } from "@/types/auth";
import type { Organisation } from "@/types/organisation";

export const organisationApi = {
  getAll: async (): Promise<Organisation[]> => {
    const response =
      await apiClient.get<ApiResponse<Organisation[]>>("/organisation");
    return response.data.data;
  },

  getById: async (id: string): Promise<Organisation> => {
    const response = await apiClient.get<ApiResponse<Organisation>>(
      `/organisation/${id}`
    );
    return response.data.data;
  },
};

