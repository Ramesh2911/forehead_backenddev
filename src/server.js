import http from "http";
import app from "./app.js";
import { Server } from "socket.io";

const PORT = process.env.PORT || 8000;

// HTTP server
const server = http.createServer(app);

// ✅ Socket.IO with CORS
export const io = new Server(server, {
  cors: {
    origin: [
      "https://forehead-admin.vercel.app",
      "http://localhost:5173",
    ],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("🔌 Socket connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("❌ Socket disconnected:", socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
