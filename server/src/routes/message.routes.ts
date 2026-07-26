// src/routes/message.routes.ts
// API để FE lấy lịch sử chat cũ khi vừa join vào 1 phòng
// (để user thấy được các tin nhắn đã gửi TRƯỚC khi họ vào phòng).

import { Router } from "express";
import { prisma } from "../config/prisma";

const router = Router();

// GET /api/rooms/:roomCode/messages
// Lấy 50 message gần nhất của phòng, sắp xếp theo thời gian tăng dần
// (cũ -> mới, đúng thứ tự đọc từ trên xuống dưới như 1 cuộc hội thoại thật)
router.get("/:roomCode/messages", async (req, res) => {
  try {
    const { roomCode } = req.params;

    // Tìm phòng bằng `code` (mã public, vd "J6gsak"), KHÔNG dùng `id` nội bộ,
    // vì FE/URL chỉ biết đến `code`, không nên lộ `id` (cuid) ra ngoài.
    const room = await prisma.room.findUnique({ where: { code: roomCode } });

    if (!room) {
      return res.status(404).json({ error: "Không tìm thấy phòng" });
    }

    const messages = await prisma.message.findMany({
      where: { roomId: room.id },
      orderBy: { createdAt: "desc" }, // lấy 50 tin MỚI NHẤT trước...
      take: 50,
      include: {
        user: { select: { id: true, name: true } }, // kèm tên người gửi
      },
    });

    // ...rồi đảo ngược lại thành thứ tự cũ -> mới để hiển thị đúng chiều
    const orderedMessages = messages.reverse();

    res.json({ room, messages: orderedMessages });
  } catch (error) {
    console.error("Lỗi khi lấy lịch sử message:", error);
    res.status(500).json({ error: "Không thể lấy lịch sử tin nhắn" });
  }
});

export default router;