require("dotenv").config();
const http = require("http");
const { Server } = require("socket.io");
const app = require("./app");
const connectDB = require("./config/db");
const { initializeSocket } = require("./sockets");
const { aiService } = require("./services");
const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: [
      process.env.CLIENT_URL || "http://localhost:3000",
      process.env.ADMIN_URL || "http://localhost:3001",
      "http://localhost:3002",
    ],
    methods: ["GET", "POST"],
    credentials: true,
  },
  pingTimeout: 60000,
  pingInterval: 25000,
});

app.set("io", io);

initializeSocket(io);

aiService.initializeAI();

const startServer = async () => {
  try {
    await connectDB();

    server.listen(PORT, () => {
      console.log(`
╔═══════════════════════════════════════════════════╗
║                                                   ║
║   📚 VPad Server Running                          ║
║                                                   ║
║   Environment: ${
        process.env.NODE_ENV || "development"
      }                       ║
║   Port: ${PORT}                                      ║
║   API: http://localhost:${PORT}/api/v1               ║
║                                                   ║
╚═══════════════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection:", err);
  server.close(() => {
    process.exit(1);
  });
});

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
  process.exit(1);
});

process.on("SIGTERM", () => {
  console.log("SIGTERM received. Shutting down gracefully...");
  server.close(() => {
    console.log("Server closed");
    process.exit(0);
  });
});

startServer();
