import { create } from "zustand";
import api from "../api/axios";

const useNotificationStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,
  pagination: null,
  isLoading: false,

  fetchNotifications: async (params = {}) => {
    set({ isLoading: true });
    try {
      const response = await api.get("/notifications", { params });
      set({
        notifications: response.data.data.notifications,
        pagination: response.data.data.pagination,
        isLoading: false,
      });
      return response.data.data;
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  fetchUnreadCount: async () => {
    try {
      const response = await api.get("/notifications/unread-count");
      set({ unreadCount: response.data.data.count });
      return response.data.data.count;
    } catch (error) {
      console.error("Failed to fetch unread count:", error);
    }
  },

  markAsRead: async (id) => {
    await api.patch(`/notifications/${id}/read`);
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n._id === id ? { ...n, isRead: true } : n
      ),
      unreadCount: Math.max(0, state.unreadCount - 1),
    }));
  },

  markAllAsRead: async () => {
    await api.patch("/notifications/read-all");
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
      unreadCount: 0,
    }));
  },

  deleteNotification: async (id) => {
    await api.delete(`/notifications/${id}`);
    set((state) => ({
      notifications: state.notifications.filter((n) => n._id !== id),
    }));
  },

  addNotification: (notification) => {
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    }));
  },

  clearNotifications: () => set({ notifications: [], unreadCount: 0 }),
}));

export default useNotificationStore;
