import { create } from "zustand";
import api from "../api/axios";

const useNoteStore = create((set, get) => ({
  institutions: [],
  semesters: [],
  subjects: [],
  notes: [],
  currentNote: null,
  comments: [],
  commentsPagination: null,
  pagination: null,
  isLoading: false,
  error: null,

  fetchInstitutions: async () => {
    set({ isLoading: true });
    try {
      const response = await api.get("/institutions");
      set({ institutions: response.data.data.institutions, isLoading: false });
      return response.data.data.institutions;
    } catch (error) {
      set({ isLoading: false, error: error.response?.data?.message });
      throw error;
    }
  },

  createInstitution: async (data) => {
    const response = await api.post("/institutions", data);
    set((state) => ({
      institutions: [...state.institutions, response.data.data.institution],
    }));
    return response.data.data.institution;
  },

  updateInstitution: async (id, data) => {
    const response = await api.patch(`/institutions/${id}`, data);
    set((state) => ({
      institutions: state.institutions.map((i) =>
        i._id === id ? response.data.data.institution : i,
      ),
    }));
    return response.data.data.institution;
  },

  deleteInstitution: async (id) => {
    await api.delete(`/institutions/${id}`);
    set((state) => ({
      institutions: state.institutions.filter((i) => i._id !== id),
    }));
  },

  fetchSemesters: async (institutionId) => {
    set({ isLoading: true });
    try {
      const params = institutionId ? { institutionId } : {};
      const response = await api.get("/semesters", { params });
      set({ semesters: response.data.data.semesters, isLoading: false });
      return response.data.data.semesters;
    } catch (error) {
      set({ isLoading: false, error: error.response?.data?.message });
      throw error;
    }
  },

  createSemester: async (data) => {
    const response = await api.post("/semesters", data);
    set((state) => ({
      semesters: [...state.semesters, response.data.data.semester],
    }));
    return response.data.data.semester;
  },

  updateSemester: async (id, data) => {
    const response = await api.patch(`/semesters/${id}`, data);
    set((state) => ({
      semesters: state.semesters.map((s) =>
        s._id === id ? response.data.data.semester : s,
      ),
    }));
    return response.data.data.semester;
  },

  deleteSemester: async (id) => {
    await api.delete(`/semesters/${id}`);
    set((state) => ({
      semesters: state.semesters.filter((s) => s._id !== id),
    }));
  },

  fetchSubjects: async (semesterId) => {
    set({ isLoading: true });
    try {
      const params = semesterId ? { semesterId } : {};
      const response = await api.get("/subjects", { params });
      set({ subjects: response.data.data.subjects, isLoading: false });
      return response.data.data.subjects;
    } catch (error) {
      set({ isLoading: false, error: error.response?.data?.message });
      throw error;
    }
  },

  createSubject: async (data) => {
    const response = await api.post("/subjects", data);
    set((state) => ({
      subjects: [...state.subjects, response.data.data.subject],
    }));
    return response.data.data.subject;
  },

  updateSubject: async (id, data) => {
    const response = await api.patch(`/subjects/${id}`, data);
    set((state) => ({
      subjects: state.subjects.map((s) =>
        s._id === id ? response.data.data.subject : s,
      ),
    }));
    return response.data.data.subject;
  },

  deleteSubject: async (id) => {
    await api.delete(`/subjects/${id}`);
    set((state) => ({
      subjects: state.subjects.filter((s) => s._id !== id),
    }));
  },

  fetchNotes: async (params = {}) => {
    set({ isLoading: true });
    try {
      const response = await api.get("/notes", { params });
      set({
        notes: response.data.data.notes,
        pagination: response.data.data.pagination,
        isLoading: false,
      });
      return response.data.data;
    } catch (error) {
      set({ isLoading: false, error: error.response?.data?.message });
      throw error;
    }
  },

  fetchNote: async (id) => {
    set({ isLoading: true });
    try {
      const response = await api.get(`/notes/${id}`);
      set({ currentNote: response.data.data.note, isLoading: false });
      return response.data.data.note;
    } catch (error) {
      set({ isLoading: false, error: error.response?.data?.message });
      throw error;
    }
  },

  createNote: async (data) => {
    const response = await api.post("/notes", data);
    set((state) => ({
      notes: [response.data.data.note, ...state.notes],
    }));
    return response.data.data.note;
  },

  updateNote: async (id, data) => {
    const response = await api.patch(`/notes/${id}`, data);
    set((state) => ({
      notes: state.notes.map((n) =>
        n._id === id ? { ...n, ...response.data.data.note } : n,
      ),
      currentNote:
        state.currentNote?._id === id
          ? { ...state.currentNote, ...response.data.data.note }
          : state.currentNote,
    }));
    return response.data.data.note;
  },

  deleteNote: async (id) => {
    await api.delete(`/notes/${id}`);
    set((state) => ({
      notes: state.notes.filter((n) => n._id !== id),
      currentNote: state.currentNote?._id === id ? null : state.currentNote,
    }));
  },

  shareNote: async (id, email, permission) => {
    const response = await api.post(`/notes/${id}/share`, {
      email,
      permission,
    });
    set({ currentNote: response.data.data.note });
    return response.data.data.note;
  },

  removeCollaborator: async (noteId, collaboratorId) => {
    const response = await api.delete(
      `/notes/${noteId}/collaborator/${collaboratorId}`,
    );
    set({ currentNote: response.data.data.note });
    return response.data.data.note;
  },

  uploadAttachment: async (noteId, file, type) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", type);
    const response = await api.post(`/notes/${noteId}/attachment`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data.data.attachment;
  },

  deleteAttachment: async (noteId, attachmentId) => {
    await api.delete(`/notes/${noteId}/attachment/${attachmentId}`);
  },

  summarizeNote: async (id, options = {}) => {
    const response = await api.post(`/notes/${id}/summarize`, options);
    return response.data.data;
  },

  generateQuiz: async (id, options) => {
    const response = await api.post(`/notes/${id}/quiz`, options);
    return response.data.data.quiz;
  },

  submitQuizAttempt: async (id, answers) => {
    const response = await api.post(`/notes/${id}/quiz/submit`, { answers });
    return response.data.data;
  },

  fetchComments: async (noteId, params = {}) => {
    const response = await api.get(`/comments/note/${noteId}`, { params });
    set({
      comments: response.data.data.comments,
      commentsPagination: response.data.data.pagination,
    });
    return response.data.data;
  },

  createComment: async ({
    noteId,
    content,
    parentCommentId,
    audioBlob,
    recordingDuration,
  }) => {
    const formData = new FormData();
    formData.append("noteId", noteId);
    if (typeof content === "string") {
      formData.append("content", content);
    }
    if (parentCommentId) {
      formData.append("parentCommentId", parentCommentId);
    }
    if (audioBlob) {
      const extension = audioBlob.type.includes("mp4") ? "mp4" : "webm";
      formData.append("audio", audioBlob, `voice-comment.${extension}`);
      if (typeof recordingDuration === "number") {
        formData.append("recordingDuration", recordingDuration.toString());
      }
    }

    const response = await api.post("/comments", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    set((state) => ({
      comments: [response.data.data.comment, ...state.comments],
    }));

    return response.data.data.comment;
  },

  deleteComment: async (commentId) => {
    await api.delete(`/comments/${commentId}`);
    set((state) => ({
      comments: state.comments
        .filter((comment) => comment._id !== commentId)
        .map((comment) => ({
          ...comment,
          replies: Array.isArray(comment.replies)
            ? comment.replies.filter((reply) => reply._id !== commentId)
            : [],
        })),
    }));
  },

  extractText: async (imageUrl) => {
    const response = await api.post("/notes/extract-text", { imageUrl });
    return response.data.data.extractedText;
  },

  setCurrentNote: (note) => set({ currentNote: note }),
  clearCurrentNote: () => set({ currentNote: null }),
  clearComments: () => set({ comments: [], commentsPagination: null }),
  clearError: () => set({ error: null }),
}));

export default useNoteStore;
