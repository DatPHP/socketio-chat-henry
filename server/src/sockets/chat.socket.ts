// src/sockets/chat.socket.ts
// File này định nghĩa TOÀN BỘ hành vi realtime của app: khi nào 1 socket
// join room nào, rời room nào, gửi message ra sao.

import { Server, Socket } from "socket.io";
import {
  getUsersInRoom,
  setUserRoom,
  createMessage,
  findRoomByCode,
} from "../services/room.service";
import { activityLogQueue } from "../queues/activityLog.queue";

// Hàm này được gọi 1 LẦN DUY NHẤT lúc khởi động server (ở index.ts),
// nhận vào `io` (đại diện cả server) để đăng ký lắng nghe connection.
export function registerChatSocketHandlers(io: Server) {
  io.on("connection", (socket: Socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);

    // ============================================
    // EVENT: join_room
    // ============================================
    socket.on(
      "join_room",
      async (payload: { roomCode: string; userId: string; userName: string }) => {
        const { roomCode, userId, userName } = payload;

        const room = await findRoomByCode(roomCode);
        if (!room) {
          // emit trực tiếp vào socket này (KHÔNG dùng io.to) vì lỗi này
          // chỉ liên quan tới riêng người vừa gửi request, không ai khác cần biết
          socket.emit("join_room_error", { message: "Phòng không tồn tại" });
          return;
        }

        // socket.join() là API built-in của Socket.io — gán socket này
        // vào nhóm broadcast tên = roomCode. Từ giờ, mọi io.to(roomCode).emit()
        // sẽ tự động gửi tới socket này.
        socket.join(roomCode);

        // Lưu lại roomCode + userId NGAY TRÊN object socket này
        // (Socket.io cho phép gắn field tùy ý lên socket, giống như 1 object JS
        // bình thường) — để lúc disconnect (không có payload gửi kèm) ta vẫn
        // biết được socket này VỪA thuộc phòng nào, của user nào, để dọn dẹp.
        socket.data.roomCode = roomCode;
        socket.data.userId = userId;
        socket.data.userName = userName; // ✅ lưu luôn userName để dùng khi leave_room 

        // Cập nhật DB: user này đang ở phòng `room.id`
        await setUserRoom(userId, room.id);

        console.log(`👤 ${userName} (${userId}) đã join phòng "${roomCode}"`);

        // "Quăng" job vào queue — LƯU Ý: KHÔNG dùng "await" ở đây.
        // .add() trả về ngay lập tức sau khi đã lưu job vào Redis (rất nhanh,
        // chỉ vài mili-giây), KHÔNG chờ tới lúc worker xử lý xong việc ghi DB.
        // Đây chính là điểm khác biệt cốt lõi so với gọi thẳng
        // "await prisma.activityLog.create(...)".
        activityLogQueue.add("log_event", {
          roomCode,
          userId,
          userName,
          action: "join",
        });

        // Lấy danh sách user MỚI NHẤT trong phòng, gửi cho MỌI người trong
        // phòng (bao gồm cả người vừa join) — io.to(roomCode) = broadcast
        // tới toàn bộ socket đang ở trong nhóm roomCode.
        const users = await getUsersInRoom(room.id);
        io.to(roomCode).emit("room_users_updated", { users });
      }
    );

    // ============================================
    // EVENT: send_message
    // ============================================
    socket.on(
      "send_message",
      async (payload: { roomCode: string; userId: string; content: string }) => {
        const { roomCode, userId, content } = payload;

        if (!content?.trim()) return; // bỏ qua tin nhắn rỗng

        const room = await findRoomByCode(roomCode);
        if (!room) return;

        // Lưu message vào DB TRƯỚC, rồi mới broadcast — đảm bảo dữ liệu
        // đã "chắc chắn tồn tại" trước khi mọi người thấy nó trên UI
        // (tránh trường hợp UI hiện tin nhắn nhưng lưu DB thất bại).
        const message = await createMessage({ roomId: room.id, userId, content });

        // Gửi tin nhắn mới cho TẤT CẢ mọi người trong phòng (bao gồm
        // chính người gửi — để đơn giản hóa logic FE: chỉ cần lắng nghe
        // 1 nguồn duy nhất "new_message" để render, không cần tự thêm
        // tin nhắn của chính mình vào UI ngay lúc gửi).
        io.to(roomCode).emit("new_message", { message });
      }
    );

    // ============================================
    // EVENT: leave_room (chủ động rời phòng, KHÔNG đóng tab)
    // ============================================
    socket.on("leave_room", async (payload: { roomCode: string; userId: string; userName: string }) => {
      await handleUserLeaveRoom(io, socket, payload.roomCode, payload.userId, payload.userName);
    });

    // ============================================
    // EVENT: disconnect (built-in — đóng tab, mất mạng, v.v.)
    // ============================================
    socket.on("disconnect", async (reason) => {
      console.log(`❌ Client disconnected: ${socket.id} — lý do: ${reason}`);
      const { roomCode, userId, userName } = socket.data as {
        roomCode?: string;
        userId?: string;
        userName?: string;
      };
      if (roomCode && userId) {
        await handleUserLeaveRoom(io, socket, roomCode, userId, userName ?? "");
      }
    });
  });
}

// Hàm dùng chung cho cả "leave_room" (chủ động) và "disconnect" (bị động),
// tránh lặp code 2 lần cho cùng 1 logic dọn dẹp.
async function handleUserLeaveRoom(
  io: Server,
  socket: Socket,
  roomCode: string,
  userId: string,
  userName: string // ✅ thêm tham số mới
) {
  socket.leave(roomCode);
  socket.data.roomCode = undefined;
  socket.data.userId = undefined;
  socket.data.userName = undefined;


  try {
    const room = await findRoomByCode(roomCode);
    if (!room) return;

    await setUserRoom(userId, null);

    const users = await getUsersInRoom(room.id);
    io.to(roomCode).emit("room_users_updated", { users });

    activityLogQueue.add("log_event", { roomCode, userId, userName, action: "leave" });

    console.log(`👋 User ${userId} đã rời phòng "${roomCode}"`);
  } catch (error) {
    console.error(`Lỗi khi xử lý leave_room cho user ${userId}:`, error);
  }
}