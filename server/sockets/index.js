const jwt = require("jsonwebtoken");
const { User } = require("../models");

const initializeSocket = (io) => {
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;

      if (!token) {
        return next(new Error("Authentication required"));
      }

      const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
      const user = await User.findById(decoded.userId).select("-password");

      if (!user || !user.isActive) {
        return next(new Error("User not found or inactive"));
      }

      socket.user = user;
      next();
    } catch (error) {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.user.name} (${socket.user._id})`);

    socket.join(`user:${socket.user._id}`);

    socket.on("joinNote", (noteId) => {
      socket.join(`note:${noteId}`);
      socket.to(`note:${noteId}`).emit("userJoined", {
        noteId,
        user: {
          _id: socket.user._id,
          name: socket.user.name,
          profilePicture: socket.user.profilePicture,
        },
      });
      console.log(`${socket.user.name} joined note: ${noteId}`);
    });

    socket.on("leaveNote", (noteId) => {
      socket.leave(`note:${noteId}`);
      socket.to(`note:${noteId}`).emit("userLeft", {
        noteId,
        userId: socket.user._id,
      });
      console.log(`${socket.user.name} left note: ${noteId}`);
    });

    socket.on("noteChange", (data) => {
      const { noteId, changes, cursorPosition } = data;
      socket.to(`note:${noteId}`).emit("noteChange", {
        noteId,
        changes,
        cursorPosition,
        user: {
          _id: socket.user._id,
          name: socket.user.name,
          profilePicture: socket.user.profilePicture,
        },
      });
    });

    socket.on("cursorMove", (data) => {
      const { noteId, position } = data;
      socket.to(`note:${noteId}`).emit("cursorMove", {
        noteId,
        position,
        user: {
          _id: socket.user._id,
          name: socket.user.name,
          profilePicture: socket.user.profilePicture,
        },
      });
    });

    socket.on("typing", (data) => {
      const { noteId, isTyping } = data;
      socket.to(`note:${noteId}`).emit("userTyping", {
        noteId,
        isTyping,
        user: {
          _id: socket.user._id,
          name: socket.user.name,
        },
      });
    });

    socket.on("selection", (data) => {
      const { noteId, selection } = data;
      socket.to(`note:${noteId}`).emit("userSelection", {
        noteId,
        selection,
        user: {
          _id: socket.user._id,
          name: socket.user.name,
          profilePicture: socket.user.profilePicture,
        },
      });
    });

    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.user.name}`);
      socket.rooms.forEach((room) => {
        if (room.startsWith("note:")) {
          socket.to(room).emit("userLeft", {
            noteId: room.replace("note:", ""),
            userId: socket.user._id,
          });
        }
      });
    });

    socket.on("error", (error) => {
      console.error("Socket error:", error);
    });
  });

  return io;
};

module.exports = { initializeSocket };
