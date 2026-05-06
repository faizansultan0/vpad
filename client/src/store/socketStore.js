import { create } from "zustand";

const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL ||
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";

const useSocketStore = create((set, get) => ({
  socket: null,
  isConnected: false,
  activeUsers: [],
  typingUsers: [],

  connect: async (token) => {
    const { socket } = get();
    if (socket?.connected) return;

    const { io } = await import("socket.io-client");
    const newSocket = io(SOCKET_URL, {
      auth: { token },
      transports: ["polling", "websocket"],
    });

    newSocket.on("connect", () => {
      set({ isConnected: true });
      console.log("Socket connected");
    });

    newSocket.on("disconnect", () => {
      set({ isConnected: false, activeUsers: [], typingUsers: [] });
      console.log("Socket disconnected");
    });

    newSocket.on("userJoined", (data) => {
      set((state) => ({
        activeUsers: [
          ...state.activeUsers.filter((u) => u._id !== data.user._id),
          data.user,
        ],
      }));
    });

    newSocket.on("userLeft", (data) => {
      set((state) => ({
        activeUsers: state.activeUsers.filter((u) => u._id !== data.userId),
        typingUsers: state.typingUsers.filter((u) => u._id !== data.userId),
      }));
    });

    newSocket.on("userTyping", (data) => {
      set((state) => {
        if (data.isTyping) {
          return {
            typingUsers: [
              ...state.typingUsers.filter((u) => u._id !== data.user._id),
              data.user,
            ],
          };
        }
        return {
          typingUsers: state.typingUsers.filter((u) => u._id !== data.user._id),
        };
      });
    });

    set({ socket: newSocket });
  },

  disconnect: () => {
    const { socket } = get();
    if (socket) {
      socket.disconnect();
      set({
        socket: null,
        isConnected: false,
        activeUsers: [],
        typingUsers: [],
      });
    }
  },

  joinNote: (noteId) => {
    const { socket } = get();
    if (socket?.connected) {
      socket.emit("joinNote", noteId);
    }
  },

  leaveNote: (noteId) => {
    const { socket } = get();
    if (socket?.connected) {
      socket.emit("leaveNote", noteId);
      set({ activeUsers: [], typingUsers: [] });
    }
  },

  emitNoteChange: (noteId, changes, cursorPosition) => {
    const { socket } = get();
    if (socket?.connected) {
      socket.emit("noteChange", { noteId, changes, cursorPosition });
    }
  },

  emitCursorMove: (noteId, position) => {
    const { socket } = get();
    if (socket?.connected) {
      socket.emit("cursorMove", { noteId, position });
    }
  },

  emitTyping: (noteId, isTyping) => {
    const { socket } = get();
    if (socket?.connected) {
      socket.emit("typing", { noteId, isTyping });
    }
  },

  emitSelection: (noteId, selection) => {
    const { socket } = get();
    if (socket?.connected) {
      socket.emit("selection", { noteId, selection });
    }
  },

  on: (event, callback) => {
    const { socket } = get();
    if (socket) {
      socket.on(event, callback);
    }
  },

  off: (event, callback) => {
    const { socket } = get();
    if (socket) {
      socket.off(event, callback);
    }
  },
}));

export default useSocketStore;
