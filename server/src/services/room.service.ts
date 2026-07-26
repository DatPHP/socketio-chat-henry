// src/services/room.service.ts
// Toàn bộ logic TRUY VẤN DATABASE liên quan tới room/user được gom ở đây,
// KHÔNG import gì từ "socket.io" trong file này — giữ file thuần nghiệp vụ,
// để sau này unit test (Giai đoạn 8) không cần giả lập (mock) socket.

import { prisma } from "../config/prisma";
import { Prisma } from "@prisma/client";

/**
 * Lấy danh sách user đang online trong 1 phòng (dựa vào currentRoomId).
 * Dùng để gửi cho FE hiển thị "đang có ai trong phòng".
 */
export async function getUsersInRoom(roomId: string) {
  return prisma.user.findMany({
    where: { currentRoomId: roomId },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
}

/**
 * Set currentRoomId cho user = roomId (đánh dấu user đang ở phòng này).
 * Bọc try/catch: nếu user không còn tồn tại trong DB (vd do dữ liệu cũ,
 * DB đã bị reset, hoặc userId không hợp lệ), ta CHỈ log cảnh báo thay vì
 * ném lỗi ra ngoài — vì đây là 1 thao tác "dọn dẹp trạng thái", không nên
 * làm sập cả server chỉ vì 1 user không tìm thấy.
 */
export async function setUserRoom(userId: string, roomId: string | null) {
  try {
    return await prisma.user.update({
      where: { id: userId },
      data: { currentRoomId: roomId },
    });
  } catch (error) {
    // P2025 là mã lỗi riêng của Prisma cho trường hợp
    // "Record to update not found" — đúng tình huống ta đang gặp.
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      console.warn(`⚠️ setUserRoom: không tìm thấy user ${userId}, bỏ qua.`);
      return null;
    }
    throw error; // lỗi khác (vd mất kết nối DB) thì vẫn cần ném ra để biết
  }
}

/**
 * Tạo 1 message mới trong DB, trả về kèm thông tin user (để FE hiển thị tên ngay).
 */
export async function createMessage(params: {
  roomId: string;
  userId: string;
  content: string;
}) {
  return prisma.message.create({
    data: {
      roomId: params.roomId,
      userId: params.userId,
      content: params.content,
    },
    include: {
      user: { select: { id: true, name: true } },
    },
  });
}

/**
 * Tìm room bằng code — dùng lại nhiều nơi trong socket handler.
 */
export async function findRoomByCode(roomCode: string) {
  return prisma.room.findUnique({ where: { code: roomCode } });
}