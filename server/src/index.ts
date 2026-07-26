// src/index.ts

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createServer } from "http";
import { Server } from "socket.io";
// Thêm 2 dòng import này ở đầu file, cạnh các import khác
import roomRoutes from "./routes/room.routes";
import messageRoutes from "./routes/message.routes";
import userRoutes from "./routes/user.routes";
import { registerChatSocketHandlers } from "./sockets/chat.socket";
import { startActivityLogWorker } from "./queues/activityLog.worker";


dotenv.config();

const app = express();

// ⚠️ ĐIỂM QUAN TRỌNG:
// Socket.io KHÔNG gắn trực tiếp vào Express app.
// Nó cần 1 raw HTTP server (module "http" của Node) để "móc" (attach) vào,
// vì WebSocket là 1 giao thức nâng cấp (upgrade) từ HTTP thô, không phải
// thứ Express (vốn chỉ xử lý request/response) tự xử lý được.
const httpServer = createServer(app);

const PORT = process.env.PORT || 4000;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:3000";

app.use(cors({ origin: CLIENT_URL }));
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "Server is running 🚀" });
});

app.use("/api/users", userRoutes);
// Gắn 2 nhóm route vào app, có tiền tố /api
app.use("/api/rooms", roomRoutes);
app.use("/api/rooms", messageRoutes);
// Lưu ý: cả 2 dùng chung tiền tố /api/rooms vì:
// - room.routes.ts xử lý  GET /api/rooms
// - message.routes.ts xử lý GET /api/rooms/:roomCode/messages
// Express tự động nối tiếp path, không bị xung đột.

// Khởi tạo Socket.io Server, gắn (attach) vào httpServer ở trên
const io = new Server(httpServer, {
  cors: {
    origin: CLIENT_URL, // chỉ cho phép FE ở địa chỉ này kết nối socket
    methods: ["GET", "POST"],
  },
});

// "connection" là sự kiện built-in: được bắn ra MỖI KHI có 1 client mới
// bắt tay thành công với server. Tham số `socket` đại diện cho đúng
// kết nối của client đó (khác với `io` là đại diện cho TOÀN BỘ server).
registerChatSocketHandlers(io);
startActivityLogWorker();
console.log("🔧 Activity log worker đã khởi động");

// ⚠️ Lưu ý: dùng httpServer.listen(), KHÔNG dùng app.listen() nữa
// vì giờ httpServer mới là thứ đang "ôm" cả Express lẫn Socket.io
httpServer.listen(PORT, () => {
  console.log(`✅ Server (HTTP + Socket.io) listening on http://localhost:${PORT}`);
});