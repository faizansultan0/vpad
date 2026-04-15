import { create } from "zustand";
import api from "../api/axios";

const escapeHtml = (value = "") =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");

const sanitizeFileName = (value = "note") => {
  const sanitized = value
    .replace(/[<>:\"/\\|?*\x00-\x1F]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 80);

  return sanitized || "note";
};

const buildNoteHtmlDocument = (note = {}) => {
  const title =
    typeof note.title === "string" && note.title.trim()
      ? note.title.trim()
      : "Untitled Note";
  const content = typeof note.content === "string" ? note.content : "";
  const isRtl = Boolean(note.isRtl) || note.language === "ur";
  const language = note.language === "ur" ? "ur" : "en";
  const updatedAt = note.updatedAt
    ? new Date(note.updatedAt).toLocaleString()
    : null;

  return `<!doctype html>
<html lang="${language}" dir="${isRtl ? "rtl" : "ltr"}">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(title)}</title>
    <style>
      :root {
        color-scheme: light;
      }

      body {
        margin: 0;
        padding: 28px;
        font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
        line-height: 1.6;
        color: #111827;
        background: #ffffff;
      }

      main {
        max-width: 960px;
        margin: 0 auto;
      }

      h1 {
        margin: 0;
        font-size: 1.65rem;
        line-height: 1.3;
      }

      .meta {
        margin-top: 6px;
        margin-bottom: 22px;
        font-size: 0.82rem;
        color: #6b7280;
      }

      img {
        max-width: 100%;
        height: auto;
      }

      pre {
        background: #f3f4f6;
        border-radius: 10px;
        padding: 12px;
        overflow-x: auto;
      }

      code {
        font-family: "Consolas", "Courier New", monospace;
      }

      blockquote {
        margin: 16px 0;
        padding: 8px 14px;
        border-left: 4px solid #d1d5db;
        color: #374151;
        background: #f9fafb;
      }

      table {
        width: 100%;
        border-collapse: collapse;
      }

      th,
      td {
        border: 1px solid #e5e7eb;
        padding: 8px;
      }
    </style>
  </head>
  <body>
    <main>
      <h1>${escapeHtml(title)}</h1>
      ${updatedAt ? `<p class="meta">Updated: ${escapeHtml(updatedAt)}</p>` : ""}
      <article>${content}</article>
    </main>
  </body>
</html>`;
};

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

  fetchNoteForDownload: async (id) => {
    const response = await api.get(`/notes/${id}`);
    return response.data.data.note;
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

  downloadNoteAsPdf: async (note) => {
    if (typeof window === "undefined" || typeof document === "undefined") {
      throw new Error("Download is only available in browser");
    }

    const title =
      typeof note?.title === "string" && note.title.trim()
        ? note.title.trim()
        : "Untitled Note";
    const htmlDocument = buildNoteHtmlDocument({ ...note, title });
    const container = document.createElement("div");
    container.innerHTML = htmlDocument;
    container.style.position = "fixed";
    container.style.left = "-100000px";
    container.style.top = "0";
    container.style.width = "794px";
    container.style.background = "#ffffff";

    document.body.appendChild(container);

    try {
      const html2pdfModule = await import("html2pdf.js");
      const html2pdf = html2pdfModule.default || html2pdfModule;
      const contentRoot = container.querySelector("main") || container;

      await html2pdf()
        .set({
          margin: 10,
          filename: `${sanitizeFileName(title)}.pdf`,
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true },
          jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
          pagebreak: { mode: ["css", "legacy"] },
        })
        .from(contentRoot)
        .save();
    } finally {
      if (container.parentNode) {
        container.parentNode.removeChild(container);
      }
    }
  },

  setCurrentNote: (note) => set({ currentNote: note }),
  clearCurrentNote: () => set({ currentNote: null }),
  clearComments: () => set({ comments: [], commentsPagination: null }),
  clearError: () => set({ error: null }),
}));

export default useNoteStore;
