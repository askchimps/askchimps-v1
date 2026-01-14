import { apiClient } from "./client";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  isActive: boolean;
  isSuperAdmin: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LoginResponse {
  data: {
    user: User;
    accessToken: string;
    refreshToken: string;
  };
  statusCode: number;
  timestamp: string;
}

export const authService = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/v1/auth/login`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      }
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: "Login failed",
      }));
      throw new Error(error.message || "Invalid email or password");
    }

    return response.json();
  },

  logout: async (): Promise<void> => {
    await apiClient.post("/v1/auth/logout");
  },

  getCurrentUser: async (): Promise<{ data: User }> => {
    return apiClient.get("/v1/auth/me");
  },
};

