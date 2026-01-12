import { create } from "zustand";
import { persist } from "zustand/middleware";
import api from "../api/axios";

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const response = await api.post("/auth/login", { email, password });
          const { user, accessToken, refreshToken } = response.data.data;
          if (!["admin", "superadmin"].includes(user.role)) {
            throw new Error("Access denied. Admin privileges required.");
          }
          set({
            user,
            accessToken,
            refreshToken,
            isAuthenticated: true,
            isLoading: false,
          });
          return response.data;
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: async () => {
        try {
          const { refreshToken } = get();
          await api.post("/auth/logout", { refreshToken });
        } catch (error) {
          console.error("Logout error:", error);
        } finally {
          set({
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
          });
        }
      },

      getMe: async () => {
        try {
          const response = await api.get("/auth/me");
          set({ user: response.data.data.user });
        } catch (error) {
          console.error("Failed to get user:", error);
        }
      },
    }),
    {
      name: "vpad-admin-auth",
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export default useAuthStore;
