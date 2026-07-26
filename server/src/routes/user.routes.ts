// src/routes/user.routes.ts
// API xử lý việc "join phòng": nhận name + email + roomCode,
// tạo User mới (hoặc cập nhật nếu email đã tồn tại), rồi set currentRoomId.

import { Router } from "express";
import { prisma } from "../config/prisma";

const router = Router();

// POST /api/users/join
// Body: { name: string, email: string, roomCode: string }
router.post("/join", async (req, res) => {
  try {
    const { name, email, roomCode } = req.body;

    // Validate cơ bản — dữ liệu bắt buộc phải có
    if (!name?.trim() || !email?.trim() || !roomCode?.trim()) {
      return res.status(400).json({ error: "Thiếu name, email hoặc roomCode" });
    }

    const room = await prisma.room.findUnique({ where: { code: roomCode } });
    if (!room) {
      return res.status(404).json({ error: "Phòng không tồn tại" });
    }

    // Tìm user theo email — nếu đã từng chat trước đó (cùng email) thì
    // TÁI SỬ DỤNG user cũ (update tên mới nếu có đổi, và set lại phòng hiện tại),
    // thay vì tạo user trùng lặp mỗi lần họ vào lại.
    const existingUser = await prisma.user.findFirst({ where: { email } });

    const user = existingUser
      ? await prisma.user.update({
          where: { id: existingUser.id },
          data: { name, currentRoomId: room.id },
        })
      : await prisma.user.create({
          data: { name, email, currentRoomId: room.id },
        });

    res.json({ user, room });
  } catch (error) {
    console.error("Lỗi khi join phòng:", error);
    res.status(500).json({ error: "Không thể join phòng" });
  }
});

// POST /api/users/:userId/exit
// Dùng khi user chủ động thoát phòng (nút "Exit Room" ở Giai đoạn 6)
router.post("/:userId/exit", async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await prisma.user.update({
      where: { id: userId },
      data: { currentRoomId: null },
    });
    res.json({ user });
  } catch (error) {
    console.error("Lỗi khi exit phòng:", error);
    res.status(500).json({ error: "Không thể thoát phòng" });
  }
});

export default router;