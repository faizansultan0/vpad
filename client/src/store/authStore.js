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
      error: null,

      setTokens: (accessToken, refreshToken) => {
        set({ accessToken, refreshToken, isAuthenticated: !!accessToken });
      },

      setUser: (user) => {
        set({ user, isAuthenticated: !!user });
      },

      register: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.post("/auth/register", data);
          set({ isLoading: false });
          return response.data;
        } catch (error) {
          set({
            isLoading: false,
            error: error.response?.data?.message || "Registration failed",
          });
          throw error;
        }
      },

      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.post("/auth/login", { email, password });
          const { user, accessToken, refreshToken } = response.data.data;
          set({
            user,
            accessToken,
            refreshToken,
            isAuthenticated: true,
            isLoading: false,
          });
          return response.data;
        } catch (error) {
          set({
            isLoading: false,
            error: error.response?.data?.message || "Login failed",
          });
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

      refreshAccessToken: async () => {
        try {
          const { refreshToken } = get();
          if (!refreshToken) throw new Error("No refresh token");

          const response = await api.post("/auth/refresh-token", {
            refreshToken,
          });
          const { accessToken, refreshToken: newRefreshToken } =
            response.data.data;
          set({ accessToken, refreshToken: newRefreshToken });
          return accessToken;
        } catch (error) {
          get().logout();
          throw error;
        }
      },

      getMe: async () => {
        set({ isLoading: true });
        try {
          const response = await api.get("/auth/me");
          set({ user: response.data.data.user, isLoading: false });
          return response.data.data.user;
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      updateProfile: async (data) => {
        set({ isLoading: true });
        try {
          const response = await api.patch("/auth/profile", data);
          set({ user: response.data.data.user, isLoading: false });
          return response.data;
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      updateProfilePicture: async (file) => {
        const formData = new FormData();
        formData.append("image", file);
        const response = await api.patch("/auth/profile-picture", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        set({ user: response.data.data.user });
        return response.data;
      },

      updatePassword: async (currentPassword, newPassword) => {
        const response = await api.patch("/auth/password", {
          currentPassword,
          newPassword,
        });
        const { accessToken, refreshToken } = response.data.data;
        set({ accessToken, refreshToken });
        return response.data;
      },

      forgotPassword: async (email) => {
        const response = await api.post("/auth/forgot-password", { email });
        return response.data;
      },

      verifySignupOtp: async (email, otp) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.post("/auth/verify-signup-otp", {
            email,
            otp,
          });
          const { user, accessToken, refreshToken } = response.data.data;
          set({
            user,
            accessToken,
            refreshToken,
            isAuthenticated: true,
            isLoading: false,
          });
          return response.data;
        } catch (error) {
          set({
            isLoading: false,
            error:
              error.response?.data?.message || "Failed to verify signup code",
          });
          throw error;
        }
      },

      resendSignupOtp: async (email) => {
        const response = await api.post("/auth/resend-signup-otp", { email });
        return response.data;
      },

      resetPassword: async (token, password) => {
        const response = await api.post(`/auth/reset-password/${token}`, {
          password,
        });
        return response.data;
      },

      verifyEmail: async (token) => {
        const response = await api.get(`/auth/verify-email/${token}`);
        const { user, accessToken, refreshToken } = response.data.data;
        set({ user, accessToken, refreshToken, isAuthenticated: true });
        return response.data;
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: "vpad-auth",
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
