import { create } from "zustand";
import api from "../api/axios";

const useAdminStore = create((set) => ({
  stats: null,
  users: [],
  admins: [],
  announcements: [],
  contacts: [],
  currentContact: null,
  pagination: null,
  isLoading: false,

  fetchDashboard: async () => {
    set({ isLoading: true });
    try {
      const response = await api.get("/admin/dashboard");
      set({ stats: response.data.data, isLoading: false });
      return response.data.data;
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  fetchUsers: async (params = {}) => {
    set({ isLoading: true });
    try {
      const response = await api.get("/admin/users", { params });
      set({
        users: response.data.data.users,
        pagination: response.data.data.pagination,
        isLoading: false,
      });
      return response.data.data;
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  updateUser: async (id, data) => {
    const response = await api.patch(`/admin/users/${id}`, data);
    set((state) => ({
      users: state.users.map((u) =>
        u._id === id ? response.data.data.user : u,
      ),
    }));
    return response.data.data.user;
  },

  deleteUser: async (id) => {
    await api.delete(`/admin/users/${id}`);
    set((state) => ({ users: state.users.filter((u) => u._id !== id) }));
  },

  fetchAdmins: async () => {
    set({ isLoading: true });
    try {
      const response = await api.get("/admin/admins");
      set({ admins: response.data.data.admins, isLoading: false });
      return response.data.data.admins;
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  createAdmin: async (data) => {
    const response = await api.post("/admin/admins", data);
    set((state) => ({ admins: [...state.admins, response.data.data.user] }));
    return response.data.data.user;
  },

  inviteAdmin: async (data) => {
    const response = await api.post("/admin/admins/invite", data);
    return response.data;
  },

  updateAdminPermissions: async (id, permissions) => {
    const response = await api.patch(`/admin/admins/${id}/permissions`, {
      permissions,
    });
    set((state) => ({
      admins: state.admins.map((a) =>
        a._id === id ? response.data.data.admin : a,
      ),
    }));
    return response.data.data.admin;
  },

  removeAdmin: async (id) => {
    await api.delete(`/admin/admins/${id}`);
    set((state) => ({ admins: state.admins.filter((a) => a._id !== id) }));
  },

  fetchAnnouncements: async (params = {}) => {
    set({ isLoading: true });
    try {
      const response = await api.get("/admin/announcements", { params });
      set({
        announcements: response.data.data.announcements,
        pagination: response.data.data.pagination,
        isLoading: false,
      });
      return response.data.data;
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  createAnnouncement: async (data) => {
    const response = await api.post("/admin/announcements", data);
    set((state) => ({
      announcements: [response.data.data.announcement, ...state.announcements],
    }));
    return response.data.data.announcement;
  },

  updateAnnouncement: async (id, data) => {
    const response = await api.patch(`/admin/announcements/${id}`, data);
    set((state) => ({
      announcements: state.announcements.map((a) =>
        a._id === id ? response.data.data.announcement : a,
      ),
    }));
    return response.data.data.announcement;
  },

  deleteAnnouncement: async (id) => {
    await api.delete(`/admin/announcements/${id}`);
    set((state) => ({
      announcements: state.announcements.filter((a) => a._id !== id),
    }));
  },

  fetchContacts: async (params = {}) => {
    set({ isLoading: true });
    try {
      const response = await api.get("/admin/contacts", { params });
      set({
        contacts: response.data.data.contacts,
        pagination: response.data.data.pagination,
        isLoading: false,
      });
      return response.data.data;
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  fetchContact: async (id) => {
    const response = await api.get(`/admin/contacts/${id}`);
    set({ currentContact: response.data.data.contact });
    return response.data.data.contact;
  },

  updateContactStatus: async (id, status) => {
    const response = await api.patch(`/admin/contacts/${id}/status`, {
      status,
    });
    set((state) => ({
      contacts: state.contacts.map((c) =>
        c._id === id ? response.data.data.contact : c,
      ),
      currentContact:
        state.currentContact?._id === id
          ? response.data.data.contact
          : state.currentContact,
    }));
    return response.data.data.contact;
  },

  assignContact: async (id, adminId) => {
    const response = await api.patch(`/admin/contacts/${id}/assign`, {
      adminId,
    });
    set((state) => ({
      contacts: state.contacts.map((c) =>
        c._id === id ? response.data.data.contact : c,
      ),
      currentContact:
        state.currentContact?._id === id
          ? response.data.data.contact
          : state.currentContact,
    }));
    return response.data.data.contact;
  },

  replyToContact: async (id, message) => {
    const response = await api.post(`/admin/contacts/${id}/reply`, { message });
    set((state) => ({
      contacts: state.contacts.map((c) =>
        c._id === id ? response.data.data.contact : c,
      ),
      currentContact:
        state.currentContact?._id === id
          ? response.data.data.contact
          : state.currentContact,
    }));
    return response.data.data.contact;
  },
}));

export default useAdminStore;
